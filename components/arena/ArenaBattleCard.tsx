'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiCrosshair } from 'react-icons/fi';
import { Battle } from '@/lib/types';
import { useCountdown } from '@/hooks/useCountdown';
import Img from '@/components/ui/Img';

interface ArenaBattleCardProps {
  battle: Battle;
}

export function ArenaBattleCard({ battle }: ArenaBattleCardProps) {
  const isLive = battle.status === 'live';
  const isPending = battle.status === 'pending';
  const countdown = useCountdown(isPending ? battle.bettingWindowClosesAt : null);

  return (
    <div className="battle-card border border-divider p-6 bg-background space-y-6 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-divider pb-2 font-mono text-xs">
          <span className="text-secondary font-bold">MATCH ID: {battle.id.slice(0, 10)}</span>
          <span className={`font-bold ${isLive ? 'text-primary animate-pulse' : 'text-secondary'}`}>
            {isLive ? 'LIVE' : isPending ? (countdown?.formatted || 'PENDING') : 'CONCLUDED'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 items-center">
          <div className="text-center space-y-2">
            <div className="relative aspect-square w-full border border-divider overflow-hidden bg-zinc-900">
              <Img src={battle.beastA.avatarUrl} alt={battle.beastA.name} fill className="object-cover" />
            </div>
            <div className="font-headline font-bold text-sm uppercase text-primary truncate">{battle.beastA.name}</div>
          </div>

          <div className="text-center space-y-2">
            <div className="relative aspect-square w-full border border-divider overflow-hidden bg-zinc-900">
              <Img src={battle.beastB.avatarUrl} alt={battle.beastB.name} fill className="object-cover" />
            </div>
            <div className="font-headline font-bold text-sm uppercase text-primary truncate">{battle.beastB.name}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-xs border-t border-divider pt-3">
          <div className="bg-surface-container-low p-2 text-center">
            <div className="text-[10px] text-secondary uppercase">{battle.beastA.name} POOL</div>
            <div className="font-bold text-primary">{battle.totalPoolA || 0} STT</div>
          </div>
          <div className="bg-surface-container-low p-2 text-center">
            <div className="text-[10px] text-secondary uppercase">{battle.beastB.name} POOL</div>
            <div className="font-bold text-primary">{battle.totalPoolB || 0} STT</div>
          </div>
        </div>
      </div>

      <Link
        href={`/battle/${battle.id}`}
        className="w-full py-3 bg-primary text-background font-headline font-bold text-sm uppercase tracking-wider hover:bg-secondary transition-colors text-center border border-primary block"
      >
        {isPending ? 'SPECTATE & WAGER' : 'VIEW ARENA DUEL'}
      </Link>
    </div>
  );
}
