'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  FiCrosshair, 
  FiArrowLeft,
  FiShield,
  FiZap,
} from 'react-icons/fi';
import { useWalletGate } from '@/components/wallet/useWalletGate';
import { getBeastById } from '@/lib/services/beastService';
import { getAllBattles } from '@/lib/services/battleService';
import { Beast, Battle } from '@/lib/types';
import { AVAILABLE_PERKS } from '@/lib/constants/game';
import { formatDate } from '@/lib/utils/timer';

export default function BeastProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { requireAuth } = useWalletGate();
  const beastId = (params?.id as string) || '';

  const [beast, setBeast] = useState<Beast | null>(null);
  const [beastBattles, setBeastBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadBeast() {
      if (!beastId) return;
      setLoading(true);
      const [data, allBattles] = await Promise.all([
        getBeastById(beastId),
        getAllBattles(),
      ]);
      if (mounted) {
        setBeast(data);
        if (data) {
          setBeastBattles(
            allBattles.filter((b) => b.beastA.id === data.id || b.beastB.id === data.id)
          );
        }
        setLoading(false);
      }
    }
    loadBeast();
    return () => {
      mounted = false;
    };
  }, [beastId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-foreground font-mono text-sm space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin" />
        <p className="uppercase tracking-widest text-secondary">LOADING COMBATANT TELEMETRY...</p>
      </div>
    );
  }

  if (!beast) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-danger text-background font-mono text-xs uppercase tracking-wider">
          <span>COMBATANT NOT FOUND</span>
        </div>
        <h1 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-primary">
          SPECIFIED BEAST ID DOES NOT EXIST
        </h1>
        <p className="font-mono text-xs text-secondary max-w-md mx-auto">
          No genetic record exists for identifier <span className="text-primary font-bold">[{beastId}]</span>.
        </p>
        <Link
          href="/leaderboard"
          className="inline-block px-6 py-3 bg-primary text-background font-headline font-bold text-sm uppercase tracking-wider hover:bg-neutral hover:text-primary transition-colors border border-primary"
        >
          Return to Leaderboard
        </Link>
      </div>
    );
  }

  const winRate = beast.record.wins + beast.record.losses > 0
    ? Math.round((beast.record.wins / (beast.record.wins + beast.record.losses)) * 100)
    : 0;

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      {/* Top Breadcrumb */}
      <div className="border-b border-primary bg-background">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-14 flex items-center justify-between font-mono text-xs">
          <Link
            href="/leaderboard"
            className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>BACK TO ARENA LEADERBOARD</span>
          </Link>
          <span className="text-secondary">BEAST_ID: {beast.id}</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Beast Avatar & Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-primary bg-background p-6 space-y-6">
              <div className="relative aspect-square w-full border border-primary overflow-hidden bg-zinc-900">
                <Image
                  src={beast.avatarUrl}
                  alt={beast.name}
                  fill
                  className="object-cover"
                  priority
                />
                {beast.boundAsset && beast.boundAsset !== 'UNBOUND' && (
                  <div className="absolute top-3 right-3 bg-primary text-background font-mono text-xs font-bold px-3 py-1 border border-background/40">
                    {beast.boundAsset} BOUND
                  </div>
                )}
              </div>

              <div>
                <div className="font-mono text-xs text-secondary uppercase tracking-widest">
                  FORGED {formatDate(beast.createdAt)}
                </div>
                <h1 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-primary mt-1">
                  {beast.name}
                </h1>
                <p className="font-mono text-xs text-secondary mt-1">
                  OWNER: {beast.ownerAddress}
                </p>
              </div>

              {/* Combat Record Card */}
              <div className="border-t border-primary pt-4 grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-surface-container-low p-3 border border-neutral">
                  <span className="text-secondary block text-[10px]">WINS</span>
                  <span className="font-headline font-bold text-2xl text-primary">{beast.record.wins}</span>
                </div>
                <div className="bg-surface-container-low p-3 border border-neutral">
                  <span className="text-secondary block text-[10px]">LOSSES</span>
                  <span className="font-headline font-bold text-2xl text-primary">{beast.record.losses}</span>
                </div>
                <div className="bg-surface-container-low p-3 border border-neutral">
                  <span className="text-secondary block text-[10px]">WIN RATE</span>
                  <span className="font-headline font-bold text-2xl text-primary">{winRate}%</span>
                </div>
              </div>

              {/* Challenge Beast CTA */}
              <button
                onClick={() => {
                  requireAuth({
                    actionTitle: `issue duel challenge to ${beast.name}`,
                    onSuccess: () => {
                      router.push(`/arena?challenge=${beast.id}`);
                    },
                  });
                }}
                className="w-full py-4 bg-primary text-background font-headline font-extrabold text-lg uppercase tracking-wider hover:bg-neutral hover:text-primary transition-colors border-2 border-primary flex items-center justify-center gap-2"
              >
                <FiCrosshair className="w-5 h-5" />
                <span>CHALLENGE IN ARENA</span>
              </button>
            </div>
          </div>

          {/* Right Column: Attribute Matrix, Passives, Combat Record (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Attribute Matrix */}
            <div className="border border-primary p-6 bg-background space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  GENETIC ATTRIBUTES
                </h2>
                <span className="font-mono text-xs text-secondary">BASE STATS</span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {/* Power */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>POWER // KINETIC OUTPUT</span>
                    <span className="text-primary">{beast.stats.power} / 20</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-low border border-neutral overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(beast.stats.power / 20) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Defense */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>DEFENSE // REINFORCED PLATING</span>
                    <span className="text-primary">{beast.stats.defense} / 20</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-low border border-neutral overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(beast.stats.defense / 20) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>SPEED // ACTUATOR VELOCITY</span>
                    <span className="text-primary">{beast.stats.speed} / 20</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-low border border-neutral overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(beast.stats.speed / 20) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Special */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold">
                    <span>SPECIAL // NEURAL OVERCLOCK</span>
                    <span className="text-primary">{beast.stats.special} / 20</span>
                  </div>
                  <div className="h-3 w-full bg-surface-container-low border border-neutral overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(beast.stats.special / 20) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Perks */}
            <div className="border border-primary p-6 bg-background space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  TACTICAL PERKS
                </h2>
                <span className="font-mono text-xs text-secondary">ACTIVE PASSIVES</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {beast.perks.map((perkId) => {
                  const perk = AVAILABLE_PERKS.find((p) => p.id === perkId) || {
                    id: perkId,
                    name: perkId.replace('_', ' ').toUpperCase(),
                    description: 'Special tactical passive perk loaded into combat matrix.',
                    effectSummary: '+TACTICAL BUFF',
                  };

                  return (
                    <div 
                      key={perk.id}
                      className="border border-primary p-4 bg-surface-container-low space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-bold text-sm uppercase text-primary">
                          {perk.name}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-secondary">
                        {perk.description}
                      </p>
                      <div className="font-mono text-[11px] font-bold text-primary">
                        {perk.effectSummary}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Battles List */}
            <div className="border border-primary p-6 bg-background space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  RECENT COMBAT RECORD
                </h2>
                <span className="font-mono text-xs text-secondary">ENCOUNTER LOGS</span>
              </div>

              {beastBattles.length > 0 ? (
                <div className="space-y-3 font-mono text-xs">
                  {beastBattles.map((b) => (
                    <div key={b.id} className="border border-neutral p-3 flex items-center justify-between bg-surface-container-low">
                      <div className="space-y-0.5">
                        <div className="font-bold text-primary">
                          VS {b.beastA.id === beast.id ? b.beastB.name : b.beastA.name}
                        </div>
                        <div className="text-[11px] text-secondary">
                          STATUS: {b.status.toUpperCase()}
                        </div>
                      </div>
                      <Link
                        href={`/battle/${b.id}`}
                        className="px-3 py-1.5 bg-primary text-background font-bold uppercase hover:bg-secondary transition-colors"
                      >
                        Inspect
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-xs text-secondary">No prior battle logs found for this beast.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
