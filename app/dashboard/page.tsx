'use client';

import React from 'react';
import Link from 'next/link';
import { FiPlusSquare, FiShield, FiTrendingUp } from 'react-icons/fi';
import { useAccount, useBalance } from 'wagmi';
import { somniaShannon } from '@/lib/config/wagmi';
import { formatBalance } from '@/lib/utils/format';
import { useUserBeasts } from '@/hooks/useBeasts';
import { useUserBets } from '@/hooks/useBattles';
import { DashboardChallengesPanel } from '@/components/dashboard/DashboardChallengesPanel';
import { RouteGuard } from '@/components/wallet/RouteGuard';
import Img from '@/components/ui/Img';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ 
    address, 
    chainId: somniaShannon.id 
  });

  const { data: myBeasts = [], isLoading: loadingBeasts } = useUserBeasts(address);
  const { data: myActiveBets = [], isLoading: loadingBets } = useUserBets(address);

  const displayAddress = isConnected && address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'NOT CONNECTED';

  return (
    <RouteGuard routeName="COMMAND CENTER">
      <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      {/* Header */}
      <section className="border-b border-divider bg-background pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider mb-3">
            <span className="w-2 h-2 bg-secondary" />
            <span>COMMAND CENTER TERMINAL</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
                COMMAND CENTER
              </h1>
              <p className="font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
                Manage your minted combatants, respond to duel challenges, and track active spectator wagers.
              </p>
            </div>

            <Link
              href="/create"
              className="px-6 py-3 bg-primary text-background font-headline font-bold text-sm uppercase tracking-wider hover:bg-background hover:text-primary border border-primary transition-colors inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <FiPlusSquare className="w-4 h-4" />
              <span>Forge New Beast</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Account Metric Summary */}
      <section className="border-b border-divider bg-background">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="border border-divider p-4 bg-surface-container-low">
              <span className="text-secondary block text-[10px] uppercase">CONNECTED ADDRESS</span>
              <span className="font-bold text-sm text-primary">{displayAddress}</span>
            </div>

            <div className="border border-divider p-4 bg-surface-container-low">
              <span className="text-secondary block text-[10px] uppercase">FORGED BEASTS</span>
              <span className="font-headline font-extrabold text-2xl text-primary">{myBeasts.length}</span>
            </div>

            <div className="border border-divider p-4 bg-surface-container-low">
              <span className="text-secondary block text-[10px] uppercase">ACTIVE WAGERS</span>
              <span className="font-headline font-extrabold text-2xl text-primary">{myActiveBets.length}</span>
            </div>

            <div className="border border-divider p-4 bg-surface-container-low">
              <span className="text-secondary block text-[10px] uppercase">NATIVE BALANCE</span>
              <span className="font-headline font-extrabold text-2xl text-primary">
                {formatBalance(balance, 2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10 space-y-12">
        {/* 1. Challenge Control Matrix (Incoming & Outgoing with Accept / Decline actions) */}
        <DashboardChallengesPanel address={address} />

        {/* 2. My Beasts Roster */}
        <div className="space-y-6">

          <div className="flex items-center justify-between border-b border-divider pb-3">
            <div className="flex items-center gap-2">
              <FiShield className="w-5 h-5 text-primary" />
              <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                MY ACTIVE COMBATANTS ({myBeasts.length})
              </h2>
            </div>
            <Link
              href="/create"
              className="font-mono text-xs uppercase text-primary hover:text-secondary flex items-center gap-1 font-bold cursor-pointer"
            >
              <FiPlusSquare className="w-3.5 h-3.5" />
              <span>Forge Another</span>
            </Link>
          </div>

          {loadingBeasts ? (
            <div className="py-12 text-center font-mono text-xs text-secondary uppercase">
              LOADING COMBATANTS...
            </div>
          ) : myBeasts.length === 0 ? (
            <div className="p-8 border border-divider text-center font-mono text-xs text-secondary space-y-3">
              <p>No combatants forged on this wallet yet.</p>
              <Link href="/create" className="inline-block px-4 py-2 bg-primary text-background text-xs uppercase font-bold cursor-pointer">
                Forge Your First Beast
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBeasts.map((beast) => (
                <div key={beast.id} className="border border-divider p-6 bg-background flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    <div className="relative aspect-square w-full border border-divider overflow-hidden bg-zinc-900">
                      <Img src={beast.avatarUrl} alt={beast.name} fill className="object-cover" />
                      {beast.boundAsset && (
                        <div className="absolute top-2 right-2 bg-primary text-background font-mono text-[10px] font-bold px-2 py-0.5 border border-background/30">
                          {beast.boundAsset} BOUND
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-headline font-bold text-2xl uppercase tracking-tight text-primary">
                        {beast.name}
                      </h3>
                      <div className="font-mono text-xs text-secondary">
                        RECORD: {beast.record.wins}W - {beast.record.losses}L
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs border-t border-divider pt-3">
                      <div className="bg-surface-container-low p-1.5">
                        <div className="text-[10px] text-secondary">PWR</div>
                        <div className="font-bold">{beast.stats.power}</div>
                      </div>
                      <div className="bg-surface-container-low p-1.5">
                        <div className="text-[10px] text-secondary">DEF</div>
                        <div className="font-bold">{beast.stats.defense}</div>
                      </div>
                      <div className="bg-surface-container-low p-1.5">
                        <div className="text-[10px] text-secondary">SPD</div>
                        <div className="font-bold">{beast.stats.speed}</div>
                      </div>
                      <div className="bg-surface-container-low p-1.5">
                        <div className="text-[10px] text-secondary">SPC</div>
                        <div className="font-bold">{beast.stats.special}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/beast/${beast.id}`}
                      className="w-full py-2.5 bg-surface-container-low text-primary font-headline font-bold text-center text-sm uppercase tracking-wider hover:bg-primary hover:text-background border border-primary transition-colors block cursor-pointer"
                    >
                      View Combatant Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Active Wagers */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                ACTIVE SPECTATOR WAGERS
              </h2>
            </div>
            <span className="font-mono text-xs text-secondary">ESCROW BACKED</span>
          </div>

          <div className="border border-divider bg-background overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-divider bg-surface-container-low text-secondary uppercase">
                  <th className="p-4">BET ID</th>
                  <th className="p-4">BATTLE</th>
                  <th className="p-4">PREDICTED VICTOR</th>
                  <th className="p-4">STAKE AMOUNT</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {myActiveBets.length > 0 ? (
                  myActiveBets.map((bet) => (
                    <tr key={bet.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-4 font-bold">{bet.id}</td>
                      <td className="p-4">{bet.battleId}</td>
                      <td className="p-4 font-bold text-primary uppercase">{bet.beastPicked}</td>
                      <td className="p-4">{bet.amount} STT</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 font-bold text-[10px] uppercase bg-primary text-background">
                          {bet.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/battle/${bet.battleId}`}
                          className="px-3 py-1.5 bg-primary text-background font-headline font-bold uppercase hover:bg-secondary transition-colors inline-block cursor-pointer"
                        >
                          {bet.status === 'won' ? 'Claim Payout' : 'Spectate'}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-secondary font-mono text-xs">
                      No active wagers placed yet. Explore the Arena to place spectator bets during 1-hour windows.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      </div>
    </RouteGuard>
  );
}
