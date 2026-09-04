'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiCrosshair, FiPlusSquare } from 'react-icons/fi';
import { useBattles } from '@/hooks/useBattles';
import { useBeast } from '@/hooks/useBeasts';
import { BattleStatus, Beast } from '@/lib/types';
import { ChallengeModal } from '@/components/arena/ChallengeModal';
import { ArenaFilterBar } from '@/components/arena/ArenaFilterBar';
import { ArenaBattleCard } from '@/components/arena/ArenaBattleCard';
import Img from '@/components/ui/Img';

function ArenaContent() {
  const searchParams = useSearchParams();
  const challengeParam = searchParams.get('challenge');

  const { data: battles = [], isLoading } = useBattles();
  const { data: challengedBeast } = useBeast(challengeParam || undefined);

  const [filter, setFilter] = useState<'all' | BattleStatus>('all');
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [targetOpponent, setTargetOpponent] = useState<Beast | null>(null);

  React.useEffect(() => {
    if (challengedBeast) {
      setTargetOpponent(challengedBeast);
      setChallengeModalOpen(true);
    }
  }, [challengedBeast]);

  const filteredBattles = battles.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const liveCount = battles.filter((b) => b.status === 'live').length;
  const pendingCount = battles.filter((b) => b.status === 'pending').length;
  const completedCount = battles.filter((b) => b.status === 'completed').length;

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      <section className="border-b border-divider divider-ash bg-background pt-8 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 bg-secondary" />
              <span>ARENA DISPATCH GRID</span>
            </div>
            <h1 className="font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
              THE COMBAT ARENA
            </h1>
            <p className="font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
              Live agentic combat encounters and pending wagering windows on Somnia Shannon. Spectators can bet on beast outcomes during active 1-hour windows.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setTargetOpponent(null);
                  setChallengeModalOpen(true);
                }}
                className="px-6 py-3 bg-primary text-background font-headline font-bold text-sm uppercase tracking-wider hover:bg-secondary transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <FiCrosshair className="w-4 h-4" />
                <span>Initiate Challenge</span>
              </button>
              <Link
                href="/create"
                className="px-6 py-3 bg-surface-container-low text-primary font-headline font-bold text-sm uppercase tracking-wider hover:bg-primary hover:text-background border border-primary transition-colors inline-flex items-center gap-2"
              >
                <FiPlusSquare className="w-4 h-4" />
                <span>Forge Beast</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full">
              <Img src="/arena-hero.png" alt="Arena Combat" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-8 space-y-6">
        <ArenaFilterBar
          filter={filter}
          onFilterChange={setFilter}
          liveCount={liveCount}
          pendingCount={pendingCount}
          completedCount={completedCount}
        />

        {isLoading ? (
          <div className="py-20 text-center font-mono text-xs text-secondary uppercase tracking-widest">
            LOADING ACTIVE COMBAT DISPATCHES...
          </div>
        ) : filteredBattles.length === 0 ? (
          <div className="py-20 text-center font-mono text-xs text-secondary border border-divider p-8">
            No duels found matching the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBattles.map((battle) => (
              <ArenaBattleCard key={battle.id} battle={battle} />
            ))}
          </div>
        )}
      </div>

      <ChallengeModal
        isOpen={challengeModalOpen}
        onClose={() => setChallengeModalOpen(false)}
        initialOpponent={targetOpponent}
      />
    </div>
  );
}

export default function ArenaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ArenaContent />
    </Suspense>
  );
}
