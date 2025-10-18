import React from 'react';

interface FileDownloadProps {
  fileName: string;
  filePath: string;
  fileSize?: number;
  downloadUrl: string;
  className?: string;
}

export default function FileDownload({ 
  fileName, 
  filePath, 
  fileSize, 
  downloadUrl,
  className = "btn btn-outline-primary btn-sm"
}: FileDownloadProps) {
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `(${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]})`;
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'bi-file-earmark-pdf text-danger';
      case 'doc':
      case 'docx':
        return 'bi-file-earmark-word text-primary';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'bi-file-earmark-image text-success';
      default:
        return 'bi-file-earmark text-secondary';
    }
  };

  const handleDownload = async () => {
    try {
      // Debug logging
      console.log('🔍 Download Debug Info:');
      console.log('File Name:', fileName);
      console.log('File Path:', filePath);
      console.log('Download URL:', downloadUrl);
      console.log('File Size:', fileSize);
      console.log('Authorization Token:', localStorage.getItem('token') ? 'Present' : 'Not present');
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` || '',
        },
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response OK:', response.ok);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response Error:', errorText);
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      // Create blob and download
      const blob = await response.blob();
      console.log('📦 Blob Size:', blob.size);
      console.log('📦 Blob Type:', blob.type);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      console.log('✅ Download initiated successfully');
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <i className={`bi ${getFileIcon(fileName)}`}></i>
      <div className="flex-grow-1">
        <div className="fw-semibold">{fileName}</div>
        {fileSize && (
          <small className="text-muted">{formatFileSize(fileSize)}</small>
        )}
      </div>
      <button 
        className={className}
        onClick={handleDownload}
        title="Download Certificate"
      >
        <i className="bi bi-download me-1"></i>
        Download
      </button>
    </div>
  );
}
