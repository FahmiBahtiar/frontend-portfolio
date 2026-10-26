'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, X, Image as ImageIcon, Loader2, FileText, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  aspectRatio?: string;
  disabled?: boolean;
  allowPdf?: boolean;
  onUploadStateChange?: (isUploading: boolean) => void;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  description = 'Click to upload or drag and drop',
  aspectRatio = '16/9',
  disabled = false,
  allowPdf = false,
  onUploadStateChange,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with value prop
  useEffect(() => {
    setPreview(value);
  }, [value]);

  const isPdf = Boolean(
    preview &&
      (preview.toLowerCase().endsWith('.pdf') ||
        preview.includes('.pdf?') ||
        preview.startsWith('data:application/pdf'))
  );
  const isCloudinaryPdf = isPdf && Boolean(preview?.includes('res.cloudinary.com'));
  const displayImageUrl = isCloudinaryPdf ? preview?.replace(/\.pdf(\?.*)?$/i, '.jpg$1') : preview;

  const handleFileChange = async (file: File) => {
    if (disabled) return;

    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isFilePdf =
      allowPdf && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));

    // Validate file type
    if (!isImage && !isFilePdf) {
      alert(allowPdf ? 'Please upload an image file or PDF document' : 'Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    onUploadStateChange?.(true);

    try {
      if (isImage) {
        // Create local preview for image
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // Placeholder preview for PDF until uploaded
        setPreview('data:application/pdf;base64,' + file.name);
      }

      // Upload to backend
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success) {
        setPreview(result.data.url);
        onChange(result.data.url);
      } else {
        throw new Error(result.message || 'Upload failed');
      }

      setIsUploading(false);
      onUploadStateChange?.(false);
    } catch (error) {
      setIsUploading(false);
      onUploadStateChange?.(false);
      alert('Failed to upload file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-[#0c282d]">
          {label}
        </label>
      )}

      {preview ? (
        <div className="relative group">
          <div
            className="relative overflow-hidden rounded-xl border-2 border-[#B9E7E6] bg-white shadow-xs"
            style={{ aspectRatio }}
          >
            {isPdf && !isCloudinaryPdf ? (
              // Non-Cloudinary PDF fallback preview
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#E2F4F3]/30 text-center">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#B9E7E6] flex items-center justify-center mb-2 shadow-xs">
                  <FileText className="w-6 h-6 text-[#0891b2]" />
                </div>
                <span className="text-xs font-bold text-[#0c282d] font-mono uppercase tracking-wider mb-1">
                  PDF Certificate Ready
                </span>
                <span className="text-[11px] text-[#527d85] truncate max-w-[220px] mb-2 font-mono">
                  {preview.startsWith('data:') ? 'Document Loaded' : preview}
                </span>
                {!preview.startsWith('data:') && (
                  <a
                    href={preview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#B9E7E6] text-xs font-bold text-[#0891b2] hover:bg-[#E2F4F3] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open PDF Document
                  </a>
                )}
              </div>
            ) : (
              // Image or Cloudinary Rasterized PDF Page 1
              <>
                <Image
                  src={displayImageUrl as string}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
                {isPdf && (
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#0c282d]/80 text-white font-mono text-[10px] font-bold tracking-wider backdrop-blur-sm">
                    PDF DOC
                  </div>
                )}
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <motion.div
          onDragOver={disabled ? undefined : handleDragOver}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onDrop={disabled ? undefined : handleDrop}
          onClick={disabled ? undefined : () => fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all ${
            disabled
              ? 'border-[#B9E7E6] bg-[#E2F4F3]/20 cursor-not-allowed opacity-50'
              : isDragging
              ? 'border-[#6FD4E1] bg-[#E2F4F3] cursor-pointer'
              : 'border-[#B9E7E6] hover:border-[#6FD4E1] bg-white hover:bg-[#E2F4F3]/30 cursor-pointer shadow-sm'
          }`}
          style={{ aspectRatio }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-[#0891b2] animate-spin" />
                <p className="text-sm text-[#527d85] font-semibold">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#E2F4F3] border border-[#B9E7E6] flex items-center justify-center shadow-sm">
                  {allowPdf ? (
                    <FileText className="w-8 h-8 text-[#0891b2]" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-[#0891b2]" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-[#0c282d] font-bold mb-1">
                    {disabled ? 'Click "Edit Card" to upload' : description}
                  </p>
                  <p className="text-xs text-[#527d85] font-medium">
                    {disabled
                      ? 'Upload disabled'
                      : allowPdf
                      ? 'PNG, JPG, WEBP, or PDF up to 5MB'
                      : 'PNG, JPG, GIF up to 5MB'}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm ${
                    disabled
                      ? 'bg-slate-100 border border-slate-200'
                      : 'bg-[#E2F4F3] border border-[#B9E7E6]'
                  }`}
                >
                  <Upload className={`w-4 h-4 ${disabled ? 'text-[#527d85]' : 'text-[#0891b2]'}`} />
                  <span
                    className={`text-sm font-bold ${
                      disabled ? 'text-[#527d85]' : 'text-[#0891b2]'
                    }`}
                  >
                    {disabled ? 'Disabled' : 'Choose File'}
                  </span>
                </div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={allowPdf ? 'image/*,application/pdf' : 'image/*'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileChange(file);
            }}
            className="hidden"
          />
        </motion.div>
      )}
    </div>
  );
}