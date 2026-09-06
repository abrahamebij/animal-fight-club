'use client';

import React, { useState } from 'react';
import { FiUploadCloud, FiRefreshCw, FiCheck, FiLayers } from 'react-icons/fi';
import Img from '@/components/ui/Img';
import { PresetModal } from './PresetModal';

interface StepIdentityProps {
  name: string;
  onChangeName: (name: string) => void;
  description: string;
  onChangeDescription: (desc: string) => void;
  selectedAvatar: string;
  onSelectAvatar: (url: string) => void;
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
  onSelectAvatar,
  isUploading,
  uploadError,
  dragActive,
  onDrag,
  onDrop,
  onFileInputChange,
  fileInputRef,
}: StepIdentityProps) {
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  return (
    <div className="forge-panel border border-divider p-6 bg-background space-y-6">
      <div className="flex items-center justify-between border-b border-divider pb-3">
        <span className="font-mono text-xs text-secondary font-bold">STEP 01 - IDENTITY</span>
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

        {/* Combatant Avatar (Preset or Custom) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block font-mono text-xs uppercase tracking-wider text-primary font-bold">
              COMBATANT AVATAR *
            </label>
           
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileInputChange}
          />

          {selectedAvatar ? (
            <div className="border border-divider p-4 bg-surface-container-low flex flex-col sm:flex-row items-center gap-4">
              <div className="relative aspect-square w-24 h-24 border border-divider overflow-hidden bg-zinc-900 flex-shrink-0">
                <Img
                  src={selectedAvatar}
                  alt="Avatar Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 font-mono text-center sm:text-left space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-primary font-bold uppercase">
                  <FiCheck className="w-4 h-4 text-primary" />
                  <span>AVATAR SELECTED</span>
                </div>
                <p className="text-[11px] text-secondary">
                  Combatant image selected and ready for arena deployment.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsPresetModalOpen(true)}
                    className="px-3 py-1.5 bg-primary text-background text-xs font-bold uppercase hover:bg-secondary transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FiLayers className="w-3.5 h-3.5" />
                    <span>SELECT PRESET</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-1.5 border border-divider text-xs text-primary font-bold uppercase hover:border-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 bg-background"
                  >
                    {isUploading ? (
                      <>
                        <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>UPLOADING...</span>
                      </>
                    ) : (
                      <>
                        <FiUploadCloud className="w-3.5 h-3.5 text-secondary" />
                        <span>UPLOAD CUSTOM</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAvatar('')}
                    disabled={isUploading}
                    className="px-3 py-1.5 border border-divider text-xs text-secondary hover:text-danger hover:border-danger transition-colors cursor-pointer"
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Preset Selector Card */}
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(true)}
                className="w-full border-2 border-dashed border-primary/50 hover:border-primary bg-primary/5 hover:bg-primary/10 p-5 text-left cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border border-primary/40 bg-background flex items-center justify-center text-primary group-hover:scale-105 transition-transform flex-shrink-0">
                    <FiLayers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-headline font-bold text-sm text-primary uppercase tracking-wide">
                      SELECT PRESET
                    </div>
                    <div className="font-mono text-[11px] text-secondary mt-0.5">
                      Choose an image from presets
                    </div>
                  </div>
                </div>
                <span className="hidden sm:inline-block font-mono text-xs font-bold text-primary uppercase border border-primary px-3 py-1 bg-background group-hover:bg-primary group-hover:text-background transition-colors">
                  CHOOSE PRESET &rarr;
                </span>
              </button>

              {/* Upload Dropzone */}
              <div
                onDragEnter={onDrag}
                onDragLeave={onDrag}
                onDragOver={onDrag}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 relative overflow-hidden bg-surface-container-low ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-divider hover:border-primary'
                }`}
              >
                {isUploading ? (
                  <FiRefreshCw className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <FiUploadCloud className="w-6 h-6 text-secondary" />
                )}
                <div className="font-mono text-center">
                  <p className="text-xs text-primary font-bold uppercase">
                    {isUploading ? 'UPLOADING TO IMGBB...' : 'OR UPLOAD CUSTOM AVATAR IMAGE'}
                  </p>
                  <p className="text-[10px] text-secondary mt-0.5">
                    Click or drag image file (PNG, JPG, WEBP)
                  </p>
                </div>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="font-mono text-xs text-danger mt-1">{uploadError}</p>
          )}
        </div>
      </div>

      <PresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        selectedAvatar={selectedAvatar}
        onSelectImage={(imagePath) => onSelectAvatar(imagePath)}
      />
    </div>
  );
}
