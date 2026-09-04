'use client';

import React from 'react';
import { BattleStatus } from '@/lib/types';

interface ArenaFilterBarProps {
  filter: 'all' | BattleStatus;
  onFilterChange: (f: 'all' | BattleStatus) => void;
  liveCount: number;
  pendingCount: number;
  completedCount: number;
}

export function ArenaFilterBar({
  filter,
  onFilterChange,
  liveCount,
  pendingCount,
  completedCount,
}: ArenaFilterBarProps) {
  const tabs: { key: 'all' | BattleStatus; label: string; count?: number }[] = [
    { key: 'all', label: 'ALL DUELS' },
    { key: 'live', label: 'LIVE COMBAT', count: liveCount },
    { key: 'pending', label: 'WAGERING OPEN', count: pendingCount },
    { key: 'completed', label: 'COMPLETED', count: completedCount },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-divider pb-4 font-mono text-xs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={`px-4 py-2 border transition-colors cursor-pointer ${
            filter === tab.key
              ? 'bg-primary text-background border-primary font-bold'
              : 'bg-surface-container-low text-primary border-divider hover:border-primary'
          }`}
        >
          <span>{tab.label}</span>
          {typeof tab.count === 'number' && (
            <span className="ml-1.5 opacity-70">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
