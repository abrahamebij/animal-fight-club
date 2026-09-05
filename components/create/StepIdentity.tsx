'use client';

import React from 'react';
import { FiUploadCloud, FiRefreshCw, FiCheck } from 'react-icons/fi';
import Img from '@/components/ui/Img';

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

        {/* Combatant Avatar Upload */}
        <div className="space-y-3">
          <label className="block font-mono text-xs uppercase tracking-wider text-primary font-bold">
            COMBATANT AVATAR (UPLOAD CUSTOM IMAGE) *
          </label>

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
                  alt="Custom Avatar Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 font-mono text-center sm:text-left space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-primary font-bold uppercase">
                  <FiCheck className="w-4 h-4 text-primary" />
                  <span>Custom Avatar Uploaded</span>
                </div>
                <p className="text-[11px] text-secondary">
                  Combatant image stored and ready for arena deployment.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-1.5 bg-primary text-background text-xs font-bold uppercase hover:bg-secondary transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isUploading ? (
                      <>
                        <FiRefreshCw className="w-3 h-3 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FiUploadCloud className="w-3.5 h-3.5" />
                        <span>Replace Image</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectAvatar('')}
                    disabled={isUploading}
                    className="px-3 py-1.5 border border-divider text-xs text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 relative overflow-hidden bg-surface-container-low ${
                dragActive ? 'border-primary bg-primary/5' : 'border-divider hover:border-primary'
              }`}
            >
              {isUploading ? (
                <FiRefreshCw className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <FiUploadCloud className="w-8 h-8 text-secondary" />
              )}
              <div className="font-mono text-center">
                <p className="text-xs text-primary font-bold uppercase">
                  {isUploading ? 'UPLOADING TO IMGBB...' : 'CLICK OR DRAG AVATAR TO UPLOAD *'}
                </p>
                <p className="text-[11px] text-secondary mt-1">
                  Supports PNG, JPG, WEBP (Square format recommended)
                </p>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="font-mono text-xs text-danger mt-1">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
