'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiCrosshair, 
  FiPlusSquare, 
  FiTrendingUp, 
  FiShield, 
  FiZap, 
  FiClock, 
  FiActivity, 
  FiArrowRight, 
  FiAward, 
  FiExternalLink 
} from 'react-icons/fi';
import { MOCK_BATTLES, MOCK_BEASTS } from '@/lib/mockData';

export default function HomePage() {
  const liveBattle = MOCK_BATTLES.find((b) => b.status === 'live');
  const pendingBattle = MOCK_BATTLES.find((b) => b.status === 'pending');

  return (
    <div className="flex flex-col w-full bg-[#FAFAF8] min-h-screen text-[#0A0A0B]">
      {/* 1. HERO SECTION */}
      <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-[#0A0A0B] p-6 lg:p-12 bg-[#FAFAF8]">
          <div className="lg:col-span-7 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A0A0B] text-[#FAFAF8] font-mono text-xs uppercase tracking-wider">
                <span className="w-2 h-2 bg-[#DC2626]" />
                <span>SOMNIA SHANNON // EVENT CONTRACT ARENA</span>
              </div>

              <h1 className="font-headline font-extrabold text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tighter uppercase text-[#0A0A0B]">
                CREATE YOUR BEAST.<br />
                WATCH IT FIGHT.<br />
                BET ON THE WINNER.
              </h1>

              <p className="font-sans text-base lg:text-xl text-[#5D5F5D] max-w-xl leading-relaxed">
                Primal AI combat meets precision financial forecasting. Forge your agent from raw parameters, enter the pit, and let live DreamDEX Event Contract market odds power real-time combat modifiers.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                href="/create"
                className="px-8 py-4 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-bold text-lg uppercase tracking-wider hover:bg-[#FAFAF8] hover:text-[#0A0A0B] border border-[#0A0A0B] transition-colors inline-flex items-center gap-2"
              >
                <FiPlusSquare className="w-5 h-5" />
                <span>Create Your Beast</span>
              </Link>
              <Link 
                href="/arena"
                className="px-8 py-4 bg-transparent text-[#0A0A0B] font-headline font-bold text-lg uppercase tracking-wider hover:bg-[#0A0A0B] hover:text-[#FAFAF8] border border-[#0A0A0B] transition-colors inline-flex items-center gap-2"
              >
                <FiCrosshair className="w-5 h-5" />
                <span>Enter The Arena</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="border border-[#0A0A0B] p-4 bg-[#0A0A0B] text-[#FAFAF8] flex flex-col gap-4">
              <div className="flex items-center justify-between font-mono text-[11px] text-[#FAFAF8]/60 border-b border-[#FAFAF8]/20 pb-2">
                <span>COMBAT_SIMULATION // SEQ_01</span>
                <span className="text-[#DC2626] font-bold">STATUS: ACTIVE</span>
              </div>

              <div className="relative aspect-video w-full overflow-hidden border border-[#FAFAF8]/20 bg-zinc-900">
                <Image
                  src="/assets/stitch/home/asset_1.jpg"
                  alt="Apex Mecha-Kong Combatant"
                  fill
                  className="object-cover opacity-80"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-xs">
                  <span className="bg-[#0A0A0B] px-2 py-1 border border-[#FAFAF8]/30 font-bold uppercase">
                    APEX MECHA-KONG
                  </span>
                  <span className="bg-[#DC2626] text-[#FAFAF8] px-2 py-1 font-bold">
                    BTC PULSE: +2 PWR
                  </span>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-[#FAFAF8]/70">
                  <span>ORACLE INPUT</span>
                  <span className="text-[#FAFAF8]">DREAMDEX BTC/USDso 15M</span>
                </div>
                <div className="flex justify-between text-[#FAFAF8]/70">
                  <span>ODDS SPREAD</span>
                  <span className="text-[#FAFAF8]">UP: 68% // DOWN: 32%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS / PROTOCOL */}
      <section className="border-y border-[#0A0A0B] bg-[#0A0A0B] text-[#FAFAF8] py-20">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-[#FAFAF8]/60">PROTOCOL EXECUTION FLOW</span>
            <div className="flex-grow h-[1px] bg-[#FAFAF8]/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-[#FAFAF8]/20">
            {/* Step 1 */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-[#FAFAF8]/20 flex flex-col justify-between gap-6 relative overflow-hidden group">
              <div className="absolute top-2 right-4 text-7xl font-headline font-extrabold text-[#FAFAF8]/5 group-hover:text-[#FAFAF8]/15 transition-colors">
                01
              </div>
              <div className="space-y-3 relative z-10">
                <span className="font-mono text-xs text-[#DC2626] uppercase font-bold">PHASE / 01</span>
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight text-[#FAFAF8]">
                  CREATE YOUR BEAST
                </h3>
                <p className="font-sans text-sm text-[#FAFAF8]/70 leading-relaxed">
                  Allocate stat points into Power, Defense, Speed, and Special. Equip perks and optionally bind your beast to BTC or ETH market order books.
                </p>
              </div>
              <Link href="/create" className="font-mono text-xs uppercase tracking-wider text-[#FAFAF8] flex items-center gap-1.5 hover:text-[#DC2626] transition-colors">
                <span>Forge Beast</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-[#FAFAF8]/20 flex flex-col justify-between gap-6 relative overflow-hidden group bg-[#FAFAF8]/[0.02]">
              <div className="absolute top-2 right-4 text-7xl font-headline font-extrabold text-[#FAFAF8]/5 group-hover:text-[#FAFAF8]/15 transition-colors">
                02
              </div>
              <div className="space-y-3 relative z-10">
                <span className="font-mono text-xs text-[#F59E0B] uppercase font-bold">PHASE / 02</span>
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight text-[#FAFAF8]">
                  1-HOUR BETTING & MARKET PULSE
                </h3>
                <p className="font-sans text-sm text-[#FAFAF8]/70 leading-relaxed">
                  When a challenge is accepted, a 1-hour betting window opens. Live DreamDEX Event Contract odds are read and locked in as combat modifiers.
                </p>
              </div>
              <Link href="/arena" className="font-mono text-xs uppercase tracking-wider text-[#FAFAF8] flex items-center gap-1.5 hover:text-[#F59E0B] transition-colors">
                <span>View Wagers</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="p-8 flex flex-col justify-between gap-6 relative overflow-hidden group">
              <div className="absolute top-2 right-4 text-7xl font-headline font-extrabold text-[#FAFAF8]/5 group-hover:text-[#FAFAF8]/15 transition-colors">
                03
              </div>
              <div className="space-y-3 relative z-10">
                <span className="font-mono text-xs text-[#FAFAF8]/40 uppercase font-bold">PHASE / 03</span>
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight text-[#FAFAF8]">
                  LLM-REASONED COMBAT & SETTLEMENT
                </h3>
                <p className="font-sans text-sm text-[#FAFAF8]/70 leading-relaxed">
                  Combat executes turn-by-turn with full battle context reasoning. HP resolves dynamically, winners take the purse, and escrow pays out winning bets.
                </p>
              </div>
              <Link href="/arena" className="font-mono text-xs uppercase tracking-wider text-[#FAFAF8] flex items-center gap-1.5 hover:text-[#FAFAF8] transition-colors">
                <span>Spectate Combat</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED LIVE & PENDING BATTLES */}
      <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="font-mono text-xs text-[#5D5F5D] uppercase tracking-widest">REAL-TIME DISPATCH</div>
            <h2 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-[#0A0A0B]">
              ARENA COMBAT MONITOR
            </h2>
          </div>
          <Link
            href="/arena"
            className="font-mono text-xs uppercase tracking-wider text-[#0A0A0B] border-b border-[#0A0A0B] pb-1 hover:text-[#DC2626] hover:border-[#DC2626] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Browse All Battles</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Battle Card */}
          {liveBattle && (
            <div className="border-2 border-[#0A0A0B] p-6 bg-[#FAFAF8] flex flex-col justify-between gap-6 relative">
              <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#DC2626] animate-pulse" />
                  <span className="font-headline font-bold text-xl uppercase tracking-wider text-[#DC2626]">
                    LIVE COMBAT IN PROGRESS
                  </span>
                </div>
                <span className="font-mono text-xs text-[#5D5F5D]">ROUND {liveBattle.combatLog.length}</span>
              </div>

              <div className="grid grid-cols-5 items-center gap-4 py-2">
                {/* Fighter A */}
                <div className="col-span-2 text-center space-y-2">
                  <div className="relative aspect-square w-24 mx-auto border border-[#0A0A0B]">
                    <Image
                      src={liveBattle.beastA.avatarUrl}
                      alt={liveBattle.beastA.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="font-headline font-bold text-lg leading-tight uppercase">
                    {liveBattle.beastA.name}
                  </div>
                  <div className="font-mono text-xs text-[#DC2626] font-bold">
                    {liveBattle.combatLog[liveBattle.combatLog.length - 1]?.beastAHp ?? 100} / 100 HP
                  </div>
                </div>

                {/* VS Center */}
                <div className="col-span-1 text-center font-headline font-extrabold text-3xl text-[#5D5F5D]">
                  VS
                </div>

                {/* Fighter B */}
                <div className="col-span-2 text-center space-y-2">
                  <div className="relative aspect-square w-24 mx-auto border border-[#0A0A0B]">
                    <Image
                      src={liveBattle.beastB.avatarUrl}
                      alt={liveBattle.beastB.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="font-headline font-bold text-lg leading-tight uppercase">
                    {liveBattle.beastB.name}
                  </div>
                  <div className="font-mono text-xs text-[#DC2626] font-bold">
                    {liveBattle.combatLog[liveBattle.combatLog.length - 1]?.beastBHp ?? 100} / 100 HP
                  </div>
                </div>
              </div>

              <div className="bg-[#F4F4F0] p-3 border border-[#E5E5E1] font-mono text-xs text-[#5D5F5D] line-clamp-2">
                {liveBattle.combatLog[liveBattle.combatLog.length - 1]?.combatNarrative}
              </div>

              <Link
                href={`/battle/${liveBattle.id}`}
                className="w-full py-3.5 bg-[#DC2626] text-white font-headline font-bold text-center text-base uppercase tracking-wider hover:bg-[#B91C1C] transition-colors flex items-center justify-center gap-2"
              >
                <FiCrosshair className="w-4 h-4" />
                <span>Enter Live Battle View</span>
              </Link>
            </div>
          )}

          {/* Pending Battle Card */}
          {pendingBattle && (
            <div className="border border-[#0A0A0B] p-6 bg-[#FAFAF8] flex flex-col justify-between gap-6">
              <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#F59E0B]" />
                  <span className="font-headline font-bold text-xl uppercase tracking-wider text-[#0A0A0B]">
                    PENDING WAGERING WINDOW
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs text-[#F59E0B] font-bold">
                  <FiClock className="w-3.5 h-3.5" />
                  <span>40:00 REMAINING</span>
                </div>
              </div>

              <div className="grid grid-cols-5 items-center gap-4 py-2">
                {/* Fighter A */}
                <div className="col-span-2 text-center space-y-2">
                  <div className="relative aspect-square w-24 mx-auto border border-[#0A0A0B]">
                    <Image
                      src={pendingBattle.beastA.avatarUrl}
                      alt={pendingBattle.beastA.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="font-headline font-bold text-lg leading-tight uppercase">
                    {pendingBattle.beastA.name}
                  </div>
                  <div className="font-mono text-xs text-[#5D5F5D]">
                    {pendingBattle.beastA.boundAsset ? `Bound: ${pendingBattle.beastA.boundAsset}` : 'Unbound'}
                  </div>
                </div>

                {/* VS Center */}
                <div className="col-span-1 text-center font-headline font-extrabold text-3xl text-[#5D5F5D]">
                  VS
                </div>

                {/* Fighter B */}
                <div className="col-span-2 text-center space-y-2">
                  <div className="relative aspect-square w-24 mx-auto border border-[#0A0A0B]">
                    <Image
                      src={pendingBattle.beastB.avatarUrl}
                      alt={pendingBattle.beastB.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="font-headline font-bold text-lg leading-tight uppercase">
                    {pendingBattle.beastB.name}
                  </div>
                  <div className="font-mono text-xs text-[#5D5F5D]">
                    {pendingBattle.beastB.boundAsset ? `Bound: ${pendingBattle.beastB.boundAsset}` : 'Unbound'}
                  </div>
                </div>
              </div>

              <div className="bg-[#F4F4F0] p-3 border border-[#E5E5E1] flex items-center justify-between font-mono text-xs">
                <span>TOTAL WAGER POOL</span>
                <span className="font-bold text-[#0A0A0B]">{pendingBattle.totalPoolA + pendingBattle.totalPoolB} STT</span>
              </div>

              <Link
                href={`/battle/${pendingBattle.id}`}
                className="w-full py-3.5 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-bold text-center text-base uppercase tracking-wider hover:bg-[#FAFAF8] hover:text-[#0A0A0B] border border-[#0A0A0B] transition-colors flex items-center justify-center gap-2"
              >
                <FiZap className="w-4 h-4" />
                <span>Place Wager & Inspect Odds</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. ROSTER HIGHLIGHTS */}
      <section className="border-t border-[#0A0A0B] bg-[#FAFAF8] py-20">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="font-mono text-xs text-[#5D5F5D] uppercase tracking-widest">CHAMPION BEASTS</div>
              <h2 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-[#0A0A0B]">
                HALL OF COMBATANTS
              </h2>
            </div>
            <Link
              href="/leaderboard"
              className="font-mono text-xs uppercase tracking-wider text-[#0A0A0B] border-b border-[#0A0A0B] pb-1 hover:text-[#DC2626] hover:border-[#DC2626] transition-colors flex items-center gap-1.5"
            >
              <span>View Leaderboard</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_BEASTS.slice(0, 4).map((beast) => (
              <div 
                key={beast.id} 
                className="border border-[#0A0A0B] bg-[#FAFAF8] p-4 flex flex-col justify-between gap-4 group hover:border-[#DC2626] transition-colors"
              >
                <div className="relative aspect-square w-full border border-[#0A0A0B] overflow-hidden bg-zinc-900">
                  <Image
                    src={beast.avatarUrl}
                    alt={beast.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {beast.boundAsset && (
                    <div className="absolute top-2 right-2 bg-[#0A0A0B] text-[#FAFAF8] font-mono text-[10px] font-bold px-2 py-0.5 border border-[#FAFAF8]/30 uppercase">
                      {beast.boundAsset} BOUND
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-xl uppercase tracking-tight truncate">
                    {beast.name}
                  </h3>
                  <div className="font-mono text-xs text-[#5D5F5D] flex items-center justify-between">
                    <span>RECORD</span>
                    <span className="font-bold text-[#0A0A0B]">{beast.record.wins}W - {beast.record.losses}L</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1 py-1 font-mono text-[11px] text-center border-t border-[#E5E5E1] pt-2">
                  <div className="bg-[#F4F4F0] p-1">
                    <span className="text-[#5D5F5D] block text-[9px]">PWR</span>
                    <span className="font-bold">{beast.stats.power}</span>
                  </div>
                  <div className="bg-[#F4F4F0] p-1">
                    <span className="text-[#5D5F5D] block text-[9px]">DEF</span>
                    <span className="font-bold">{beast.stats.defense}</span>
                  </div>
                  <div className="bg-[#F4F4F0] p-1">
                    <span className="text-[#5D5F5D] block text-[9px]">SPD</span>
                    <span className="font-bold">{beast.stats.speed}</span>
                  </div>
                  <div className="bg-[#F4F4F0] p-1">
                    <span className="text-[#5D5F5D] block text-[9px]">SPC</span>
                    <span className="font-bold">{beast.stats.special}</span>
                  </div>
                </div>

                <Link
                  href={`/beast/${beast.id}`}
                  className="w-full py-2.5 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-bold text-sm text-center uppercase tracking-wider hover:bg-[#FAFAF8] hover:text-[#0A0A0B] border border-[#0A0A0B] transition-colors block"
                >
                  Inspect Profile
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
