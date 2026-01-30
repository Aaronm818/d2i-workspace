'use client';

import { useState, useRef } from 'react';
import { Icons } from '@/components/ui/Icons';

interface Upload {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  uploadedBy: {
    name: string;
    avatar: string;
  };
}

interface FileUploadSectionProps {
  initialUploads: Upload[];
}

export function FileUploadSection({ initialUploads }: FileUploadSectionProps) {
  const [uploads, setUploads] = useState<Upload[]>(initialUploads);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);

    for (const file of Array.from(files)) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large. Maximum size is 5MB.`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', 'default');

        const res = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setUploads((prev) => [data.upload, ...prev]);
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to upload file');
        }
      } catch (err) {
        setError('Failed to upload file');
      }
    }

    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const deleteUpload = async (uploadId: string) => {
    try {
      const res = await fetch(`/api/uploads?uploadId=${uploadId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUploads((prev) => prev.filter((u) => u.id !== uploadId));
      }
    } catch (err) {
      console.error('Failed to delete upload:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('json')) return '📋';
    if (fileType.includes('text')) return '📃';
    return '📁';
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-d2i-navy/90 to-d2i-navy-dark/90 border border-d2i-teal/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Discovery Phase</h2>
          <p className="text-sm text-d2i-cyan/80">
            Upload transcripts, workflows, or images to generate mockups and divide work
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-d2i-cyan bg-d2i-cyan/10'
            : 'border-d2i-teal/40 hover:border-d2i-cyan/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.json,.csv,.png,.jpg,.jpeg,.gif,.xlsx,.xls"
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: isDragging
                ? 'linear-gradient(135deg, #00737F 0%, #25E2CC 100%)'
                : '#003D5A',
            }}
          >
            <Icons.Upload className={isDragging ? 'text-white' : 'text-d2i-cyan'} />
          </div>
          <div>
            <p className="text-white font-medium">
              {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
            </p>
            <p className="text-sm text-white/50 mt-1">
              PDF, Word, Excel, Images, JSON, CSV (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded files list */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-medium text-white/70">Recent Uploads</h3>
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center justify-between p-3 rounded-xl bg-d2i-navy-dark/50 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{getFileIcon(upload.fileType)}</span>
                <div>
                  <p className="text-sm text-white truncate max-w-xs">{upload.filename}</p>
                  <p className="text-xs text-white/50">
                    {formatFileSize(upload.fileSize)} • Uploaded by {upload.uploadedBy.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => deleteUpload(upload.id)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
              >
                <Icons.Trash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
