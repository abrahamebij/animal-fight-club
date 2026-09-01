'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiCrosshair, 
  FiPlusSquare, 
  FiClock, 
  FiArrowRight, 
} from 'react-icons/fi';
import { MOCK_BATTLES, MOCK_BEASTS } from '@/lib/mockData';

export default function HomePage() {
  const liveBattle = MOCK_BATTLES.find((b) => b.status === 'live');
  const pendingBattle = MOCK_BATTLES.find((b) => b.status === 'pending');

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground">
      {/* 1. HERO SECTION */}
      <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-primary p-6 lg:p-12 bg-background">
          <div className="lg:col-span-7 flex flex-col justify-between gap-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-background font-mono text-xs uppercase tracking-wider">
                <span className="w-2 h-2 bg-secondary" />
                <span>SOMNIA SHANNON // EVENT CONTRACT ARENA</span>
              </div>

              <h1 className="font-headline font-extrabold text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tighter uppercase text-primary">
                CREATE YOUR BEAST.<br />
                WATCH IT FIGHT.<br />
                BET ON THE WINNER.
              </h1>

              <p className="font-sans text-base lg:text-xl text-secondary max-w-xl leading-relaxed">
                Primal AI combat meets precision financial forecasting. Forge your agent from raw parameters, enter the pit, and let live DreamDEX Event Contract market odds power real-time combat modifiers.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                href="/create"
                className="px-8 py-4 bg-primary text-background font-headline font-bold text-lg uppercase tracking-wider hover:bg-background hover:text-primary border border-primary transition-colors inline-flex items-center gap-2"
              >
                <FiPlusSquare className="w-5 h-5" />
                <span>Create Your Beast</span>
              </Link>
              <Link 
                href="/arena"
                className="px-8 py-4 bg-transparent text-primary font-headline font-bold text-lg uppercase tracking-wider hover:bg-primary hover:text-background border border-primary transition-colors inline-flex items-center gap-2"
              >
                <FiCrosshair className="w-5 h-5" />
                <span>Enter The Arena</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="border border-primary p-4 bg-primary text-background flex flex-col gap-4">
              <div className="flex items-center justify-between font-mono text-[11px] text-background/60 border-b border-background/20 pb-2">
                <span>COMBAT_SIMULATION // SEQ_01</span>
                <span className="text-danger font-bold">STATUS: ACTIVE</span>
              </div>

              <div className="relative aspect-video w-full overflow-hidden border border-background/20 bg-zinc-900">
                <Image
                  src="/assets/stitch/home/asset_1.jpg"
                  alt="Apex Mecha-Kong Combatant"
                  fill
                  className="object-cover opacity-80"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-xs">
                  <span className="bg-primary px-2 py-1 border border-background/30 font-bold uppercase">
                    APEX MECHA-KONG
                  </span>
                  <span className="bg-primary-container text-background px-2 py-1 border border-background/30 font-bold">
                    BTC PULSE: +2 PWR
                  </span>
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-background/70">
                  <span>ORACLE INPUT</span>
                  <span className="text-background">DREAMDEX BTC/USDso 15M</span>
                </div>
                <div className="flex justify-between text-background/70">
                  <span>ODDS SPREAD</span>
                  <span className="text-background">UP: 68% // DOWN: 32%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS / PROTOCOL */}
      <section className="border-y border-primary bg-primary text-background py-20">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-background/60">PROTOCOL EXECUTION FLOW</span>
            <div className="flex-grow h-[1px] bg-background/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border border-background/20">
            {/* Step 1 */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-background/20 flex flex-col justify-between gap-6 relative overflow-hidden group">
              <div className="absolute top-2 right-4 text-7xl font-headline font-extrabold text-background/5 group-hover:text-background/15 transition-colors">
                01
              </div>
              <div className="space-y-3 relative z-10">
                <span className="font-mono text-xs text-background/60 uppercase font-bold">PHASE / 01</span>
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight text-background">
                  CREATE YOUR BEAST
                </h3>
                <p className="font-sans text-sm text-background/70 leading-relaxed">
                  Allocate stat points into Power, Defense, Speed, and Special. Equip perks and optionally bind your beast to BTC or ETH market order books.
                </p>
              </div>
              <Link href="/create" className="font-mono text-xs uppercase tracking-wider text-background flex items-center gap-1.5 hover:text-secondary transition-colors">
                <span>Forge Beast</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-background/20 flex flex-col justify-between gap-6 relative overflow-hidden group bg-background/[0.02]">
              <div className="absolute top-2 right-4 text-7xl font-headline font-extrabold text-background/5 group-hover:text-background/15 transition-colors">
                02
              </div>
              <div className="space-y-3 relative z-10">
                <span className="font-mono text-xs text-warning uppercase font-bold">PHASE / 02</span>
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight text-background">
                  1-HOUR BETTING & MARKET PULSE
                </h3>
                <p className="font-sans text-sm text-background/70 leading-relaxed">
                  When a challenge is accepted, a 1-hour betting window opens. Live DreamDEX Event Contract odds are read and locked in as combat modifiers.
                </p>
              </div>
              <Link href="/arena" className="font-mono text-xs uppercase tracking-wider text-background flex items-center gap-1.5 hover:text-warning transition-colors">
                <span>View Wagers</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="p-8 flex flex-col justify-between gap-6 relative overflow-hidden group">
              <div className="absolute top-2 right-4 text-7xl font-headline font-extrabold text-background/5 group-hover:text-background/15 transition-colors">
                03
              </div>
              <div className="space-y-3 relative z-10">
                <span className="font-mono text-xs text-background/40 uppercase font-bold">PHASE / 03</span>
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight text-background">
                  LLM-REASONED COMBAT & SETTLEMENT
                </h3>
                <p className="font-sans text-sm text-background/70 leading-relaxed">
                  Combat executes turn-by-turn with full battle context reasoning. HP resolves dynamically, winners take the purse, and escrow pays out winning bets.
                </p>
              </div>
              <Link href="/arena" className="font-mono text-xs uppercase tracking-wider text-background flex items-center gap-1.5 hover:text-background/80 transition-colors">
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
            <div className="font-mono text-xs text-secondary uppercase tracking-widest">REAL-TIME DISPATCH</div>
            <h2 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-primary">
              ARENA COMBAT MONITOR
            </h2>
          </div>
          <Link
            href="/arena"
            className="font-mono text-xs uppercase tracking-wider text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Browse All Battles</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Battle Card */}
          {liveBattle && (
            <div className="border-2 border-primary p-6 bg-background flex flex-col justify-between gap-6 relative">
              <div className="flex items-center justify-between border-b border-primary pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-danger animate-pulse" />
                  <span className="font-headline font-bold text-xl uppercase tracking-wider text-danger">
                    LIVE COMBAT IN PROGRESS
                  </span>
                </div>
                <span className="font-mono text-xs text-secondary">ROUND {liveBattle.combatLog.length}</span>
              </div>

              <div className="grid grid-cols-5 items-center gap-4 py-2">
                {/* Fighter A */}
                <div className="col-span-2 text-center space-y-2">
                  <div className="relative aspect-square w-24 mx-auto border border-primary">
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
                  <div className="font-mono text-xs text-danger font-bold">
                    {liveBattle.combatLog[liveBattle.combatLog.length - 1]?.beastAHp ?? 100} / 100 HP
                  </div>
                </div>

                {/* VS Center */}
                <div className="col-span-1 text-center font-headline font-extrabold text-3xl text-secondary">
                  VS
                </div>

                {/* Fighter B */}
                <div className="col-span-2 text-center space-y-2">
                  <div className="relative aspect-square w-24 mx-auto border border-primary">
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
                  <div className="font-mono text-xs text-danger font-bold">
                    {liveBattle.combatLog[liveBattle.combatLog.length - 1]?.beastBHp ?? 100} / 100 HP
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 border border-neutral font-mono text-xs text-secondary line-clamp-2">
                {liveBattle.combatLog[liveBattle.combatLog.length - 1]?.combatNarrative}
              </div>

              <Link
                href={`/battle/${liveBattle.id}`}
                className="w-full py-3.5 bg-danger text-white font-headline font-bold text-center text-base uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiCrosshair className="w-4 h-4" />
                <span>Enter Live Battle View</span>
              </Link>
            </div>
          )}

          {/* Pending Battle Card */}
          {pendingBattle && (
            <div className="border border-primary p-6 bg-background flex flex-col justify-between gap-6">
              <div className="flex items-center justify-between border-b border-primary pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-warning" />
                  <span className="font-headline font-bold text-xl uppercase tracking-wider text-primary">
                    PENDING WAGERING WINDOW
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs text-warning font-bold">
                  <FiClock className="w-3.5 h-3.5" />
                  <span>40:00 REMAINING</span>
                </div>
              </div>

              <div className="grid grid-cols-5 items-center gap-4 py-2">
                {/* Fighter A */}
                <div className="col-span-2 text-center space-y-2">
                  <div className="relative aspect-square w-24 mx-auto border border-primary">
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
                  <div className="font-mono text-xs text-secondary">
                    {pendingBattle.beastA.boundAsset ? `Bound: ${pendingBattle.beastA.boundAsset}` : 'Unbound'}
                  </div>
                </div>

                {/* VS Center */}
                <div className="col-span-1 text-center font-headline font-extrabold text-3xl text-secondary">
                  VS
                </div>

                {/* Fighter B */}
                <div className="col-span-2 text-center space-y-2">
                  <div className="relative aspect-square w-24 mx-auto border border-primary">
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
                  <div className="font-mono text-xs text-secondary">
                    {pendingBattle.beastB.boundAsset ? `Bound: ${pendingBattle.beastB.boundAsset}` : 'Unbound'}
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 border border-neutral flex items-center justify-between font-mono text-xs">
                <span>TOTAL WAGER POOL</span>
                <span className="font-bold text-primary">{pendingBattle.totalPoolA + pendingBattle.totalPoolB} STT</span>
              </div>

              <Link
                href={`/battle/${pendingBattle.id}`}
                className="w-full py-3.5 bg-primary text-background font-headline font-bold text-center text-base uppercase tracking-wider hover:bg-background hover:text-primary border border-primary transition-colors flex items-center justify-center gap-2"
              >
                <FiCrosshair className="w-4 h-4" />
                <span>Place Wager & Inspect Odds</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. ROSTER HIGHLIGHTS */}
      <section className="border-t border-primary bg-background py-20">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="font-mono text-xs text-secondary uppercase tracking-widest">CHAMPION BEASTS</div>
              <h2 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-primary">
                HALL OF COMBATANTS
              </h2>
            </div>
            <Link
              href="/leaderboard"
              className="font-mono text-xs uppercase tracking-wider text-primary border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors flex items-center gap-1.5"
            >
              <span>View Leaderboard</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_BEASTS.slice(0, 4).map((beast) => (
              <div 
                key={beast.id} 
                className="border border-primary bg-background p-4 flex flex-col justify-between gap-4 group hover:border-primary transition-colors"
              >
                <div className="relative aspect-square w-full border border-primary overflow-hidden bg-zinc-900">
                  <Image
                    src={beast.avatarUrl}
                    alt={beast.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {beast.boundAsset && (
                    <div className="absolute top-2 right-2 bg-primary text-background font-mono text-[10px] font-bold px-2 py-0.5 border border-background/30 uppercase">
                      {beast.boundAsset} BOUND
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-xl uppercase tracking-tight truncate">
                    {beast.name}
                  </h3>
                  <div className="font-mono text-xs text-secondary flex items-center justify-between">
                    <span>RECORD</span>
                    <span className="font-bold text-primary">{beast.record.wins}W - {beast.record.losses}L</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1 py-1 font-mono text-[11px] text-center border-t border-neutral pt-2">
                  <div className="bg-surface-container-low p-1">
                    <span className="text-secondary block text-[9px]">PWR</span>
                    <span className="font-bold">{beast.stats.power}</span>
                  </div>
                  <div className="bg-surface-container-low p-1">
                    <span className="text-secondary block text-[9px]">DEF</span>
                    <span className="font-bold">{beast.stats.defense}</span>
                  </div>
                  <div className="bg-surface-container-low p-1">
                    <span className="text-secondary block text-[9px]">SPD</span>
                    <span className="font-bold">{beast.stats.speed}</span>
                  </div>
                  <div className="bg-surface-container-low p-1">
                    <span className="text-secondary block text-[9px]">SPC</span>
                    <span className="font-bold">{beast.stats.special}</span>
                  </div>
                </div>

                <Link
                  href={`/beast/${beast.id}`}
                  className="w-full py-2.5 bg-primary text-background font-headline font-bold text-sm text-center uppercase tracking-wider hover:bg-background hover:text-primary border border-primary transition-colors block"
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
