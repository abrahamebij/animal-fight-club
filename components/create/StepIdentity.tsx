'use client';

import React from 'react';
import { FiUploadCloud, FiRefreshCw, FiCheck } from 'react-icons/fi';
import Img from '@/components/ui/Img';
import { AVATAR_PRESETS } from '@/lib/constants/game';

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

        {/* Combatant Avatar Selection: Presets + Custom Upload */}
        <div className="space-y-3">
          <label className="block font-mono text-xs uppercase tracking-wider text-primary font-bold">
            COMBATANT AVATAR (CHOOSE PRESET OR UPLOAD CUSTOM)
          </label>
          
          {/* Presets Grid */}
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = selectedAvatar === preset.imageUrl;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => onSelectAvatar(preset.imageUrl)}
                  className={`relative aspect-square border overflow-hidden transition-all group cursor-pointer ${
                    isSelected ? 'border-primary ring-2 ring-primary' : 'border-divider hover:border-primary opacity-75 hover:opacity-100'
                  }`}
                  title={preset.name}
                >
                  <Img
                    src={preset.imageUrl}
                    alt={preset.name}
                    fill
                    className="object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-primary text-background p-0.5 z-10">
                      <FiCheck className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* ImgBB Custom Image Upload Box */}
          <div
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-3 text-center cursor-pointer transition-colors flex items-center justify-center gap-3 relative overflow-hidden bg-surface-container-low ${
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

            {isUploading ? (
              <FiRefreshCw className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
            ) : (
              <FiUploadCloud className="w-5 h-5 text-secondary flex-shrink-0" />
            )}
            <div className="text-left font-mono">
              <p className="text-xs text-primary font-bold">
                {isUploading ? 'UPLOADING TO IMGBB...' : 'OR UPLOAD CUSTOM AVATAR'}
              </p>
              <p className="text-[10px] text-secondary">Supports PNG, JPG, WEBP up to 32MB</p>
            </div>
          </div>

          {uploadError && (
            <p className="font-mono text-xs text-danger mt-1">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
