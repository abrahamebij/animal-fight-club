'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiAward, 
  FiTrendingUp, 
  FiUser, 
  FiShield, 
  FiArrowRight, 
  FiActivity 
} from 'react-icons/fi';
import { MOCK_LEADERBOARD_BEASTS, MOCK_LEADERBOARD_BETTORS } from '@/lib/mockData';

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'beasts' | 'bettors'>('beasts');

  return (
    <div className="flex flex-col w-full bg-[#FAFAF8] min-h-screen text-[#0A0A0B] pb-24">
      {/* Header */}
      <section className="border-b border-[#0A0A0B] bg-[#FAFAF8] pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#0A0A0B] text-[#FAFAF8] font-mono text-[11px] uppercase tracking-wider mb-3">
            <span className="w-2 h-2 bg-[#DC2626]" />
            <span>GLOBAL RANKINGS // PROVING GROUNDS</span>
          </div>
          <h1 className="font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0B]">
            ARENA LEADERBOARDS
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#5D5F5D] max-w-2xl leading-relaxed">
            Historical combat rankings and spectator wagering records on Somnia Shannon. Auditable victory counts and prediction accuracy.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-[#0A0A0B] bg-[#FAFAF8] sticky top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 flex items-center gap-4 py-3">
          <button
            onClick={() => setTab('beasts')}
            className={`px-5 py-2.5 font-headline font-bold text-base uppercase tracking-wider border transition-colors flex items-center gap-2 ${
              tab === 'beasts'
                ? 'bg-[#0A0A0B] text-[#FAFAF8] border-[#0A0A0B]'
                : 'bg-transparent text-[#5D5F5D] border-transparent hover:border-[#0A0A0B] hover:text-[#0A0A0B]'
            }`}
          >
            <FiShield className="w-4 h-4" />
            <span>TOP COMBAT BEASTS</span>
          </button>

          <button
            onClick={() => setTab('bettors')}
            className={`px-5 py-2.5 font-headline font-bold text-base uppercase tracking-wider border transition-colors flex items-center gap-2 ${
              tab === 'bettors'
                ? 'bg-[#0A0A0B] text-[#FAFAF8] border-[#0A0A0B]'
                : 'bg-transparent text-[#5D5F5D] border-transparent hover:border-[#0A0A0B] hover:text-[#0A0A0B]'
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
          <div className="border border-[#0A0A0B] bg-[#FAFAF8] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#0A0A0B] bg-[#F4F4F0] font-mono text-xs text-[#5D5F5D] uppercase">
                  <th className="p-4 w-16 text-center">RANK</th>
                  <th className="p-4">COMBATANT</th>
                  <th className="p-4">OWNER</th>
                  <th className="p-4">MARKET BINDING</th>
                  <th className="p-4">RECORD (W/L)</th>
                  <th className="p-4">WIN RATE</th>
                  <th className="p-4 text-right">PROFILE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E1] font-mono text-xs">
                {MOCK_LEADERBOARD_BEASTS.map((entry) => (
                  <tr key={entry.beastId} className="hover:bg-[#F4F4F0] transition-colors">
                    <td className="p-4 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-7 h-7 ${
                        entry.rank === 1 ? 'bg-[#0A0A0B] text-[#FAFAF8] font-bold' :
                        entry.rank === 2 ? 'bg-[#E5E5E1] text-[#0A0A0B]' :
                        entry.rank === 3 ? 'bg-[#F4F4F0] text-[#0A0A0B]' : 'text-[#5D5F5D]'
                      }`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 border border-[#0A0A0B] overflow-hidden bg-zinc-900 flex-shrink-0">
                          <Image
                            src={entry.avatarUrl}
                            alt={entry.beastName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-headline font-bold text-base uppercase text-[#0A0A0B]">
                          {entry.beastName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-[#5D5F5D]">
                      {entry.ownerAddress}
                    </td>
                    <td className="p-4">
                      {entry.boundAsset ? (
                        <span className="px-2 py-0.5 bg-[#0A0A0B] text-[#FAFAF8] font-bold text-[10px] uppercase">
                          {entry.boundAsset} BOUND
                        </span>
                      ) : (
                        <span className="text-[#5D5F5D]">UNBOUND</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-[#0A0A0B]">
                      {entry.wins}W - {entry.losses}L
                    </td>
                    <td className="p-4">
                      <span className="text-[#DC2626] font-bold">{entry.winRate}%</span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/beast/${entry.beastId}`}
                        className="px-3 py-1.5 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-bold uppercase hover:bg-[#DC2626] transition-colors inline-block"
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
          <div className="border border-[#0A0A0B] bg-[#FAFAF8] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#0A0A0B] bg-[#F4F4F0] font-mono text-xs text-[#5D5F5D] uppercase">
                  <th className="p-4 w-16 text-center">RANK</th>
                  <th className="p-4">SPECTATOR ADDRESS</th>
                  <th className="p-4">TOTAL WAGERED</th>
                  <th className="p-4">NET PROFIT</th>
                  <th className="p-4">ACCURACY RATE</th>
                  <th className="p-4 text-right">TOTAL BETS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E1] font-mono text-xs">
                {MOCK_LEADERBOARD_BETTORS.map((entry) => (
                  <tr key={entry.address} className="hover:bg-[#F4F4F0] transition-colors">
                    <td className="p-4 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-7 h-7 ${
                        entry.rank === 1 ? 'bg-[#0A0A0B] text-[#FAFAF8] font-bold' :
                        entry.rank === 2 ? 'bg-[#E5E5E1] text-[#0A0A0B]' :
                        entry.rank === 3 ? 'bg-[#F4F4F0] text-[#0A0A0B]' : 'text-[#5D5F5D]'
                      }`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#0A0A0B]">
                      {entry.address}
                    </td>
                    <td className="p-4 text-[#5D5F5D]">
                      {entry.totalWagered} STT
                    </td>
                    <td className="p-4 font-bold text-[#DC2626]">
                      +{entry.profit} STT
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-[#0A0A0B]">{entry.winRate}%</span>
                    </td>
                    <td className="p-4 text-right font-bold text-[#5D5F5D]">
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
