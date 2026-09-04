'use client';

import React from 'react';
import Image from 'next/image';
import { FiCrosshair } from 'react-icons/fi';
import { Beast } from '@/lib/types';
import Img from '@/components/ui/Img';

interface BeastProfileHeaderProps {
  beast: Beast;
  onOpenChallenge: () => void;
  isOwner: boolean;
}

export function BeastProfileHeader({
  beast,
  onOpenChallenge,
  isOwner,
}: BeastProfileHeaderProps) {
  const winRate = beast.record.wins + beast.record.losses > 0
    ? Math.round((beast.record.wins / (beast.record.wins + beast.record.losses)) * 100)
    : 0;

  return (
    <div className="beast-col-left lg:col-span-5 border border-divider p-6 lg:p-8 bg-background space-y-6">
      <div className="relative aspect-square w-full border border-divider overflow-hidden bg-zinc-900">
        <Img src={beast.avatarUrl} alt={beast.name} fill className="object-cover" priority />
        {beast.boundAsset && (
          <div className="absolute top-3 right-3 bg-primary text-background font-mono text-xs font-bold px-3 py-1">
            {beast.boundAsset} BOUND
          </div>
        )}
      </div>

      <div>
        <div className="font-mono text-xs text-secondary mb-1">DESIGNATION: {beast.id.slice(0, 12)}</div>
        <h1 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-primary truncate">
          {beast.name}
        </h1>
        <div className="font-mono text-xs text-secondary mt-1 truncate">
          OWNER: {beast.ownerAddress}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-center border-t border-divider pt-4">
        <div className="bg-surface-container-low p-2">
          <div className="text-[10px] text-secondary">WINS</div>
          <div className="font-bold text-lg text-primary">{beast.record.wins}</div>
        </div>
        <div className="bg-surface-container-low p-2">
          <div className="text-[10px] text-secondary">LOSSES</div>
          <div className="font-bold text-lg text-primary">{beast.record.losses}</div>
        </div>
        <div className="bg-surface-container-low p-2">
          <div className="text-[10px] text-secondary">WIN RATE</div>
          <div className="font-bold text-lg text-primary">{winRate}%</div>
        </div>
      </div>

      {!isOwner && (
        <button
          onClick={onOpenChallenge}
          className="w-full py-4 bg-primary text-background font-headline font-bold text-base uppercase tracking-wider hover:bg-secondary transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <FiCrosshair className="w-5 h-5" />
          <span>CHALLENGE THIS BEAST</span>
        </button>
      )}
    </div>
  );
}
