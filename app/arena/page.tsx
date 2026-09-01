'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiCrosshair, 
  FiZap, 
  FiClock, 
  FiCheckCircle, 
  FiPlusSquare, 
} from 'react-icons/fi';
import { MOCK_BATTLES } from '@/lib/mockData';
import { BattleStatus } from '@/lib/types';
import gsap from 'gsap';

export default function ArenaPage() {
  const [filter, setFilter] = useState<'all' | BattleStatus>('all');

  const filteredBattles = MOCK_BATTLES.filter((battle) => {
    if (filter === 'all') return true;
    return battle.status === filter;
  });

  const liveCount = MOCK_BATTLES.filter((b) => b.status === 'live').length;
  const pendingCount = MOCK_BATTLES.filter((b) => b.status === 'pending').length;
  const completedCount = MOCK_BATTLES.filter((b) => b.status === 'completed').length;

  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prevFilter = useRef(filter);

  // Header entrance animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.arena-badge', { opacity: 0, y: -12, duration: 0.45, ease: 'power2.out' });
      gsap.from('.arena-title', { opacity: 0, y: 32, duration: 0.6, ease: 'power3.out', delay: 0.1 });
      gsap.from('.arena-desc', { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out', delay: 0.25 });
      gsap.from('.arena-actions', { opacity: 0, y: 16, duration: 0.45, ease: 'power2.out', delay: 0.35 });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // Animate battle cards on mount (initial load)
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.battle-card', {
        opacity: 0,
        y: 28,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.5,
      });
    }, gridRef);
    return () => ctx.revert();
  }, []);

  // Re-animate cards when filter changes
  useEffect(() => {
    if (prevFilter.current === filter) return;
    prevFilter.current = filter;

    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('.battle-card');
    gsap.fromTo(
      cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' }
    );
  }, [filter]);

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      {/* Header Banner */}
      <section ref={headerRef} className="border-b border-primary bg-background pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="arena-badge inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 bg-secondary" />
                <span>ARENA DISPATCH GRID</span>
              </div>
              <h1 className="arena-title font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
                THE COMBAT ARENA
              </h1>
              <p className="arena-desc font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
                Live agentic combat encounters and pending wagering windows on Somnia Shannon. Spectators can bet on beast outcomes during active 1-hour windows.
              </p>
            </div>

            <div className="arena-actions flex flex-wrap items-center gap-3">
              <Link
                href="/create"
                className="px-6 py-3 bg-primary text-background font-headline font-bold text-sm uppercase tracking-wider hover:bg-background hover:text-primary border border-primary transition-colors inline-flex items-center gap-2"
              >
                <FiPlusSquare className="w-4 h-4" />
                <span>Create Beast</span>
              </Link>
              <button
                disabled
                className="px-6 py-3 bg-neutral text-secondary font-headline font-bold text-sm uppercase tracking-wider border border-outline-variant cursor-not-allowed inline-flex items-center gap-2"
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
      <section className="border-b border-primary bg-background sticky top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 py-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-background border-primary'
                  : 'bg-transparent text-secondary border-transparent hover:border-primary hover:text-primary'
              }`}
            >
              ALL BATTLES ({MOCK_BATTLES.length})
            </button>

            <button
              onClick={() => setFilter('live')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border flex items-center gap-2 transition-colors ${
                filter === 'live'
                  ? 'bg-danger text-background border-danger'
                  : 'bg-transparent text-secondary border-transparent hover:border-primary hover:text-primary'
              }`}
            >
              <span className="w-2 h-2 bg-secondary rounded-none animate-pulse" />
              <span>LIVE COMBAT ({liveCount})</span>
            </button>

            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border flex items-center gap-2 transition-colors ${
                filter === 'pending'
                  ? 'bg-warning text-primary font-bold border-warning'
                  : 'bg-transparent text-secondary border-transparent hover:border-primary hover:text-primary'
              }`}
            >
              <FiClock className="w-3.5 h-3.5" />
              <span>PENDING BETTING ({pendingCount})</span>
            </button>

            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border flex items-center gap-2 transition-colors ${
                filter === 'completed'
                  ? 'bg-primary text-background border-primary'
                  : 'bg-transparent text-secondary border-transparent hover:border-primary hover:text-primary'
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
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBattles.map((battle) => {
            const isLive = battle.status === 'live';
            const isPending = battle.status === 'pending';
            const isCompleted = battle.status === 'completed';

            return (
              <div 
                key={battle.id}
                className="battle-card border border-primary p-6 flex flex-col justify-between gap-6 bg-background"
              >
                {/* Header Status */}
                <div className="flex items-center justify-between border-b border-primary pb-3">
                  <div className="flex items-center gap-2">
                    {isLive && (
                      <>
                        <span className="w-2.5 h-2.5 bg-danger animate-pulse" />
                        <span className="font-headline font-bold text-base uppercase text-primary">
                          LIVE COMBAT
                        </span>
                      </>
                    )}
                    {isPending && (
                      <>
                        <span className="w-2.5 h-2.5 bg-warning" />
                        <span className="font-headline font-bold text-base uppercase text-primary">
                          WAGERING OPEN
                        </span>
                      </>
                    )}
                    {isCompleted && (
                      <>
                        <FiCheckCircle className="w-4 h-4 text-secondary" />
                        <span className="font-headline font-bold text-base uppercase text-secondary">
                          CONCLUDED
                        </span>
                      </>
                    )}
                  </div>
                  <span className="font-mono text-xs text-secondary">
                    ID: {battle.id.slice(0, 10)}
                  </span>
                </div>

                {/* Matchup Center */}
                <div className="grid grid-cols-5 items-center gap-2 py-2">
                  {/* Beast A */}
                  <div className="col-span-2 text-center space-y-2">
                    <div className="relative aspect-square w-20 mx-auto border border-primary overflow-hidden bg-zinc-900">
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
                    <div className="font-mono text-[10px] text-secondary">
                      {battle.beastA.boundAsset ? `${battle.beastA.boundAsset} BOUND` : 'UNBOUND'}
                    </div>
                  </div>

                  {/* VS */}
                  <div className="col-span-1 text-center font-headline font-extrabold text-2xl text-secondary">
                    VS
                  </div>

                  {/* Beast B */}
                  <div className="col-span-2 text-center space-y-2">
                    <div className="relative aspect-square w-20 mx-auto border border-primary overflow-hidden bg-zinc-900">
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
                    <div className="font-mono text-[10px] text-secondary">
                      {battle.beastB.boundAsset ? `${battle.beastB.boundAsset} BOUND` : 'UNBOUND'}
                    </div>
                  </div>
                </div>

                {/* Market Pulse Info */}
                <div className="bg-surface-container-low p-3 border border-neutral font-mono text-xs space-y-1">
                  <div className="flex justify-between text-secondary">
                    <span>WAGER POOL</span>
                    <span className="font-bold text-primary">{battle.totalPoolA + battle.totalPoolB} STT</span>
                  </div>
                  {battle.marketPulseA && (
                    <div className="flex justify-between text-[11px] text-secondary">
                      <span>{battle.beastA.name.split(' ')[0]}</span>
                      <span className="font-bold text-primary">{battle.marketPulseA.modifier.description}</span>
                    </div>
                  )}
                  {battle.marketPulseB && (
                    <div className="flex justify-between text-[11px] text-secondary">
                      <span>{battle.beastB.name.split(' ')[0]}</span>
                      <span className="font-bold text-primary">{battle.marketPulseB.modifier.description}</span>
                    </div>
                  )}
                  {battle.winner && (
                    <div className="flex justify-between text-[11px] font-bold text-primary">
                      <span>WINNER</span>
                      <span>{battle.winner === 'beastA' ? battle.beastA.name : battle.beastB.name}</span>
                    </div>
                  )}
                </div>

                {/* Action CTA */}
                <Link
                  href={`/battle/${battle.id}`}
                  className={`w-full py-3 ${isLive ? "bg-danger border-danger hover:border-primary": "bg-primary border-primary"} text-background font-headline font-bold text-sm text-center uppercase tracking-wider hover:bg-background hover:text-primary border transition-colors flex items-center justify-center gap-2`}
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
