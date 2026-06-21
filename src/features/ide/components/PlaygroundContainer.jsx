import { useState, useEffect, useRef, useMemo } from 'react';
import debounce from 'lodash.debounce';

import { CodeEditor } from './CodeEditor';
import { AddFileModal } from './AddFileModal';
import { DeleteFileModal } from './DeleteFileModal';
import { buildPreviewHtml } from '../../../utils/htmlUtils';

const DEFAULT_FILES = [
  {
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DevDive Playground</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>DevDive Playground</h1>
  <p>Welcome to your coding sandbox!</p>
  <button id="counter-btn">Count: 0</button>
  
  <script src="script.js"></script>
</body>
</html>
`
  },
  {
    name: 'styles.css',
    language: 'css',
    content: `button {
  background-color: #22d3ee;
  color: #0f172a;
  border: none;
  padding: 8px 16px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
button:hover {
  background-color: #06b6d4;
}
`
  },
  {
    name: 'script.js',
    language: 'javascript',
    content: `let count = 0;
const button = document.getElementById("counter-btn");

if (button) {
  button.addEventListener("click", () => {
    count++;
    button.textContent = \`Count: \${count}\`;
  });
}
`
  }
];

export function PlaygroundContainer() {
  // --- STATE ---
  const [files, setFiles] = useState([]);
  const [activeFileName, setActiveFileName] = useState('');
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Keep a ref to current files for the debounced save
  const filesRef = useRef(files);

  // Update ref when files change
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Create stable debounced save function
  const debouncedSaveToLocalStorage = useMemo(
    () => debounce((currentFiles) => {
      if (currentFiles.length > 0) {
        try {
          localStorage.setItem('devdive_playground_code_v2', JSON.stringify(currentFiles));
        } catch (e) {
          console.error('Failed to save playground to localStorage', e);
        }
      }
    }, 1000),
    []
  );

  // Hydrate files from Local Storage on mount
  useEffect(() => {
    const cachedStr = localStorage.getItem('devdive_playground_code_v2');
    let initialData = DEFAULT_FILES;

    if (cachedStr) {
      try {
        const cachedFiles = JSON.parse(cachedStr);
        if (Array.isArray(cachedFiles) && cachedFiles.length > 0) {
          initialData = cachedFiles;
        }
      } catch (e) {
        console.error('Failed to parse cached playground files', e);
      }
    }

    setFiles(initialData);
    if (initialData.length > 0) {
      // Find index.html or select first file
      const indexFile = initialData.find(f => f.name === 'index.html');
      setActiveFileName(indexFile ? indexFile.name : initialData[0].name);
    }
  }, []);

  const activeFile = files.find(f => f.name === activeFileName);

  const handleEditorChange = (value) => {
    const updatedFiles = files.map(file => 
      file.name === activeFileName ? { ...file, content: value } : file
    );
    setFiles(updatedFiles);
    debouncedSaveToLocalStorage(updatedFiles);
  };

  const handleAddFile = (finalFileName, fileType) => {
    const newFile = {
      name: finalFileName,
      language: fileType,
      content: fileType === 'javascript' 
        ? `/* New JS file */\nconsole.log("${finalFileName} loaded!");\n`
        : fileType === 'css'
        ? `/* New CSS file */\n`
        : `<!-- New HTML file -->\n`,
    };
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setActiveFileName(finalFileName);
    setIsAddModalOpen(false);
    debouncedSaveToLocalStorage(updatedFiles);
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
        // Fall back to index.html or first available file
        const indexFile = updatedFiles.find(f => f.name === 'index.html');
        setActiveFileName(indexFile ? indexFile.name : updatedFiles[0].name);
      }
      debouncedSaveToLocalStorage(updatedFiles);
    }
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };

  const handlePreview = () => {
    if (currentPreviewUrl) {
      URL.revokeObjectURL(currentPreviewUrl);
    }
    const masterHtml = buildPreviewHtml(files);
    const blob = new Blob([masterHtml], { type: 'text/html' });
    const previewUrl = URL.createObjectURL(blob);
    setCurrentPreviewUrl(previewUrl);
    window.open(previewUrl, '_blank');
  };

  return (
    <div className="flex flex-1 w-full bg-gray-950 text-gray-200 overflow-hidden relative">
      <CodeEditor
        files={files}
        activeFileName={activeFileName}
        activeFile={activeFile}
        onTabChange={setActiveFileName}
        onEditorChange={handleEditorChange}
        onAddFile={() => setIsAddModalOpen(true)}
        onDeleteClick={handleDeleteClick}
        onPreview={handlePreview}
        showSidebarToggle={false}
        showSubmit={false}
      />

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
