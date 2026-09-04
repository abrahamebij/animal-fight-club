'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight } from 'react-icons/fi';
import { Beast } from '@/lib/types';
import Img from '@/components/ui/Img';

interface TopCombatantsSectionProps {
  beasts: Beast[];
}

export function TopCombatantsSection({ beasts }: TopCombatantsSectionProps) {
  return (
    <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 py-16 border-t border-divider">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-secondary font-bold uppercase mb-1">PROVING GROUNDS</div>
          <h2 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-primary">
            APEX COMBATANTS
          </h2>
        </div>
        <Link
          href="/leaderboard"
          className="font-mono text-xs text-primary underline hover:text-secondary inline-flex items-center gap-1 font-bold"
        >
          <span>VIEW FULL RANKINGS</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {beasts.slice(0, 4).map((beast) => (
          <Link
            key={beast.id}
            href={`/beast/${beast.id}`}
            className="beast-card border border-divider p-5 bg-background space-y-4 hover:border-primary transition-colors block"
          >
            <div className="relative aspect-square w-full border border-divider overflow-hidden bg-zinc-900">
              <Img src={beast.avatarUrl} alt={beast.name} fill className="object-cover" />
              {beast.boundAsset && (
                <div className="absolute top-2 right-2 bg-primary text-background font-mono text-[10px] font-bold px-2 py-0.5">
                  {beast.boundAsset}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-headline font-extrabold text-xl uppercase text-primary truncate">{beast.name}</h3>
              <div className="font-mono text-xs text-secondary">
                RECORD: {beast.record.wins}W - {beast.record.losses}L
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px] border-t border-divider pt-3">
              <div className="bg-surface-container-low p-1">
                <div className="text-[9px] text-secondary">PWR</div>
                <div className="font-bold">{beast.stats.power}</div>
              </div>
              <div className="bg-surface-container-low p-1">
                <div className="text-[9px] text-secondary">DEF</div>
                <div className="font-bold">{beast.stats.defense}</div>
              </div>
              <div className="bg-surface-container-low p-1">
                <div className="text-[9px] text-secondary">SPD</div>
                <div className="font-bold">{beast.stats.speed}</div>
              </div>
              <div className="bg-surface-container-low p-1">
                <div className="text-[9px] text-secondary">SPC</div>
                <div className="font-bold">{beast.stats.special}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
