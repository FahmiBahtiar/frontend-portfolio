'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  aspectRatio?: string;
  disabled?: boolean;
  onUploadStateChange?: (isUploading: boolean) => void;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  description = 'Click to upload or drag and drop',
  aspectRatio = '16/9',
  disabled = false,
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

  const handleFileChange = async (file: File) => {
    if (disabled) return; // Prevent upload when disabled
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    onUploadStateChange?.(true); // Notify parent that upload started

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

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
        onChange(result.data.url);
      } else {
        throw new Error(result.message || 'Upload failed');
      }

      setIsUploading(false);
      onUploadStateChange?.(false); // Notify parent that upload finished
    } catch (error) {
      setIsUploading(false);
      onUploadStateChange?.(false); // Notify parent that upload finished with error
      alert('Failed to upload image');
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
            className="relative overflow-hidden rounded-xl border-2 border-[#B9E7E6]"
            style={{ aspectRatio }}
          >
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
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
                  <ImageIcon className="w-8 h-8 text-[#0891b2]" />
                </div>
                <div className="text-center">
                  <p className="text-[#0c282d] font-bold mb-1">
                    {disabled ? 'Click "Edit Card" to upload photo' : description}
                  </p>
                  <p className="text-xs text-[#527d85] font-medium">
                    {disabled ? 'Upload disabled' : 'PNG, JPG, GIF up to 5MB'}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm ${
                  disabled 
                    ? 'bg-slate-100 border border-slate-200' 
                    : 'bg-[#E2F4F3] border border-[#B9E7E6]'
                }`}>
                  <Upload className={`w-4 h-4 ${disabled ? 'text-[#527d85]' : 'text-[#0891b2]'}`} />
                  <span className={`text-sm font-bold ${
                    disabled ? 'text-[#527d85]' : 'text-[#0891b2]'
                  }`}>
                    {disabled ? 'Disabled' : 'Choose File'}
                  </span>
                </div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
