'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiAward, 
  FiTrendingUp, 
  FiShield, 
} from 'react-icons/fi';
import { MOCK_LEADERBOARD_BEASTS, MOCK_LEADERBOARD_BETTORS } from '@/lib/mockData';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'beasts' | 'bettors'>('beasts');

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      {/* Header */}
      <section className="border-b border-primary bg-background pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider mb-3">
            <span className="w-2 h-2 bg-secondary" />
            <span>GLOBAL RANKINGS // PROVING GROUNDS</span>
          </div>
          <h1 className="font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
            ARENA LEADERBOARDS
          </h1>
          <p className="font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
            Historical combat rankings and spectator wagering records on Somnia Shannon. Auditable victory counts and prediction accuracy.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-primary bg-background sticky top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 flex items-center gap-4 py-3">
          <button
            onClick={() => setTab('beasts')}
            className={`px-5 py-2.5 font-headline font-bold text-base uppercase tracking-wider border transition-colors flex items-center gap-2 ${
              tab === 'beasts'
                ? 'bg-primary text-background border-primary'
                : 'bg-transparent text-secondary border-transparent hover:border-primary hover:text-primary'
            }`}
          >
            <FiShield className="w-4 h-4" />
            <span>TOP COMBAT BEASTS</span>
          </button>

          <button
            onClick={() => setTab('bettors')}
            className={`px-5 py-2.5 font-headline font-bold text-base uppercase tracking-wider border transition-colors flex items-center gap-2 ${
              tab === 'bettors'
                ? 'bg-primary text-background border-primary'
                : 'bg-transparent text-secondary border-transparent hover:border-primary hover:text-primary'
            }`}
          >
            <FiTrendingUp className="w-4 h-4" />
            <span>TOP SPECTATOR BETTORS</span>
          </button>
        </div>
      </section>

      {/* Table Content */}
      <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10">
        {tab === 'beasts' ? (
          <div className="border border-primary bg-background overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary bg-surface-container-low font-mono text-xs text-secondary uppercase">
                  <th className="p-4 w-16 text-center">RANK</th>
                  <th className="p-4">COMBATANT</th>
                  <th className="p-4">OWNER</th>
                  <th className="p-4">MARKET BINDING</th>
                  <th className="p-4">RECORD (W/L)</th>
                  <th className="p-4">WIN RATE</th>
                  <th className="p-4 text-right">PROFILE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral font-mono text-xs">
                {MOCK_LEADERBOARD_BEASTS.map((entry) => (
                  <tr key={entry.beastId} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-7 h-7 ${
                        entry.rank === 1 ? 'bg-primary text-background font-bold' :
                        entry.rank === 2 ? 'bg-neutral text-primary' :
                        entry.rank === 3 ? 'bg-surface-container-low text-primary' : 'text-secondary'
                      }`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 border border-primary overflow-hidden bg-zinc-900 flex-shrink-0">
                          <Image
                            src={entry.avatarUrl}
                            alt={entry.beastName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-headline font-bold text-base uppercase text-primary">
                          {entry.beastName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-secondary">
                      {entry.ownerAddress}
                    </td>
                    <td className="p-4">
                      {entry.boundAsset ? (
                        <span className="px-2 py-0.5 bg-primary text-background font-bold text-[10px] uppercase">
                          {entry.boundAsset} BOUND
                        </span>
                      ) : (
                        <span className="text-secondary">UNBOUND</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-primary">
                      {entry.wins}W - {entry.losses}L
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-primary">{entry.winRate}%</span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/beast/${entry.beastId}`}
                        className="px-3 py-1.5 bg-primary text-background font-headline font-bold uppercase hover:bg-secondary transition-colors inline-block"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-primary bg-background overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary bg-surface-container-low font-mono text-xs text-secondary uppercase">
                  <th className="p-4 w-16 text-center">RANK</th>
                  <th className="p-4">SPECTATOR ADDRESS</th>
                  <th className="p-4">TOTAL WAGERED</th>
                  <th className="p-4">NET PROFIT</th>
                  <th className="p-4">ACCURACY RATE</th>
                  <th className="p-4 text-right">TOTAL BETS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral font-mono text-xs">
                {MOCK_LEADERBOARD_BETTORS.map((entry) => (
                  <tr key={entry.address} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-7 h-7 ${
                        entry.rank === 1 ? 'bg-primary text-background font-bold' :
                        entry.rank === 2 ? 'bg-neutral text-primary' :
                        entry.rank === 3 ? 'bg-surface-container-low text-primary' : 'text-secondary'
                      }`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-primary">
                      {entry.address}
                    </td>
                    <td className="p-4 text-secondary">
                      {entry.totalWagered} STT
                    </td>
                    <td className="p-4 font-bold text-primary">
                      +{entry.profit} STT
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-primary">{entry.winRate}%</span>
                    </td>
                    <td className="p-4 text-right font-bold text-secondary">
                      {entry.totalBets}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
