import React, { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export default function FileUpload({ 
  onFileSelect, 
  accept = ".pdf,.doc,.docx", 
  maxSizeMB = 10,
  disabled = false 
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (file: File) => {
    setError('');
    
    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setError(`File type not allowed. Accepted types: ${accept}`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="mb-3">
      <div
        className={`border border-2 border-dashed rounded p-4 text-center ${
          dragOver ? 'border-primary bg-light' : 'border-secondary'
        } ${disabled ? 'opacity-50' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <i className="bi bi-cloud-upload fs-1 text-secondary mb-2"></i>
        <p className="mb-2">
          {dragOver ? 'Drop file here' : 'Drag and drop file here or'}
        </p>
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="d-none"
          id="fileInput"
        />
        <label 
          htmlFor="fileInput" 
          className={`btn btn-outline-primary ${disabled ? 'disabled' : ''}`}
        >
          Browse Files
        </label>
        <p className="text-muted small mt-2">
          Accepted formats: {accept} (Max size: {maxSizeMB}MB)
        </p>
      </div>
      
      {error && (
        <div className="alert alert-danger mt-2 py-2">
          <small>{error}</small>
        </div>
      )}
    </div>
  );
}
