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

export function ExerciseContainer() {
  const { exerciseId } = useParams();
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
        // Fetch exercise configuration
        const [unitPart, exercisePart] = exerciseId.split('_');
        const res = await fetch(`/curriculum/${unitPart}/${exercisePart}/exercise.json`);
        if (!res.ok) throw new Error('Exercise not found');
        const config = await res.json();
        setExerciseConfig(config);

        // Hydrate from localStorage if exists, otherwise use initialFiles
        const cachedStr = localStorage.getItem(`devdive_saved_code_${exerciseId}`);
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
  }, [exerciseId]);

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

  // --- HANDLERS ---
  const activeFile = files.find(f => f.name === activeFileName);

  const handleEditorChange = (value) => {
    const updatedFiles = files.map(file => 
      file.name === activeFileName ? { ...file, content: value } : file
    );
    setFiles(updatedFiles);
    // Trigger debounced save
    debouncedSaveToLocalStorage(updatedFiles, exerciseId);
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
    debouncedSaveToLocalStorage(updatedFiles, exerciseId);
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
      debouncedSaveToLocalStorage(updatedFiles, exerciseId);
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

      const [unitPart] = exerciseId.split('_');
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          unitId: unitPart,
          exerciseId: exerciseId,
          code: { html: htmlContent },
          aiRubric: exerciseConfig?.aiRubric || {},
          captureScreens: ['desktop']
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Evaluation failed');
      
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
    }
  };

  const handleSubmit = () => evaluateCode(false);
  const handleResubmit = () => evaluateCode(true);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading exercise...</p>
        </div>
      </div>
    );
  }

  // Calculate scores
  const codePointsPerReq = exerciseConfig?.aiRubric?.codeRequirements?.length ? 50 / exerciseConfig.aiRubric.codeRequirements.length : 0;
  const visualPointsPerReq = exerciseConfig?.aiRubric?.visualRequirements?.length ? 50 / exerciseConfig.aiRubric.visualRequirements.length : 0;
  const codeScore = feedback?.codeEvaluation?.filter(e => e.passed).length * codePointsPerReq || 0;
  const visualScore = feedback?.visualEvaluation?.filter(e => e.passed).length * visualPointsPerReq || 0;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-gray-950 text-gray-200 overflow-hidden relative">
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
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {showResults && (
        <ResultsSidebar
          feedback={feedback}
          isEvaluating={isEvaluating}
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
    </div>
  );
}
