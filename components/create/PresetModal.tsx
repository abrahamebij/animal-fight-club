'use client';

import React, { useEffect } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import Img from '@/components/ui/Img';
import { PRESET_IMAGES } from '@/lib/constants/game';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatar: string;
  onSelectImage: (imagePath: string) => void;
}

export function PresetModal({
  isOpen,
  onClose,
  selectedAvatar,
  onSelectImage,
}: PresetModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (imagePath: string) => {
    onSelectImage(imagePath);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-3xl bg-background border border-divider shadow-2xl p-6 relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-divider pb-3">
          <h2 className="font-headline font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-primary">
            CHOOSE PRESET
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-divider hover:bg-primary hover:text-background transition-colors text-primary cursor-pointer"
            aria-label="Close modal"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PRESET_IMAGES.map((imagePath) => {
            const isSelected = selectedAvatar === imagePath;

            return (
              <button
                type="button"
                key={imagePath}
                onClick={() => handleSelect(imagePath)}
                className={`relative aspect-square w-full border overflow-hidden transition-all duration-150 cursor-pointer group bg-zinc-950 ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-divider hover:border-primary opacity-80 hover:opacity-100'
                }`}
              >
                <Img
                  src={imagePath}
                  alt="Preset image"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />

                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-primary text-background p-1 z-10">
                    <FiCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
