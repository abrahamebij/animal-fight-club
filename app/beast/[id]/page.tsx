'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FiCrosshair, 
  FiArrowLeft,
} from 'react-icons/fi';
import { MOCK_BEASTS, MOCK_BATTLES } from '@/lib/mockData';
import { AVAILABLE_PERKS } from '@/lib/constants/game';

export default function BeastProfilePage() {
  const params = useParams();
  const beastId = (params?.id as string) || 'beast_kong_01';

  const beast = MOCK_BEASTS.find((b) => b.id === beastId) || MOCK_BEASTS[0];
  const beastBattles = MOCK_BATTLES.filter(
    (b) => b.beastA.id === beast.id || b.beastB.id === beast.id
  );

  const winRate = beast.record.wins + beast.record.losses > 0
    ? Math.round((beast.record.wins / (beast.record.wins + beast.record.losses)) * 100)
    : 0;

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      {/* Top Breadcrumb */}
      <div className="border-b border-primary bg-background">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-14 flex items-center justify-between font-mono text-xs">
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>BACK TO LEADERBOARD</span>
          </Link>
          <span className="text-secondary">GENETIC IDENTITY // {beast.id}</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Portrait & Identity (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-primary p-6 bg-background space-y-6">
              <div className="relative aspect-square w-full border border-primary overflow-hidden bg-zinc-900">
                <Image
                  src={beast.avatarUrl}
                  alt={beast.name}
                  fill
                  className="object-cover"
                  priority
                />
                {beast.boundAsset && (
                  <div className="absolute top-3 right-3 bg-primary text-background font-mono text-xs font-bold px-3 py-1 border border-background/30">
                    {beast.boundAsset} BOUND
                  </div>
                )}
              </div>

              <div>
                <h1 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-primary">
                  {beast.name}
                </h1>
                <p className="font-sans text-sm text-secondary mt-2 leading-relaxed">
                  {beast.description}
                </p>
              </div>

              <div className="border-t border-primary pt-4 font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-secondary">OWNER:</span>
                  <span className="font-bold">{beast.ownerAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">CREATED:</span>
                  <span>{new Date(beast.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Link
                href="/arena"
                className="w-full py-4 bg-primary text-background font-headline font-extrabold text-lg text-center uppercase tracking-wider hover:bg-secondary transition-colors border border-primary flex items-center justify-center gap-2 block"
              >
                <FiCrosshair className="w-5 h-5" />
                <span>CHALLENGE TO DUEL</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Stats, Perks, Record (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Record & Stats */}
            <div className="border border-primary p-6 bg-background space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  COMBAT ATTRIBUTES & RECORD
                </h2>
                <div className="font-mono text-xs font-bold text-primary">
                  {winRate}% WIN RATE
                </div>
              </div>

              {/* Record Cards */}
              <div className="grid grid-cols-3 gap-4 font-mono text-xs text-center">
                <div className="border border-primary p-3 bg-surface-container-low">
                  <span className="text-secondary block text-[10px]">VICTORIES</span>
                  <span className="font-headline font-extrabold text-2xl text-primary">{beast.record.wins}</span>
                </div>
                <div className="border border-primary p-3 bg-surface-container-low">
                  <span className="text-secondary block text-[10px]">DEFEATS</span>
                  <span className="font-headline font-extrabold text-2xl text-secondary">{beast.record.losses}</span>
                </div>
                <div className="border border-primary p-3 bg-surface-container-low">
                  <span className="text-secondary block text-[10px]">TOTAL DUELS</span>
                  <span className="font-headline font-extrabold text-2xl text-primary">
                    {beast.record.wins + beast.record.losses}
                  </span>
                </div>
              </div>

              {/* Stat Progress Bars */}
              <div className="space-y-4 font-mono text-xs border-t border-neutral pt-4">
                {(['power', 'defense', 'speed', 'special'] as const).map((statKey) => {
                  const val = beast.stats[statKey];
                  return (
                    <div key={statKey} className="space-y-1">
                      <div className="flex justify-between font-bold uppercase">
                        <span className="text-secondary">{statKey}</span>
                        <span>{val} / 10</span>
                      </div>
                      <div className="w-full h-3 bg-neutral border border-primary p-0.5">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(val / 10) * 100}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equipped Perks */}
            <div className="border border-primary p-6 bg-background space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  EQUIPPED TACTICAL PERKS
                </h2>
                <span className="font-mono text-xs text-secondary">ACTIVE PASSIVES</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {beast.perks.map((perkId) => {
                  const perk = AVAILABLE_PERKS.find((p) => p.id === perkId);
                  if (!perk) return null;
                  return (
                    <div key={perkId} className="border border-primary p-4 bg-surface-container-low space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-bold text-base uppercase text-primary">
                          {perk.name}
                        </span>
                        <span className="font-mono text-[10px] bg-primary text-background px-2 py-0.5 font-bold">
                          {perk.category}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-secondary">
                        {perk.description}
                      </p>
                      <div className="font-mono text-[11px] font-bold text-primary">
                        {perk.effectSummary}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Battles List */}
            <div className="border border-primary p-6 bg-background space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  RECENT COMBAT RECORD
                </h2>
                <span className="font-mono text-xs text-secondary">ENCOUNTER LOGS</span>
              </div>

              {beastBattles.length > 0 ? (
                <div className="space-y-3 font-mono text-xs">
                  {beastBattles.map((b) => (
                    <div key={b.id} className="border border-neutral p-3 flex items-center justify-between bg-surface-container-low">
                      <div className="space-y-0.5">
                        <div className="font-bold text-primary">
                          VS {b.beastA.id === beast.id ? b.beastB.name : b.beastA.name}
                        </div>
                        <div className="text-[11px] text-secondary">
                          STATUS: {b.status.toUpperCase()}
                        </div>
                      </div>
                      <Link
                        href={`/battle/${b.id}`}
                        className="px-3 py-1.5 bg-primary text-background font-bold uppercase hover:bg-secondary transition-colors"
                      >
                        Inspect
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-xs text-secondary">No prior battle logs found for this beast.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
