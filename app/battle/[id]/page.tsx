'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FiCrosshair, 
  FiZap, 
  FiClock, 
  FiActivity, 
  FiTrendingUp, 
  FiExternalLink, 
  FiArrowLeft,
  FiTerminal
} from 'react-icons/fi';
import { useWalletGate } from '@/components/wallet/useWalletGate';
import { MOCK_BATTLES } from '@/lib/mockData';
import { Battle, CombatTurn } from '@/lib/types';
import gsap from 'gsap';

export default function BattleViewPage() {
  const params = useParams();
  const battleId = (params?.id as string) || 'battle_live_01';

  const battle: Battle = MOCK_BATTLES.find((b) => b.id === battleId) || MOCK_BATTLES[0];

  // Betting state for spectators
  const [selectedSide, setSelectedSide] = useState<'beastA' | 'beastB'>('beastA');
  const [betAmount, setBetAmount] = useState<string>('50');
  const [betPlaced, setBetPlaced] = useState<boolean>(false);

  const isLive = battle.status === 'live';
  const isPending = battle.status === 'pending';
  const isCompleted = battle.status === 'completed';

  const lastTurn: CombatTurn | undefined = battle.combatLog[battle.combatLog.length - 1];
  const hpA = lastTurn?.beastAHp ?? 100;
  const hpB = lastTurn?.beastBHp ?? 100;

  const containerRef = useRef<HTMLDivElement>(null);
  const hpBarARef = useRef<HTMLDivElement>(null);
  const hpBarBRef = useRef<HTMLDivElement>(null);
  const betBtnRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const prevLogLength = useRef(battle.combatLog.length);

  // Mount entrance: stagger the 3 fighter columns in
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fighter-panel', {
        opacity: 0,
        x: (i) => (i === 0 ? -80 : i === 2 ? 80 : 0),
        y: (i) => (i === 1 ? 30 : 0),
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      });
      gsap.from('.bottom-panel', {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.5,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // HP bars: animate width on mount
  useEffect(() => {
    if (hpBarARef.current) {
      gsap.fromTo(
        hpBarARef.current,
        { width: '100%' },
        { width: `${Math.max(0, hpA)}%`, duration: 1.2, ease: 'power2.inOut', delay: 0.9 }
      );
    }
    if (hpBarBRef.current) {
      gsap.fromTo(
        hpBarBRef.current,
        { width: '100%' },
        { width: `${Math.max(0, hpB)}%`, duration: 1.2, ease: 'power2.inOut', delay: 1.0 }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // HP bars: animate on value change (after mount)
  useEffect(() => {
    if (hpBarARef.current) {
      gsap.to(hpBarARef.current, {
        width: `${Math.max(0, hpA)}%`,
        duration: 0.7,
        ease: 'power2.out',
      });
      if (hpA < 100) {
        // Flash red on damage
        gsap.to(hpBarARef.current, {
          backgroundColor: '#DC2626',
          duration: 0.08,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            if (hpBarARef.current) {
              gsap.set(hpBarARef.current, { backgroundColor: hpA <= 25 ? '#DC2626' : 'var(--primary)' });
            }
          },
        });
      }
    }
    if (hpBarBRef.current) {
      gsap.to(hpBarBRef.current, {
        width: `${Math.max(0, hpB)}%`,
        duration: 0.7,
        ease: 'power2.out',
      });
      if (hpB < 100) {
        gsap.to(hpBarBRef.current, {
          backgroundColor: '#DC2626',
          duration: 0.08,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            if (hpBarBRef.current) {
              gsap.set(hpBarBRef.current, { backgroundColor: hpB <= 25 ? '#DC2626' : 'var(--primary)' });
            }
          },
        });
      }
    }
  }, [hpA, hpB]);

  // Animate new combat log entries as they appear
  useEffect(() => {
    const currentLength = battle.combatLog.length;
    if (currentLength > prevLogLength.current && logRef.current) {
      const entries = logRef.current.querySelectorAll('.log-entry');
      const newEntries = Array.from(entries).slice(prevLogLength.current);
      gsap.from(newEntries, {
        opacity: 0,
        y: -12,
        duration: 0.35,
        stagger: 0.06,
        ease: 'power2.out',
      });
    }
    prevLogLength.current = currentLength;
  }, [battle.combatLog.length]);

  const { requireAuth } = useWalletGate();

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();

    requireAuth({
      actionTitle: `place a ${betAmount} STT wager on ${selectedSide === 'beastA' ? battle.beastA.name : battle.beastB.name}`,
      onSuccess: () => {
        setBetPlaced(true);
        // Bounce animation on the button
        if (betBtnRef.current) {
          gsap.fromTo(
            betBtnRef.current,
            { scale: 0.94 },
            { scale: 1, duration: 0.45, ease: 'elastic.out(1.3, 0.5)' }
          );
        }
        setTimeout(() => setBetPlaced(false), 3000);
      },
    });
  };

  return (
    <div ref={containerRef} className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      {/* Top Breadcrumb & Status Bar */}
      <div className="border-b border-primary bg-background">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-14 flex items-center justify-between font-mono text-xs">
          <Link
            href="/arena"
            className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>BACK TO ARENA</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 ${isLive ? 'bg-secondary animate-pulse' : isPending ? 'bg-warning' : 'bg-primary'}`} />
              <span className="font-bold uppercase">
                {isLive ? 'LIVE COMBAT FEED' : isPending ? 'PENDING BETTING WINDOW' : 'COMBAT CONCLUDED'}
              </span>
            </div>
            <span className="text-neutral">|</span>
            <span className="text-secondary">BATTLE ID: {battle.id}</span>
          </div>
        </div>
      </div>

      {/* Main Battle Arena Grid */}
      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-8 space-y-8">
        {/* 1. Combatants Visual Duel Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Fighter A Panel (4 cols) */}
          <div className="fighter-panel lg:col-span-4 border-2 border-primary p-6 bg-background flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-primary pb-2">
                <span className="font-mono text-xs text-secondary font-bold">COMBATANT 01 // ALPHA</span>
                <span className="font-mono text-xs text-secondary">{battle.beastA.ownerAddress}</span>
              </div>

              <div className="relative aspect-square w-full border border-primary overflow-hidden bg-zinc-900">
                <Image
                  src={battle.beastA.avatarUrl}
                  alt={battle.beastA.name}
                  fill
                  className="object-cover"
                  priority
                />
                {battle.beastA.boundAsset && (
                  <div className="absolute top-2 right-2 bg-primary text-background font-mono text-[11px] font-bold px-2.5 py-1">
                    {battle.beastA.boundAsset} BOUND
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-headline font-extrabold text-3xl uppercase tracking-tight text-primary">
                  {battle.beastA.name}
                </h2>
                <div className="font-mono text-xs text-secondary">
                  RECORD: {battle.beastA.record.wins}W - {battle.beastA.record.losses}L
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between font-bold">
                  <span>HEALTH INTEGRITY</span>
                  <span className={hpA <= 25 ? 'text-danger font-bold' : 'text-primary'}>{hpA} / 100 HP</span>
                </div>
                <div className="w-full h-3.5 bg-neutral border border-primary p-0.5">
                  <div
                    ref={hpBarARef}
                    className={`h-full ${hpA <= 25 ? 'bg-danger' : 'bg-primary'}`}
                    style={{ width: `${Math.max(0, hpA)}%` }}
                  />
                </div>
              </div>

              {/* Stats & Market Modifier */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs border-t border-neutral pt-3">
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">PWR</div>
                  <div className="font-bold">{battle.beastA.stats.power}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">DEF</div>
                  <div className="font-bold">{battle.beastA.stats.defense}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">SPD</div>
                  <div className="font-bold">{battle.beastA.stats.speed}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">SPC</div>
                  <div className="font-bold">{battle.beastA.stats.special}</div>
                </div>
              </div>

              {battle.marketPulseA && (
                <div className="border border-primary bg-surface-container-low p-3 font-mono text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold uppercase">
                    <FiTrendingUp className="w-3.5 h-3.5" />
                    <span>LOCKED MARKET PULSE:</span>
                  </div>
                  <div className="text-primary font-bold">
                    {battle.marketPulseA.modifier.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Live Combat Log & Reasoner Feed (4 cols) */}
          <div className="fighter-panel lg:col-span-4 border-2 border-primary p-6 bg-primary text-background flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-background/20 pb-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-background/80">
                  <FiTerminal className="w-4 h-4 text-secondary" />
                  <span>LLM COMBAT REASONER</span>
                </div>
                <span className="text-warning font-bold">
                  {isLive ? `ROUND ${battle.combatLog.length}` : isPending ? 'WINDOW OPEN' : 'CONCLUDED'}
                </span>
              </div>

              {/* Combat narrative output */}
              <div className="space-y-4 min-h-[220px]">
                {lastTurn ? (
                  <div className="space-y-3 bg-background/5 p-4 border border-background/10 font-mono text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-background">TURN {lastTurn.turnNumber}: {lastTurn.actionName}</span>
                      <span className="text-danger">-{lastTurn.damageDealt} HP</span>
                    </div>
                    <p className="text-background text-sm leading-relaxed font-sans">
                      {lastTurn.combatNarrative}
                    </p>
                    <div className="text-background/60 text-[11px] border-t border-background/10 pt-2">
                      <span className="text-warning font-bold">AGENT REASONING: </span>
                      {lastTurn.reasoning}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 font-mono text-xs text-background/60 space-y-2">
                    <FiClock className="w-8 h-8 mx-auto text-warning" />
                    <p className="text-sm font-bold text-background">Awaiting Window Expiry</p>
                    <p>Combat will execute turn-by-turn with LLM reasoning when betting window closes.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Battle Log History list */}
            <div className="border-t border-background/20 pt-3 space-y-2">
              <div className="font-mono text-[11px] text-background/40 uppercase">
                COMBAT EVENT LOG ({battle.combatLog.length} TURNS)
              </div>
              <div ref={logRef} className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-2">
                {battle.combatLog.map((turn) => (
                  <div key={turn.turnNumber} className="log-entry flex justify-between text-background/70 border-b border-background/5 pb-1">
                    <span>T{turn.turnNumber} [{turn.actor === 'beastA' ? battle.beastA.name.split(' ')[0] : battle.beastB.name.split(' ')[0]}]: {turn.actionName}</span>
                    <span className="text-danger font-bold">-{turn.damageDealt} HP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fighter B Panel (4 cols) */}
          <div className="fighter-panel lg:col-span-4 border-2 border-primary p-6 bg-background flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-primary pb-2">
                <span className="font-mono text-xs text-secondary font-bold">COMBATANT 02 // BRAVO</span>
                <span className="font-mono text-xs text-secondary">{battle.beastB.ownerAddress}</span>
              </div>

              <div className="relative aspect-square w-full border border-primary overflow-hidden bg-zinc-900">
                <Image
                  src={battle.beastB.avatarUrl}
                  alt={battle.beastB.name}
                  fill
                  className="object-cover"
                  priority
                />
                {battle.beastB.boundAsset && (
                  <div className="absolute top-2 right-2 bg-primary text-background font-mono text-[11px] font-bold px-2.5 py-1">
                    {battle.beastB.boundAsset} BOUND
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-headline font-extrabold text-3xl uppercase tracking-tight text-primary">
                  {battle.beastB.name}
                </h2>
                <div className="font-mono text-xs text-secondary">
                  RECORD: {battle.beastB.record.wins}W - {battle.beastB.record.losses}L
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between font-bold">
                  <span>HEALTH INTEGRITY</span>
                  <span className={hpB <= 25 ? 'text-danger font-bold' : 'text-primary'}>{hpB} / 100 HP</span>
                </div>
                <div className="w-full h-3.5 bg-neutral border border-primary p-0.5">
                  <div
                    ref={hpBarBRef}
                    className={`h-full ${hpB <= 25 ? 'bg-danger' : 'bg-primary'}`}
                    style={{ width: `${Math.max(0, hpB)}%` }}
                  />
                </div>
              </div>

              {/* Stats & Market Modifier */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs border-t border-neutral pt-3">
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">PWR</div>
                  <div className="font-bold">{battle.beastB.stats.power}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">DEF</div>
                  <div className="font-bold">{battle.beastB.stats.defense}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">SPD</div>
                  <div className="font-bold">{battle.beastB.stats.speed}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">SPC</div>
                  <div className="font-bold">{battle.beastB.stats.special}</div>
                </div>
              </div>

              {battle.marketPulseB && (
                <div className="border border-primary bg-surface-container-low p-3 font-mono text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold uppercase">
                    <FiTrendingUp className="w-3.5 h-3.5" />
                    <span>LOCKED MARKET PULSE:</span>
                  </div>
                  <div className="text-primary font-bold">
                    {battle.marketPulseB.modifier.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Market Pulse Terminal & Spectator Wagering Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Market Pulse Panel (7 cols) */}
          <div className="bottom-panel lg:col-span-7 border border-primary p-6 bg-background space-y-6">
            <div className="flex items-center justify-between border-b border-primary pb-3">
              <div className="flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  DREAMDEX MARKET PULSE INTEGRATION
                </h3>
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 bg-primary text-background">
                READ-ONLY SDK
              </span>
            </div>

            <p className="font-sans text-xs text-secondary leading-relaxed">
              This panel verifies real-time order book odds from DreamDEX Event Contracts on Somnia Shannon. The locked-in probability generates an in-combat attribute modifier for bound beasts.
            </p>

            <div className="space-y-4">
              {/* Asset A Pulse */}
              {battle.marketPulseA && (
                <div className="border border-neutral p-4 bg-surface-container-low space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold uppercase text-primary">
                      {battle.beastA.name} // {battle.marketPulseA.symbol}
                    </div>
                    <span className="text-primary font-bold">
                      UP PROBABILITY: {Math.round(battle.marketPulseA.upProbability * 100)}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-neutral flex overflow-hidden border border-primary">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${battle.marketPulseA.upProbability * 100}%` }} 
                    />
                    <div 
                      className="h-full bg-secondary" 
                      style={{ width: `${(1 - battle.marketPulseA.upProbability) * 100}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-secondary">
                    <span>BEST BID: {battle.marketPulseA.bestBid} // BEST ASK: {battle.marketPulseA.bestAsk}</span>
                    {battle.marketPulseA.oracleQuestionId && (
                      <a
                        href={`https://prd.oracle.somnia.host/questions/${battle.marketPulseA.oracleQuestionId}?view=graph`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline inline-flex items-center gap-1 hover:text-secondary"
                      >
                        <span>Audit Oracle Resolution</span>
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Asset B Pulse */}
              {battle.marketPulseB ? (
                <div className="border border-neutral p-4 bg-surface-container-low space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold uppercase text-primary">
                      {battle.beastB.name} // {battle.marketPulseB.symbol}
                    </div>
                    <span className="text-primary font-bold">
                      UP PROBABILITY: {Math.round(battle.marketPulseB.upProbability * 100)}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-neutral flex overflow-hidden border border-primary">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${battle.marketPulseB.upProbability * 100}%` }} 
                    />
                    <div 
                      className="h-full bg-secondary" 
                      style={{ width: `${(1 - battle.marketPulseB.upProbability) * 100}%` }} 
                    />
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-outline-variant p-4 text-center font-mono text-xs text-secondary">
                  {battle.beastB.name} is UNBOUND — No DreamDEX Market Pulse applied.
                </div>
              )}
            </div>
          </div>

          {/* Spectator Wagering Panel (5 cols) */}
          <div className="bottom-panel lg:col-span-5 border-2 border-primary p-6 bg-background space-y-6">
            <div className="flex items-center justify-between border-b border-primary pb-3">
              <div className="flex items-center gap-2">
                <FiZap className="w-5 h-5 text-warning" />
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  SPECTATOR WAGERING
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-primary">
                ESCROW POOL
              </span>
            </div>

            {/* Total Pools */}
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="border border-primary p-3 bg-surface-container-low">
                <span className="text-secondary block text-[10px] uppercase">{battle.beastA.name} POOL</span>
                <span className="font-bold text-base">{battle.totalPoolA} STT</span>
              </div>
              <div className="border border-primary p-3 bg-surface-container-low">
                <span className="text-secondary block text-[10px] uppercase">{battle.beastB.name} POOL</span>
                <span className="font-bold text-base">{battle.totalPoolB} STT</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePlaceBet} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-2 font-bold">
                  SELECT PREDICTED VICTOR
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSide('beastA')}
                    className={`p-3 font-headline font-bold text-sm uppercase tracking-wider border text-left transition-colors ${
                      selectedSide === 'beastA'
                        ? 'bg-primary text-background border-primary'
                        : 'bg-surface-container-low text-primary border-neutral'
                    }`}
                  >
                    {battle.beastA.name}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSide('beastB')}
                    className={`p-3 font-headline font-bold text-sm uppercase tracking-wider border text-left transition-colors ${
                      selectedSide === 'beastB'
                        ? 'bg-primary text-background border-primary'
                        : 'bg-surface-container-low text-primary border-neutral'
                    }`}
                  >
                    {battle.beastB.name}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-1.5 font-bold">
                  WAGER AMOUNT (STT)
                </label>
                <input
                  type="number"
                  min="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-surface-container-low border border-primary p-3 font-mono font-bold text-base text-primary focus:outline-none"
                  placeholder="50"
                />
              </div>

              <button
                ref={betBtnRef}
                type="submit"
                disabled={!isPending && !isLive}
                className="w-full py-4 bg-primary text-background font-headline font-extrabold text-lg uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiZap className="w-4 h-4" />
                <span>{betPlaced ? 'WAGER SUBMITTED TO ESCROW' : 'CONFIRM SPECTATOR WAGER'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
