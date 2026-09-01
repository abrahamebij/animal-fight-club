'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiGrid, 
  FiPlusSquare, 
  FiShield, 
  FiZap, 
  FiClock, 
  FiAward, 
  FiCrosshair,
  FiUser,
  FiCheckCircle
} from 'react-icons/fi';
import { MOCK_BEASTS, MOCK_BATTLES } from '@/lib/mockData';

export default function DashboardPage() {
  const myBeasts = MOCK_BEASTS.slice(0, 2);
  const myActiveBets = [
    {
      id: 'bet_01',
      battleId: 'battle_live_01',
      beastPicked: MOCK_BEASTS[0].name,
      amount: 150,
      odds: '1.85x',
      status: 'active',
    },
    {
      id: 'bet_02',
      battleId: 'battle_pending_02',
      beastPicked: MOCK_BEASTS[3].name,
      amount: 80,
      odds: '2.10x',
      status: 'pending',
    },
  ];

  return (
    <div className="flex flex-col w-full bg-[#FAFAF8] min-h-screen text-[#0A0A0B] pb-24">
      {/* Header */}
      <section className="border-b border-[#0A0A0B] bg-[#FAFAF8] pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#0A0A0B] text-[#FAFAF8] font-mono text-[11px] uppercase tracking-wider mb-3">
            <span className="w-2 h-2 bg-[#DC2626]" />
            <span>COMMAND CENTER // USER TERMINAL</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0B]">
                COMMAND CENTER
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#5D5F5D] max-w-2xl leading-relaxed">
                Manage your minted combatants, track pending challenges, and review active spectator wagers.
              </p>
            </div>

            <Link
              href="/create"
              className="px-6 py-3 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-bold text-sm uppercase tracking-wider hover:bg-[#FAFAF8] hover:text-[#0A0A0B] border border-[#0A0A0B] transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <FiPlusSquare className="w-4 h-4" />
              <span>Forge New Beast</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Account Metric Summary */}
      <section className="border-b border-[#0A0A0B] bg-[#FAFAF8]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="border border-[#0A0A0B] p-4 bg-[#F4F4F0]">
              <span className="text-[#5D5F5D] block text-[10px] uppercase">CONNECTED ADDRESS</span>
              <span className="font-bold text-sm text-[#0A0A0B]">0x38F2...91C4</span>
            </div>

            <div className="border border-[#0A0A0B] p-4 bg-[#F4F4F0]">
              <span className="text-[#5D5F5D] block text-[10px] uppercase">FORGED BEASTS</span>
              <span className="font-headline font-extrabold text-2xl text-[#0A0A0B]">{myBeasts.length}</span>
            </div>

            <div className="border border-[#0A0A0B] p-4 bg-[#F4F4F0]">
              <span className="text-[#5D5F5D] block text-[10px] uppercase">ACTIVE WAGERS</span>
              <span className="font-headline font-extrabold text-2xl text-[#DC2626]">{myActiveBets.length}</span>
            </div>

            <div className="border border-[#0A0A0B] p-4 bg-[#F4F4F0]">
              <span className="text-[#5D5F5D] block text-[10px] uppercase">TOTAL NET PURSE</span>
              <span className="font-headline font-extrabold text-2xl text-[#0A0A0B]">+840 STT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10 space-y-12">
        {/* 1. My Beasts Roster */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-3">
            <div className="flex items-center gap-2">
              <FiShield className="w-5 h-5 text-[#DC2626]" />
              <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                MY ACTIVE COMBATANTS ({myBeasts.length})
              </h2>
            </div>
            <Link
              href="/create"
              className="font-mono text-xs uppercase text-[#0A0A0B] hover:text-[#DC2626] flex items-center gap-1 font-bold"
            >
              <FiPlusSquare className="w-3.5 h-3.5" />
              <span>Forge Another</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBeasts.map((beast) => (
              <div key={beast.id} className="border-2 border-[#0A0A0B] p-6 bg-[#FAFAF8] flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="relative aspect-square w-full border border-[#0A0A0B] overflow-hidden bg-zinc-900">
                    <Image
                      src={beast.avatarUrl}
                      alt={beast.name}
                      fill
                      className="object-cover"
                    />
                    {beast.boundAsset && (
                      <div className="absolute top-2 right-2 bg-[#0A0A0B] text-[#FAFAF8] font-mono text-[10px] font-bold px-2 py-0.5 border border-[#FAFAF8]/30">
                        {beast.boundAsset} BOUND
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-headline font-bold text-2xl uppercase tracking-tight text-[#0A0A0B]">
                      {beast.name}
                    </h3>
                    <div className="font-mono text-xs text-[#5D5F5D]">
                      RECORD: {beast.record.wins}W - {beast.record.losses}L
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs border-t border-[#E5E5E1] pt-3">
                    <div className="bg-[#F4F4F0] p-1.5">
                      <div className="text-[10px] text-[#5D5F5D]">PWR</div>
                      <div className="font-bold">{beast.stats.power}</div>
                    </div>
                    <div className="bg-[#F4F4F0] p-1.5">
                      <div className="text-[10px] text-[#5D5F5D]">DEF</div>
                      <div className="font-bold">{beast.stats.defense}</div>
                    </div>
                    <div className="bg-[#F4F4F0] p-1.5">
                      <div className="text-[10px] text-[#5D5F5D]">SPD</div>
                      <div className="font-bold">{beast.stats.speed}</div>
                    </div>
                    <div className="bg-[#F4F4F0] p-1.5">
                      <div className="text-[10px] text-[#5D5F5D]">SPC</div>
                      <div className="font-bold">{beast.stats.special}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href={`/beast/${beast.id}`}
                    className="py-2.5 bg-[#F4F4F0] text-[#0A0A0B] font-headline font-bold text-center text-sm uppercase tracking-wider hover:bg-[#0A0A0B] hover:text-[#FAFAF8] border border-[#0A0A0B] transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/arena"
                    className="py-2.5 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-bold text-center text-sm uppercase tracking-wider hover:bg-[#DC2626] transition-colors"
                  >
                    Deploy Duel
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Active Wagers */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-3">
            <div className="flex items-center gap-2">
              <FiZap className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                ACTIVE SPECTATOR WAGERS
              </h2>
            </div>
            <span className="font-mono text-xs text-[#5D5F5D]">ESCROW BACKED</span>
          </div>

          <div className="border border-[#0A0A0B] bg-[#FAFAF8] overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#0A0A0B] bg-[#F4F4F0] text-[#5D5F5D] uppercase">
                  <th className="p-4">BET ID</th>
                  <th className="p-4">BATTLE</th>
                  <th className="p-4">PREDICTED VICTOR</th>
                  <th className="p-4">STAKE AMOUNT</th>
                  <th className="p-4">EST. MULTIPLIER</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E1]">
                {myActiveBets.map((bet) => (
                  <tr key={bet.id} className="hover:bg-[#F4F4F0] transition-colors">
                    <td className="p-4 font-bold">{bet.id}</td>
                    <td className="p-4">{bet.battleId}</td>
                    <td className="p-4 font-bold text-[#0A0A0B] uppercase">{bet.beastPicked}</td>
                    <td className="p-4">{bet.amount} STT</td>
                    <td className="p-4 text-[#DC2626] font-bold">{bet.odds}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-[#0A0A0B] text-[#FAFAF8] font-bold text-[10px] uppercase">
                        {bet.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/battle/${bet.battleId}`}
                        className="px-3 py-1.5 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-bold uppercase hover:bg-[#DC2626] transition-colors inline-block"
                      >
                        Spectate
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
