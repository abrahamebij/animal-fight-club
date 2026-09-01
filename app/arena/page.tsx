'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiCrosshair, 
  FiZap, 
  FiClock, 
  FiCheckCircle, 
  FiPlusSquare, 
  FiActivity, 
  FiTrendingUp, 
  FiFilter,
  FiShield
} from 'react-icons/fi';
import { MOCK_BATTLES } from '@/lib/mockData';
import { BattleStatus } from '@/lib/types';

export default function ArenaPage() {
  const [filter, setFilter] = useState<'all' | BattleStatus>('all');

  const filteredBattles = MOCK_BATTLES.filter((battle) => {
    if (filter === 'all') return true;
    return battle.status === filter;
  });

  const liveCount = MOCK_BATTLES.filter((b) => b.status === 'live').length;
  const pendingCount = MOCK_BATTLES.filter((b) => b.status === 'pending').length;
  const completedCount = MOCK_BATTLES.filter((b) => b.status === 'completed').length;

  return (
    <div className="flex flex-col w-full bg-[#FAFAF8] min-h-screen text-[#0A0A0B] pb-24">
      {/* Header Banner */}
      <section className="border-b border-[#0A0A0B] bg-[#FAFAF8] pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#0A0A0B] text-[#FAFAF8] font-mono text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 bg-[#DC2626]" />
                <span>ARENA DISPATCH GRID</span>
              </div>
              <h1 className="font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0B]">
                THE COMBAT ARENA
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#5D5F5D] max-w-2xl leading-relaxed">
                Live agentic combat encounters and pending wagering windows on Somnia Shannon. Spectators can bet on beast outcomes during active 1-hour windows.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/create"
                className="px-6 py-3 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-bold text-sm uppercase tracking-wider hover:bg-[#FAFAF8] hover:text-[#0A0A0B] border border-[#0A0A0B] transition-colors inline-flex items-center gap-2"
              >
                <FiPlusSquare className="w-4 h-4" />
                <span>Create Beast</span>
              </Link>
              <button
                disabled
                className="px-6 py-3 bg-[#E5E5E1] text-[#5D5F5D] font-headline font-bold text-sm uppercase tracking-wider border border-[#C7C6CA] cursor-not-allowed inline-flex items-center gap-2"
                title="Auto-matchmaking coming soon"
              >
                <FiCrosshair className="w-4 h-4" />
                <span>Auto-Match (Coming Soon)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="border-b border-[#0A0A0B] bg-[#FAFAF8] sticky top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 py-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border transition-colors ${
                filter === 'all'
                  ? 'bg-[#0A0A0B] text-[#FAFAF8] border-[#0A0A0B]'
                  : 'bg-transparent text-[#5D5F5D] border-transparent hover:border-[#0A0A0B] hover:text-[#0A0A0B]'
              }`}
            >
              ALL BATTLES ({MOCK_BATTLES.length})
            </button>

            <button
              onClick={() => setFilter('live')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border flex items-center gap-2 transition-colors ${
                filter === 'live'
                  ? 'bg-[#DC2626] text-white border-[#DC2626]'
                  : 'bg-transparent text-[#DC2626] border-transparent hover:border-[#DC2626]'
              }`}
            >
              <span className="w-2 h-2 bg-[#DC2626] rounded-none animate-pulse" />
              <span>LIVE COMBAT ({liveCount})</span>
            </button>

            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border flex items-center gap-2 transition-colors ${
                filter === 'pending'
                  ? 'bg-[#F59E0B] text-[#0A0A0B] font-bold border-[#F59E0B]'
                  : 'bg-transparent text-[#5D5F5D] border-transparent hover:border-[#0A0A0B] hover:text-[#0A0A0B]'
              }`}
            >
              <FiClock className="w-3.5 h-3.5" />
              <span>PENDING BETTING ({pendingCount})</span>
            </button>

            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border flex items-center gap-2 transition-colors ${
                filter === 'completed'
                  ? 'bg-[#0A0A0B] text-[#FAFAF8] border-[#0A0A0B]'
                  : 'bg-transparent text-[#5D5F5D] border-transparent hover:border-[#0A0A0B] hover:text-[#0A0A0B]'
              }`}
            >
              <FiCheckCircle className="w-3.5 h-3.5" />
              <span>COMPLETED ({completedCount})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Battles Grid */}
      <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBattles.map((battle) => {
            const isLive = battle.status === 'live';
            const isPending = battle.status === 'pending';
            const isCompleted = battle.status === 'completed';

            return (
              <div 
                key={battle.id}
                className={`border p-6 flex flex-col justify-between gap-6 bg-[#FAFAF8] ${
                  isLive 
                    ? 'border-2 border-[#DC2626]' 
                    : 'border-[#0A0A0B]'
                }`}
              >
                {/* Header Status */}
                <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-3">
                  <div className="flex items-center gap-2">
                    {isLive && (
                      <>
                        <span className="w-2.5 h-2.5 bg-[#DC2626] animate-pulse" />
                        <span className="font-headline font-bold text-base uppercase text-[#DC2626]">
                          LIVE COMBAT
                        </span>
                      </>
                    )}
                    {isPending && (
                      <>
                        <span className="w-2.5 h-2.5 bg-[#F59E0B]" />
                        <span className="font-headline font-bold text-base uppercase text-[#0A0A0B]">
                          WAGERING OPEN
                        </span>
                      </>
                    )}
                    {isCompleted && (
                      <>
                        <FiCheckCircle className="w-4 h-4 text-[#5D5F5D]" />
                        <span className="font-headline font-bold text-base uppercase text-[#5D5F5D]">
                          CONCLUDED
                        </span>
                      </>
                    )}
                  </div>
                  <span className="font-mono text-xs text-[#5D5F5D]">
                    ID: {battle.id.slice(0, 10)}
                  </span>
                </div>

                {/* Matchup Center */}
                <div className="grid grid-cols-5 items-center gap-2 py-2">
                  {/* Beast A */}
                  <div className="col-span-2 text-center space-y-2">
                    <div className="relative aspect-square w-20 mx-auto border border-[#0A0A0B] overflow-hidden bg-zinc-900">
                      <Image
                        src={battle.beastA.avatarUrl}
                        alt={battle.beastA.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="font-headline font-bold text-sm leading-tight uppercase truncate">
                      {battle.beastA.name}
                    </div>
                    <div className="font-mono text-[10px] text-[#5D5F5D]">
                      {battle.beastA.boundAsset ? `${battle.beastA.boundAsset} BOUND` : 'UNBOUND'}
                    </div>
                  </div>

                  {/* VS */}
                  <div className="col-span-1 text-center font-headline font-extrabold text-2xl text-[#5D5F5D]">
                    VS
                  </div>

                  {/* Beast B */}
                  <div className="col-span-2 text-center space-y-2">
                    <div className="relative aspect-square w-20 mx-auto border border-[#0A0A0B] overflow-hidden bg-zinc-900">
                      <Image
                        src={battle.beastB.avatarUrl}
                        alt={battle.beastB.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="font-headline font-bold text-sm leading-tight uppercase truncate">
                      {battle.beastB.name}
                    </div>
                    <div className="font-mono text-[10px] text-[#5D5F5D]">
                      {battle.beastB.boundAsset ? `${battle.beastB.boundAsset} BOUND` : 'UNBOUND'}
                    </div>
                  </div>
                </div>

                {/* Market Pulse Info */}
                <div className="bg-[#F4F4F0] p-3 border border-[#E5E5E1] font-mono text-xs space-y-1">
                  <div className="flex justify-between text-[#5D5F5D]">
                    <span>WAGER POOL</span>
                    <span className="font-bold text-[#0A0A0B]">{battle.totalPoolA + battle.totalPoolB} STT</span>
                  </div>
                  {battle.marketPulseA && (
                    <div className="flex justify-between text-[11px] text-[#DC2626]">
                      <span>{battle.beastA.name.split(' ')[0]}</span>
                      <span>{battle.marketPulseA.modifier.description}</span>
                    </div>
                  )}
                  {battle.winner && (
                    <div className="flex justify-between text-[11px] font-bold text-[#0A0A0B]">
                      <span>WINNER</span>
                      <span>{battle.winner === 'beastA' ? battle.beastA.name : battle.beastB.name}</span>
                    </div>
                  )}
                </div>

                {/* Action CTA */}
                <Link
                  href={`/battle/${battle.id}`}
                  className={`w-full py-3 font-headline font-bold text-sm text-center uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                    isLive
                      ? 'bg-[#DC2626] text-white hover:bg-[#B91C1C]'
                      : 'bg-[#0A0A0B] text-[#FAFAF8] hover:bg-[#FAFAF8] hover:text-[#0A0A0B] border border-[#0A0A0B]'
                  }`}
                >
                  {isLive && (
                    <>
                      <FiCrosshair className="w-4 h-4" />
                      <span>Spectate Live Combat</span>
                    </>
                  )}
                  {isPending && (
                    <>
                      <FiZap className="w-4 h-4" />
                      <span>Place Wager // 40m Left</span>
                    </>
                  )}
                  {isCompleted && (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      <span>Review Battle Log</span>
                    </>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
