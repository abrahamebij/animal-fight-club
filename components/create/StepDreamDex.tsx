'use client';

import React from 'react';
import { BoundAsset } from '@/lib/types';
import { BOUND_ASSET_OPTIONS } from '@/lib/constants/game';

interface StepDreamDexProps {
  boundAsset: BoundAsset;
  onSelectBoundAsset: (asset: BoundAsset) => void;
}

export function StepDreamDex({ boundAsset, onSelectBoundAsset }: StepDreamDexProps) {
  return (
    <div className="forge-panel border border-divider p-6 bg-background space-y-6">
      <div className="flex items-center justify-between border-b border-divider pb-3">
        <span className="font-mono text-xs text-secondary font-bold">STEP 04 // DREAMDEX MARKET PULSE</span>
        <span className="font-mono text-xs text-secondary font-bold">OPTIONAL BINDING</span>
      </div>

      <p className="font-sans text-xs text-secondary leading-relaxed">
        Binding your beast to a DreamDEX financial event asset (e.g. BTC, ETH, SOM) automatically ties its live combat performance to real-world prediction probabilities.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        {BOUND_ASSET_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelectBoundAsset(opt.value)}
            className={`p-3 border text-center transition-colors cursor-pointer ${
              boundAsset === opt.value
                ? 'bg-primary text-background border-primary font-bold'
                : 'bg-surface-container-low text-primary border-divider hover:border-primary'
            }`}
          >
            <div className="text-sm font-bold">{opt.label}</div>
            <div className="text-[10px] opacity-70">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
