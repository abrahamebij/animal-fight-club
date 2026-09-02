'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FiAward, 
  FiTrendingUp, 
  FiShield, 
  FiSearch,
} from 'react-icons/fi';
import { getAllBeasts } from '@/lib/services/beastService';
import { getAllBets } from '@/lib/services/battleService';
import { Beast, Bet, BoundAsset } from '@/lib/types';
import gsap from 'gsap';

interface DynamicBettorStats {
  address: string;
  totalWagered: number;
  totalBets: number;
  profit: number;
  winRate: number;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'beasts' | 'bettors'>('beasts');
  const [beasts, setBeasts] = useState<Beast[]>([]);
  const [bettors, setBettors] = useState<DynamicBettorStats[]>([]);
  const [search, setSearch] = useState('');
  const [assetFilter, setAssetFilter] = useState<'ALL' | BoundAsset>('ALL');
  const [loading, setLoading] = useState(true);

  const headerRef = useRef<HTMLElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const prevTab = useRef(tab);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      const [allBeasts, allBets] = await Promise.all([
        getAllBeasts(),
        getAllBets(),
      ]);

      if (mounted) {
        setBeasts(allBeasts);

        // Aggregate Bettors from real Firestore bets
        const bettorMap = new Map<string, { totalWagered: number; totalBets: number; wins: number; profit: number }>();
        for (const bet of allBets) {
          const prev = bettorMap.get(bet.bettorAddress) || { totalWagered: 0, totalBets: 0, wins: 0, profit: 0 };
          prev.totalWagered += bet.amount;
          prev.totalBets += 1;
          if (bet.status === 'won') {
            prev.wins += 1;
            prev.profit += Math.round(bet.amount * 0.95);
          } else if (bet.status === 'lost') {
            prev.profit -= bet.amount;
          }
          bettorMap.set(bet.bettorAddress, prev);
        }

        const aggregated: DynamicBettorStats[] = Array.from(bettorMap.entries()).map(([address, stats]) => ({
          address,
          totalWagered: stats.totalWagered,
          totalBets: stats.totalBets,
          profit: stats.profit,
          winRate: stats.totalBets > 0 ? Math.round((stats.wins / stats.totalBets) * 100) : 0,
        })).sort((a, b) => b.totalWagered - a.totalWagered);

        setBettors(aggregated);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Header entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lb-badge', { opacity: 0, y: -12, duration: 0.4, ease: 'power2.out' });
      gsap.from('.lb-title', { opacity: 0, y: 28, duration: 0.55, ease: 'power3.out', delay: 0.1 });
      gsap.from('.lb-desc', { opacity: 0, y: 16, duration: 0.4, ease: 'power2.out', delay: 0.2 });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // Animate table rows in once data loads
  useLayoutEffect(() => {
    if (loading || !tableRef.current) return;
    const rows = tableRef.current.querySelectorAll('.lb-row');
    gsap.fromTo(rows,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out' }
    );
  }, [loading, tab]);

  // Re-animate rows on tab switch
  useEffect(() => {
    if (prevTab.current === tab) return;
    prevTab.current = tab;
    if (!tableRef.current) return;
    const rows = tableRef.current.querySelectorAll('.lb-row');
    gsap.fromTo(rows,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
    );
  }, [tab]);

  // Sort beasts by wins then winRate
  const sortedBeasts = [...beasts]
    .filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
      const matchesAsset = 
        assetFilter === 'ALL' || 
        (assetFilter === 'UNBOUND' && !b.boundAsset) || 
        b.boundAsset === assetFilter;
      return matchesSearch && matchesAsset;
    })
    .sort((a, b) => {
      const rateA = a.record.wins + a.record.losses > 0 ? a.record.wins / (a.record.wins + a.record.losses) : 0;
      const rateB = b.record.wins + b.record.losses > 0 ? b.record.wins / (b.record.wins + b.record.losses) : 0;
      if (b.record.wins !== a.record.wins) return b.record.wins - a.record.wins;
      return rateB - rateA;
    });

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      {/* Header */}
      <section ref={headerRef} className="border-b border-primary bg-background pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="lb-badge inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider mb-3">
            <span className="w-2 h-2 bg-secondary" />
            <span>GLOBAL RANKINGS // PROVING GROUNDS</span>
          </div>
          <h1 className="lb-title font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
            ARENA LEADERBOARDS
          </h1>
          <p className="lb-desc font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
            Historical combat rankings and spectator wagering records on Somnia Shannon. Auditable victory counts and prediction accuracy.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-primary bg-background sticky top-16 z-30">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 flex items-center justify-between overflow-x-auto py-3 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTab('beasts')}
              className={`px-5 py-2.5 font-headline font-bold text-base uppercase tracking-wider border transition-colors flex items-center gap-2 ${
                tab === 'beasts'
                  ? 'bg-primary text-background border-primary'
                  : 'bg-transparent text-secondary border-transparent hover:border-primary hover:text-primary'
              }`}
            >
              <FiShield className="w-4 h-4" />
              <span>TOP COMBAT BEASTS ({beasts.length})</span>
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
              <span>TOP SPECTATOR BETTORS ({bettors.length})</span>
            </button>
          </div>

          {tab === 'beasts' && (
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center border border-primary bg-surface-container-low px-2 py-1">
                <FiSearch className="w-3.5 h-3.5 text-secondary mr-2" />
                <input
                  type="text"
                  placeholder="FILTER BY NAME..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-primary placeholder:text-secondary focus:outline-none uppercase font-bold text-xs"
                />
              </div>

              <select
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value as 'ALL' | BoundAsset)}
                className="bg-surface-container-low border border-primary p-1.5 font-headline font-bold text-xs uppercase"
              >
                <option value="ALL">ALL ASSETS</option>
                <option value="BTC">BTC BOUND</option>
                <option value="ETH">ETH BOUND</option>
                <option value="UNBOUND">UNBOUND</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Table Content */}
      <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10">
        <div ref={tableRef}>
        {tab === 'beasts' ? (
          <div className="border border-primary bg-background overflow-x-auto">
            {sortedBeasts.length > 0 ? (
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
                  {sortedBeasts.map((beast, idx) => {
                    const rank = idx + 1;
                    const totalDuels = beast.record.wins + beast.record.losses;
                    const winRate = totalDuels > 0 ? Math.round((beast.record.wins / totalDuels) * 100) : 0;

                    return (
                      <tr key={beast.id} className="lb-row hover:bg-surface-container-low transition-colors">
                        <td className="p-4 text-center font-bold">
                          <span className={`inline-flex items-center justify-center w-7 h-7 ${
                            rank === 1 ? 'bg-primary text-background font-bold' :
                            rank === 2 ? 'bg-neutral text-primary font-bold' :
                            rank === 3 ? 'bg-surface-container-low text-primary' : 'text-secondary'
                          }`}>
                            {rank}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 border border-primary overflow-hidden bg-zinc-900 flex-shrink-0">
                              <Image
                                src={beast.avatarUrl}
                                alt={beast.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="font-headline font-bold text-base uppercase text-primary">
                              {beast.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-secondary">
                          {beast.ownerAddress}
                        </td>
                        <td className="p-4">
                          {beast.boundAsset && beast.boundAsset !== 'UNBOUND' ? (
                            <span className="px-2 py-0.5 bg-primary text-background font-bold text-[10px] uppercase">
                              {beast.boundAsset} BOUND
                            </span>
                          ) : (
                            <span className="text-secondary">UNBOUND</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-primary">
                          {beast.record.wins}W - {beast.record.losses}L
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-primary">{winRate}%</span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/beast/${beast.id}`}
                            className="px-3 py-1.5 bg-primary text-background font-headline font-bold uppercase hover:bg-secondary transition-colors inline-block"
                          >
                            Inspect
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center font-mono text-xs text-secondary space-y-3">
                <FiShield className="w-8 h-8 mx-auto text-primary" />
                <p className="font-bold uppercase text-primary">No combat beasts registered yet</p>
                <p>Forge your custom cybernetic beast to enter the arena leaderboards.</p>
                <Link
                  href="/create"
                  className="inline-block px-4 py-2 bg-primary text-background font-headline font-bold uppercase text-xs hover:bg-neutral hover:text-primary transition-colors border border-primary mt-2"
                >
                  Forge New Beast
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-primary bg-background overflow-x-auto">
            {bettors.length > 0 ? (
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
                  {bettors.map((entry, idx) => (
                    <tr key={entry.address} className="lb-row hover:bg-surface-container-low transition-colors">
                      <td className="p-4 text-center font-bold">
                        <span className={`inline-flex items-center justify-center w-7 h-7 ${
                          idx === 0 ? 'bg-primary text-background font-bold' :
                          idx === 1 ? 'bg-neutral text-primary' :
                          idx === 2 ? 'bg-surface-container-low text-primary' : 'text-secondary'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-primary">
                        {entry.address}
                      </td>
                      <td className="p-4 text-secondary">
                        {entry.totalWagered} STT
                      </td>
                      <td className="p-4 font-bold text-primary">
                        {entry.profit >= 0 ? `+${entry.profit}` : entry.profit} STT
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
            ) : (
              <div className="p-12 text-center font-mono text-xs text-secondary space-y-3">
                <FiTrendingUp className="w-8 h-8 mx-auto text-primary" />
                <p className="font-bold uppercase text-primary">No spectator wagers recorded yet</p>
                <p>Spectator bets placed during pending battle windows will be indexed here automatically.</p>
                <Link
                  href="/arena"
                  className="inline-block px-4 py-2 bg-primary text-background font-headline font-bold uppercase text-xs hover:bg-neutral hover:text-primary transition-colors border border-primary mt-2"
                >
                  Browse Arena Battles
                </Link>
              </div>
            )}
          </div>
        )}
        </div>
      </section>
    </div>
  );
}
