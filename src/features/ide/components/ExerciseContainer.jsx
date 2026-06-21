import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import debounce from 'lodash.debounce';

import { ProblemSidebar } from './ProblemSidebar';
import { CodeEditor } from './CodeEditor';
import { ResultsSidebar } from './ResultsSidebar';
import { AddFileModal } from './AddFileModal';
import { DeleteFileModal } from './DeleteFileModal';
import { buildPreviewHtml, injectCSS } from '../../../utils/htmlUtils';
import { useAuth } from '../../../core/contexts/AuthContext';
import { fetchExerciseConfig } from '../../../services/courseService';
import { evaluateCode as evaluateCodeService } from '../../../services/evaluationService';

export function ExerciseContainer({ groupExercise, onGroupSubmit }) {
  const { exerciseId } = useParams();
  const currentId = groupExercise ? groupExercise.id : exerciseId;
  const { user } = useAuth();

  // --- STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [exerciseConfig, setExerciseConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [files, setFiles] = useState([]);
  const [activeFileName, setActiveFileName] = useState('');
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);

  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    codebase: true,
    visual: true,
  });

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Keep a ref to current files for the debounced save
  const filesRef = useRef(files);

  // --- EFFECTS ---

  // Update ref when files change
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Create a stable debounced save function using lodash.debounce
  const debouncedSaveToLocalStorage = useMemo(
    () => debounce((currentFiles, currentId) => {
      if (currentFiles.length > 0) {
        try {
          localStorage.setItem(`devdive_saved_code_${currentId}`, JSON.stringify(currentFiles));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
      }
    }, 1000),
    []
  );

  useEffect(() => {
    // Initial data fetch and hydration
    const loadExercise = async () => {
      setIsLoading(true);
      try {
        let config;
        
        if (groupExercise) {
          config = {
            title: groupExercise.title || 'Group Task',
            unitId: null,
            description: groupExercise.task_description,
            initialFiles: groupExercise.starter_files
          };
        } else {
          const exercise = await fetchExerciseConfig(exerciseId);
          config = {
            title: exercise.lessons?.title || 'Exercise',
            unitId: exercise.lessons?.unit_id,
            description: exercise.task_description,
            initialFiles: exercise.starter_files
          };
        }

        setExerciseConfig(config);

        // Hydrate from localStorage if exists, otherwise use initialFiles
        const cachedStr = localStorage.getItem(`devdive_saved_code_${currentId}`);
        let initialData = config.initialFiles;

        if (cachedStr) {
          try {
            const cachedFiles = JSON.parse(cachedStr);
            if (Array.isArray(cachedFiles) && cachedFiles.length > 0) {
              initialData = cachedFiles;
            }
          } catch (e) {
            console.error('Failed to parse cached files', e);
          }
        }

        setFiles(initialData);
        if (initialData.length > 0) {
          setActiveFileName(initialData[0].name);
        }
      } catch (error) {
        console.error('Error loading exercise:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercise();
  }, [exerciseId, groupExercise, currentId]);

  // Sidebar resize
  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e) => {
      const newWidth = Math.max(300, Math.min(e.clientX, window.innerWidth * 0.6));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Cooldown Timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  // --- HANDLERS ---
  const activeFile = files.find(f => f.name === activeFileName);

  const handleEditorChange = (value) => {
    const updatedFiles = files.map(file =>
      file.name === activeFileName ? { ...file, content: value } : file
    );
    setFiles(updatedFiles);
    // Trigger debounced save
    debouncedSaveToLocalStorage(updatedFiles, currentId);
  };

  const handleAddFile = (finalFileName, fileType) => {
    const newFile = {
      name: finalFileName,
      language: fileType,
      content: `/* New ${fileType} file */\n`,
    };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setActiveFileName(finalFileName);
    setIsAddModalOpen(false);
    debouncedSaveToLocalStorage(updatedFiles, currentId);
  };

  const handleDeleteClick = (fileName) => {
    setFileToDelete(fileName);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fileToDelete && files.length > 1 && fileToDelete !== 'index.html') {
      const updatedFiles = files.filter((f) => f.name !== fileToDelete);
      setFiles(updatedFiles);
      if (activeFileName === fileToDelete) {
        setActiveFileName(updatedFiles[0].name);
      }
      debouncedSaveToLocalStorage(updatedFiles, currentId);
    }
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };

  const handlePreview = () => {
    if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
    const masterHtml = buildPreviewHtml(files);
    const blob = new Blob([masterHtml], { type: 'text/html' });
    const previewUrl = URL.createObjectURL(blob);
    setCurrentPreviewUrl(previewUrl);
    window.open(previewUrl, '_blank');
  };

  const evaluateCode = async (isResubmit = false) => {
    setShowResults(true);
    if (feedback && !isResubmit) return;

    setIsEvaluating(true);

    try {
      const htmlFile = files.find(f => f.name === 'index.html');
      let htmlContent = htmlFile?.content || '';
      // Inject CSS
      htmlContent = injectCSS(htmlContent, files);

      let data;
      if (groupExercise && onGroupSubmit) {
        const payloadHtml = files.find(f => f.language === 'html')?.content || '';
        const payloadCss = files.find(f => f.language === 'css')?.content || '';
        const payloadJs = files.find(f => f.language === 'javascript' || f.language === 'js')?.content || '';
        data = await onGroupSubmit({ html: payloadHtml, css: payloadCss, js: payloadJs });
      } else {
        data = await evaluateCodeService(user?.id, exerciseConfig?.unitId, exerciseId, htmlContent);
      }

      setFeedback(data);
    } catch (error) {
      console.error('Evaluation error:', error);
      setFeedback({
        error: 'Failed to evaluate code. ' + error.message,
        codeEvaluation: [],
        visualEvaluation: [],
        screenshot: null,
        overallHint: null,
        score: 0,
        isPassed: false
      });
    } finally {
      setIsEvaluating(false);
      setCooldownRemaining(10);
    }
  };

  const handleSubmit = () => evaluateCode(false);
  const handleResubmit = () => evaluateCode(true);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 w-full items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading exercise...</p>
        </div>
      </div>
    );
  }

  // Calculate scores using backend-provided points
  const codePointsPerReq = feedback?.codePointsPerReq || 0;
  const visualPointsPerReq = feedback?.visualPointsPerReq || 0;
  const codeScore = feedback?.codeEvaluation?.filter(e => e.passed).length * codePointsPerReq || 0;
  const visualScore = feedback?.visualEvaluation?.filter(e => e.passed).length * visualPointsPerReq || 0;

  return (
    <div className="flex flex-1 w-full bg-gray-950 text-gray-200 overflow-hidden relative">
      <ProblemSidebar
        exerciseConfig={exerciseConfig}
        isSidebarOpen={isSidebarOpen}
        sidebarWidth={sidebarWidth}
        isResizing={isResizing}
        onResizeStart={() => setIsResizing(true)}
      />

      <CodeEditor
        files={files}
        activeFileName={activeFileName}
        activeFile={activeFile}
        onTabChange={setActiveFileName}
        onEditorChange={handleEditorChange}
        onAddFile={() => setIsAddModalOpen(true)}
        onDeleteClick={handleDeleteClick}
        onPreview={handlePreview}
        onSubmit={handleSubmit}
        isEvaluating={isEvaluating}
        cooldownRemaining={cooldownRemaining}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {showResults && (
        <ResultsSidebar
          feedback={feedback}
          isEvaluating={isEvaluating}
          cooldownRemaining={cooldownRemaining}
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
          onClose={() => setShowResults(false)}
          onResubmit={handleResubmit}
          codeScore={codeScore}
          visualScore={visualScore}
          codePointsPerReq={codePointsPerReq}
          visualPointsPerReq={visualPointsPerReq}
        />
      )}

      {isAddModalOpen && (
        <AddFileModal
          files={files}
          onConfirm={handleAddFile}
          onCancel={() => setIsAddModalOpen(false)}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteFileModal
          fileName={fileToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}

      {/* Guest Lock Overlay */}
      {!user && (
        <div
          className="absolute top-0 right-0 bottom-0 z-40 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md transition-all duration-300 select-none"
          style={{ left: isSidebarOpen ? sidebarWidth : 0 }}
        >
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 space-y-6 text-center mx-4">
            <div className="w-16 h-16 bg-[#22D3EE]/10 rounded-2xl flex items-center justify-center mx-auto text-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Sign In Required</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                To start coding and get AI feedback on this exercise, please sign in or create a free account.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <a
                href={`/login?redirect=${groupExercise ? `/groups/${groupExercise.group_id}/exercise/${currentId}` : `/exercise/${exerciseId}`}`}
                className="w-full py-3 bg-[#22D3EE] hover:bg-cyan-300 text-slate-900 rounded-lg transition-all shadow-lg shadow-cyan-500/20 text-sm font-bold flex items-center justify-center"
              >
                Sign In
              </a>
              <a
                href={`/signup?redirect=${groupExercise ? `/groups/${groupExercise.group_id}/exercise/${currentId}` : `/exercise/${exerciseId}`}`}
                className="w-full py-3 border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 text-gray-300 hover:text-white rounded-lg transition-colors text-sm font-semibold flex items-center justify-center"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
