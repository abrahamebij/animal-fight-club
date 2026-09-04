'use client';

import React from 'react';
import Link from 'next/link';
import { Battle } from '@/lib/types';

interface BeastMatchHistoryProps {
  battles: Battle[];
  currentBeastId: string;
}

export function BeastMatchHistory({ battles, currentBeastId }: BeastMatchHistoryProps) {
  return (
    <div className="border border-divider p-6 bg-background space-y-4">
      <div className="border-b border-divider pb-2 font-mono text-xs text-secondary font-bold uppercase">
        RECENT COMBAT ENCOUNTERS ({battles.length})
      </div>

      {battles.length === 0 ? (
        <div className="py-8 text-center font-mono text-xs text-secondary">
          No past combat logs recorded for this beast yet.
        </div>
      ) : (
        <div className="space-y-2">
          {battles.map((b) => {
            const isA = b.beastA.id === currentBeastId;
            const opponent = isA ? b.beastB : b.beastA;
            const won = b.status === 'completed' && ((isA && b.winner === 'beastA') || (!isA && b.winner === 'beastB'));

            return (
              <Link
                key={b.id}
                href={`/battle/${b.id}`}
                className="border border-divider p-3 bg-surface-container-low flex items-center justify-between font-mono text-xs hover:border-primary transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${won ? 'text-primary' : 'text-danger'}`}>
                    {b.status === 'completed' ? (won ? 'VICTORY' : 'DEFEAT') : 'IN PROGRESS'}
                  </span>
                  <span className="text-secondary">VS {opponent.name}</span>
                </div>
                <span className="text-primary underline">VIEW DUEL</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
