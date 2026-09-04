'use client';

import React from 'react';
import { BeastStats } from '@/lib/types';
import { STAT_BUDGET } from '@/lib/constants/game';

interface StepAttributesProps {
  stats: BeastStats;
  remainingPoints: number;
  onStatChange: (statKey: keyof BeastStats, delta: number) => void;
}

export function StepAttributes({
  stats,
  remainingPoints,
  onStatChange,
}: StepAttributesProps) {
  const statConfig: { key: keyof BeastStats; label: string; desc: string }[] = [
    { key: 'power', label: 'POWER', desc: 'Direct kinetic & thermal strike force output.' },
    { key: 'defense', label: 'DEFENSE', desc: 'Damage mitigation plating and armor shielding.' },
    { key: 'speed', label: 'SPEED', desc: 'Initiative priority and dodge acceleration.' },
    { key: 'special', label: 'SPECIAL', desc: 'Overclocked combat energy discharge multiplier.' },
  ];

  return (
    <div className="forge-panel border border-divider p-6 bg-background space-y-6">
      <div className="flex items-center justify-between border-b border-divider pb-3">
        <span className="font-mono text-xs text-secondary font-bold">STEP 02 // STAT ALLOCATION MATRIX</span>
        <span className="font-mono text-xs font-bold text-primary">
          REMAINING: {remainingPoints} / {STAT_BUDGET.TOTAL_POINTS} PTS
        </span>
      </div>

      <div className="space-y-4">
        {statConfig.map(({ key, label, desc }) => (
          <div key={key} className="border border-divider p-3 bg-surface-container-low flex items-center justify-between gap-4 font-mono">
            <div className="space-y-0.5">
              <div className="font-bold text-sm text-primary">{label}</div>
              <div className="text-[11px] text-secondary">{desc}</div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onStatChange(key, -1)}
                disabled={stats[key] <= STAT_BUDGET.MIN_PER_STAT}
                className="w-8 h-8 bg-background border border-divider font-bold text-sm text-primary disabled:opacity-30 hover:border-primary transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="w-6 text-center font-headline font-extrabold text-lg text-primary">
                {stats[key]}
              </span>
              <button
                type="button"
                onClick={() => onStatChange(key, 1)}
                disabled={stats[key] >= STAT_BUDGET.MAX_PER_STAT || remainingPoints <= 0}
                className="w-8 h-8 bg-background border border-divider font-bold text-sm text-primary disabled:opacity-30 hover:border-primary transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
