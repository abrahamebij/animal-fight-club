'use client';

import React, { useState } from 'react';
import { useLeaderboardBeasts, useLeaderboardBettors } from '@/hooks/useLeaderboard';
import { LeaderboardTabs } from '@/components/leaderboard/LeaderboardTabs';
import { BeastsLeaderboardTable } from '@/components/leaderboard/BeastsLeaderboardTable';
import { BettorsLeaderboardTable } from '@/components/leaderboard/BettorsLeaderboardTable';
import Img from '@/components/ui/Img';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'beasts' | 'bettors'>('beasts');

  const { data: beasts = [], isLoading: loadingBeasts } = useLeaderboardBeasts();
  const { data: bettors = [], isLoading: loadingBettors } = useLeaderboardBettors();

  const loading = tab === 'beasts' ? loadingBeasts : loadingBettors;

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      <section className="border-b border-divider divider-ash bg-background pt-8 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 bg-secondary" />
              <span>GLOBAL RANKINGS - PROVING GROUNDS</span>
            </div>
            <h1 className="font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
              ARENA LEADERBOARDS
            </h1>
            <p className="font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
              Historical combat rankings and spectator wagering records on Somnia Shannon. Auditable victory counts and prediction accuracy.
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full">
              <Img src="/arena-hero.png" alt="Arena Leaderboard Hero" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-8 space-y-6">
        <LeaderboardTabs tab={tab} onTabChange={setTab} />

        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-secondary uppercase tracking-widest">
            LOADING RANKINGS MATRIX...
          </div>
        ) : tab === 'beasts' ? (
          <BeastsLeaderboardTable beasts={beasts} />
        ) : (
          <BettorsLeaderboardTable bettors={bettors} />
        )}
      </div>
    </div>
  );
}
