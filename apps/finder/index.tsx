import React, { useEffect, useState } from 'react';
import { fs, FileInfo } from '@hmac/core';

const FinderApp = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    try {
      // Initialize FS if needed (should be done globally really)
      await fs.init();
      const list = await fs.list(currentPath);
      setFiles(list);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b border-gray-200">
        <button onClick={() => setCurrentPath('/')}>Home</button>
        <span className="text-sm text-gray-500">{currentPath}</span>
      </div>
      <div className="flex-1 p-4 grid grid-cols-4 gap-4 content-start">
        {files.map((file) => (
          <div key={file.path} className="flex flex-col items-center gap-2 p-2 hover:bg-blue-50 rounded cursor-pointer">
            <div className={`w-12 h-12 ${file.type === 'directory' ? 'bg-blue-200' : 'bg-gray-200'} rounded`}></div>
            <span className="text-xs text-center truncate w-full">{file.name}</span>
          </div>
        ))}
        {files.length === 0 && <div className="text-gray-400 col-span-4 text-center mt-10">Folder is empty</div>}
      </div>
    </div>
  );
};

export default FinderApp;
