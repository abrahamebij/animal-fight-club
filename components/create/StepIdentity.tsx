'use client';

import React from 'react';
import Image from 'next/image';
import { FiUploadCloud, FiRefreshCw } from 'react-icons/fi';
import Img from '@/components/ui/Img';

interface StepIdentityProps {
  name: string;
  onChangeName: (name: string) => void;
  description: string;
  onChangeDescription: (desc: string) => void;
  selectedAvatar: string;
  isUploading: boolean;
  uploadError: string | null;
  dragActive: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function StepIdentity({
  name,
  onChangeName,
  description,
  onChangeDescription,
  selectedAvatar,
  isUploading,
  uploadError,
  dragActive,
  onDrag,
  onDrop,
  onFileInputChange,
  fileInputRef,
}: StepIdentityProps) {
  return (
    <div className="forge-panel border border-divider p-6 bg-background space-y-6">
      <div className="flex items-center justify-between border-b border-divider pb-3">
        <span className="font-mono text-xs text-secondary font-bold">STEP 01 // IDENTITY MATRIX</span>
        <span className="font-mono text-xs text-secondary font-bold">MANDATORY</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-1.5 font-bold">
            BEAST DESIGNATION (NAME) *
          </label>
          <input
            type="text"
            required
            maxLength={24}
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            className="w-full bg-surface-container-low border border-divider p-3 font-mono font-bold text-lg text-primary focus:outline-none focus:border-primary uppercase"
            placeholder="e.g. CYBER GRIFFIN"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-1.5 font-bold">
            TACTICAL LORE & DIRECTIVES
          </label>
          <textarea
            rows={3}
            maxLength={180}
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            className="w-full bg-surface-container-low border border-divider p-3 font-mono text-xs text-primary focus:outline-none focus:border-primary resize-none"
            placeholder="Autonomous combat agent trained in high-frequency close-quarter counters..."
          />
        </div>

        {/* ImgBB Image Upload Box */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-1.5 font-bold">
            CUSTOM AVATAR UPLOAD (IMGBB CLOUD)
          </label>
          
          <div
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 relative overflow-hidden bg-surface-container-low ${
              dragActive ? 'border-primary bg-primary/5' : 'border-divider hover:border-primary'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileInputChange}
            />

            {selectedAvatar ? (
              <div className="relative w-28 h-28 aspect-square border border-divider overflow-hidden bg-zinc-900 my-1">
                <Img
                  src={selectedAvatar}
                  alt="Uploaded Avatar"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="py-4 space-y-1">
                {isUploading ? (
                  <FiRefreshCw className="w-8 h-8 mx-auto text-primary animate-spin" />
                ) : (
                  <FiUploadCloud className="w-8 h-8 mx-auto text-secondary" />
                )}
                <p className="font-mono text-xs text-primary font-bold">
                  {isUploading ? 'UPLOADING TO IMGBB...' : 'CLICK OR DRAG IMAGE FILE TO UPLOAD'}
                </p>
                <p className="font-mono text-[10px] text-secondary">
                  Supports PNG, JPG, WEBP up to 32MB
                </p>
              </div>
            )}
          </div>

          {uploadError && (
            <p className="font-mono text-xs text-danger mt-1">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
