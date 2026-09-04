'use client';

import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { AVAILABLE_PERKS } from '@/lib/constants/game';

interface StepPerksProps {
  selectedPerks: string[];
  onTogglePerk: (perkId: string) => void;
}

export function StepPerks({ selectedPerks, onTogglePerk }: StepPerksProps) {
  return (
    <div className="forge-panel border border-divider p-6 bg-background space-y-6">
      <div className="flex items-center justify-between border-b border-divider pb-3">
        <span className="font-mono text-xs text-secondary font-bold">STEP 03 // TACTICAL PERKS</span>
        <span className="font-mono text-xs font-bold text-primary">
          SELECTED: {selectedPerks.length} / 2 MAX
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AVAILABLE_PERKS.map((perk) => {
          const isSelected = selectedPerks.includes(perk.id);
          return (
            <button
              key={perk.id}
              type="button"
              onClick={() => onTogglePerk(perk.id)}
              className={`p-4 border text-left font-mono transition-colors relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-primary text-background border-primary'
                  : 'bg-surface-container-low text-primary border-divider hover:border-primary'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between font-bold text-sm uppercase">
                  <span>{perk.name}</span>
                  {isSelected && <FiCheck className="w-4 h-4" />}
                </div>
                <p className={`text-xs ${isSelected ? 'text-background/80' : 'text-secondary'}`}>
                  {perk.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
