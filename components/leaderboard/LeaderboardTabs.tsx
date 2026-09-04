'use client';

import React from 'react';
import { FiAward, FiTrendingUp } from 'react-icons/fi';

interface LeaderboardTabsProps {
  tab: 'beasts' | 'bettors';
  onTabChange: (tab: 'beasts' | 'bettors') => void;
}

export function LeaderboardTabs({ tab, onTabChange }: LeaderboardTabsProps) {
  return (
    <div className="flex gap-2 border-b border-divider pb-4 font-mono text-xs">
      <button
        onClick={() => onTabChange('beasts')}
        className={`px-6 py-3 border transition-colors inline-flex items-center gap-2 cursor-pointer ${
          tab === 'beasts'
            ? 'bg-primary text-background border-primary font-bold'
            : 'bg-surface-container-low text-primary border-divider hover:border-primary'
        }`}
      >
        <FiAward className="w-4 h-4" />
        <span>APEX BEASTS (COMBAT WINNERS)</span>
      </button>

      <button
        onClick={() => onTabChange('bettors')}
        className={`px-6 py-3 border transition-colors inline-flex items-center gap-2 cursor-pointer ${
          tab === 'bettors'
            ? 'bg-primary text-background border-primary font-bold'
            : 'bg-surface-container-low text-primary border-divider hover:border-primary'
        }`}
      >
        <FiTrendingUp className="w-4 h-4" />
        <span>TOP SPECTATORS (WAGERING ACCURACY)</span>
      </button>
    </div>
  );
}
