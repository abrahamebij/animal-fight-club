'use client';

import React from 'react';
import { Beast } from '@/lib/types';
import { AVAILABLE_PERKS } from '@/lib/constants/game';

interface BeastStatsCardProps {
  beast: Beast;
}

export function BeastStatsCard({ beast }: BeastStatsCardProps) {
  const statRows: { label: string; value: number }[] = [
    { label: 'POWER', value: beast.stats.power },
    { label: 'DEFENSE', value: beast.stats.defense },
    { label: 'SPEED', value: beast.stats.speed },
    { label: 'SPECIAL', value: beast.stats.special },
  ];

  return (
    <div className="border border-divider p-6 bg-background space-y-6">
      <div className="border-b border-divider pb-2 font-mono text-xs text-secondary font-bold uppercase">
        GENETIC ATTRIBUTES & PERKS
      </div>

      <div className="space-y-4 font-mono text-xs">
        {statRows.map((s) => (
          <div key={s.label} className="space-y-1">
            <div className="flex justify-between font-bold">
              <span>{s.label}</span>
              <span className="text-primary">{s.value} / 20</span>
            </div>
            <div className="w-full h-2.5 bg-neutral border border-divider">
              <div className="h-full bg-primary" style={{ width: `${(s.value / 20) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-divider pt-4 space-y-2">
        <div className="font-mono text-xs text-secondary font-bold uppercase">ACTIVE PERKS</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {beast.perks.map((pId) => {
            const p = AVAILABLE_PERKS.find((item) => item.id === pId);
            return (
              <div key={pId} className="border border-divider p-3 bg-surface-container-low font-mono text-xs">
                <div className="font-bold text-primary uppercase">{p?.name || pId}</div>
                <div className="text-[11px] text-secondary mt-0.5">{p?.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
