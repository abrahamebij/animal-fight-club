'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiCrosshair } from 'react-icons/fi';
import { Battle } from '@/lib/types';
import Img from '@/components/ui/Img';

interface FeaturedLiveDuelProps {
  battle: Battle | null;
}

export function FeaturedLiveDuel({ battle }: FeaturedLiveDuelProps) {
  if (!battle) return null;

  return (
    <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 py-12">
      <div className="border border-divider p-6 lg:p-8 bg-surface-container-low space-y-6">
        <div className="flex items-center justify-between border-b border-divider pb-3">
          <div className="flex items-center gap-2 font-mono text-xs text-primary font-bold">
            <span className="w-2.5 h-2.5 bg-secondary animate-pulse" />
            <span>FEATURED ARENA DUEL: {battle.beastA.name} VS {battle.beastB.name}</span>
          </div>
          <Link
            href={`/battle/${battle.id}`}
            className="font-mono text-xs text-primary underline hover:text-secondary inline-flex items-center gap-1 font-bold"
          >
            <span>WATCH LIVE COMBAT</span>
            <FiCrosshair className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="flex items-center gap-4 p-4 border border-divider bg-background">
            <div className="relative w-20 h-20 border border-divider overflow-hidden bg-zinc-900">
              <Img src={battle.beastA.avatarUrl} alt={battle.beastA.name} fill className="object-cover" />
            </div>
            <div>
              <div className="font-mono text-xs text-secondary font-bold">ALPHA COMBATANT</div>
              <div className="font-headline font-extrabold text-2xl uppercase text-primary">{battle.beastA.name}</div>
              <div className="font-mono text-xs text-secondary">PWR: {battle.beastA.stats.power} | DEF: {battle.beastA.stats.defense}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border border-divider bg-background">
            <div className="relative w-20 h-20 border border-divider overflow-hidden bg-zinc-900">
              <Img src={battle.beastB.avatarUrl} alt={battle.beastB.name} fill className="object-cover" />
            </div>
            <div>
              <div className="font-mono text-xs text-secondary font-bold">BRAVO COMBATANT</div>
              <div className="font-headline font-extrabold text-2xl uppercase text-primary">{battle.beastB.name}</div>
              <div className="font-mono text-xs text-secondary">PWR: {battle.beastB.stats.power} | DEF: {battle.beastB.stats.defense}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
