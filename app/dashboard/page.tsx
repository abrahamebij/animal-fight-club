'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiPlusSquare, 
  FiShield, 
  FiCrosshair,
  FiTrendingUp,
  FiCheck,
  FiX,
  FiClock,
  FiArrowRight,
  FiInbox,
  FiSend
} from 'react-icons/fi';
import { useAccount, useBalance } from 'wagmi';
import { somniaShannon } from '@/lib/config/wagmi';
import { formatBalance } from '@/lib/utils/format';
import { getBeastsByOwner } from '@/lib/services/beastService';
import { getBetsByBettor } from '@/lib/services/battleService';
import { 
  getIncomingChallenges, 
  getOutgoingChallenges, 
  acceptChallenge, 
  declineChallenge 
} from '@/lib/services/challengeService';
import { Beast, Bet, Challenge } from '@/lib/types';
import { RouteGuard } from '@/components/wallet/RouteGuard';
import { formatDate } from '@/lib/utils/timer';
import gsap from 'gsap';
import Img from '@/components/ui/Img';

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ 
    address, 
    chainId: somniaShannon.id 
  });

  const [myBeasts, setMyBeasts] = useState<Beast[]>([]);
  const [myActiveBets, setMyActiveBets] = useState<Bet[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<Challenge[]>([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState<Challenge[]>([]);
  const [challengeTab, setChallengeTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [processingChallengeId, setProcessingChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  // Header entrance
  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.from('.dash-badge', { opacity: 0, y: -12, duration: 0.45 })
        .from('.dash-title', { opacity: 0, y: 32, duration: 0.6 }, '-=0.2')
        .from('.dash-desc', { opacity: 0, y: 20, duration: 0.5 }, '-=0.25')
        .from('.dash-cta', { opacity: 0, x: 20, duration: 0.45 }, '-=0.25')
        .from('.dash-hero-ill', { opacity: 0, scale: 0.85, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.3');
    }, headerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadUserData() {
      if (!address) {
        setMyBeasts([]);
        setMyActiveBets([]);
        setIncomingChallenges([]);
        setOutgoingChallenges([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const [beasts, bets, incoming, outgoing] = await Promise.all([
        getBeastsByOwner(address),
        getBetsByBettor(address),
        getIncomingChallenges(address),
        getOutgoingChallenges(address),
      ]);
      if (mounted) {
        setMyBeasts(beasts);
        setMyActiveBets(bets);
        setIncomingChallenges(incoming);
        setOutgoingChallenges(outgoing);
        setLoading(false);
      }
    }
    loadUserData();
    return () => {
      mounted = false;
    };
  }, [address]);

  // Animate metric tiles + beast cards once data is ready
  useEffect(() => {
    if (loading || !contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.dash-metric', {
        opacity: 0, y: 20, scale: 0.95, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)',
      });
      gsap.from('.dash-beast-card', {
        opacity: 0, y: 28, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2,
      });
    }, contentRef);
    return () => ctx.revert();
  }, [loading, isConnected]);

  const handleAcceptChallenge = async (challengeId: string) => {
    if (!address) return;
    setProcessingChallengeId(challengeId);
    try {
      const { battle } = await acceptChallenge(challengeId, address);
      // Route immediately to the battle view so the user sees the active 1-hour window
      router.push(`/battle/${battle.id}`);
    } catch (err) {
      console.error('Failed to accept challenge:', err);
      setProcessingChallengeId(null);
    }
  };

  const handleDeclineChallenge = async (challengeId: string) => {
    if (!address) return;
    setProcessingChallengeId(challengeId);
    try {
      const updated = await declineChallenge(challengeId, address);
      setIncomingChallenges((prev) =>
        prev.filter((c) => c.id !== challengeId)
      );
    } catch (err) {
      console.error('Failed to decline challenge:', err);
    } finally {
      setProcessingChallengeId(null);
    }
  };

  const displayAddress = isConnected && address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'NOT CONNECTED';

  const pendingIncomingCount = incomingChallenges.filter((c) => c.status === 'awaiting_response').length;

  return (
    <RouteGuard routeName="COMMAND CENTER DASHBOARD">
      <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      {/* Header */}
      <section ref={headerRef} className="border-b border-divider divider-ash bg-background pt-8 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="dash-badge inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider mb-1">
              <span className="w-2 h-2 bg-secondary" />
              <span>COMMAND CENTER TERMINAL</span>
            </div>
            <h1 className="dash-title font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
              COMMAND CENTER
            </h1>
            <p className="dash-desc font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
              Manage your minted combatants, respond to incoming duels, track pending challenges, and review active spectator wagers.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/create"
                className="dash-cta px-6 py-3 bg-primary text-background font-headline font-bold text-sm uppercase tracking-wider hover:bg-background hover:text-primary border border-primary transition-colors inline-flex items-center gap-2"
              >
                <FiPlusSquare className="w-4 h-4" />
                <span>Forge New Beast</span>
              </Link>
              <Link
                href="/arena"
                className="dash-cta px-6 py-3 bg-surface-container-low text-primary font-headline font-bold text-sm uppercase tracking-wider hover:bg-primary hover:text-background border border-primary transition-colors inline-flex items-center gap-2"
              >
                <FiCrosshair className="w-4 h-4" />
                <span>Arena Matchmaker</span>
              </Link>
            </div>
          </div>

          <div className="dash-hero-ill lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full">
              <Img
                src="/dashboard-hero.png"
                alt="Command Center Surreal Illustration"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Account Metric Summary */}
      <section className="border-b border-divider divider-ash bg-background">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="dash-metric border border-divider p-4 bg-surface-container-low">
              <span className="text-secondary block text-[10px] uppercase">CONNECTED ADDRESS</span>
              <span className="font-bold text-sm text-primary">{displayAddress}</span>
            </div>

            <div className="dash-metric border border-divider p-4 bg-surface-container-low">
              <span className="text-secondary block text-[10px] uppercase">FORGED BEASTS</span>
              <span className="font-headline font-extrabold text-2xl text-primary">{myBeasts.length}</span>
            </div>

            <div className="dash-metric border border-divider p-4 bg-surface-container-low">
              <span className="text-secondary block text-[10px] uppercase">PENDING CHALLENGES</span>
              <span className="font-headline font-extrabold text-2xl text-warning">{pendingIncomingCount}</span>
            </div>

            <div className="dash-metric border border-divider p-4 bg-surface-container-low">
              <span className="text-secondary block text-[10px] uppercase">SOMNIA STT BALANCE</span>
              <span className="font-headline font-extrabold text-2xl text-primary">
                {formatBalance(balance, 2)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section ref={contentRef} className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10 space-y-12">
        
        {/* 1. Pending Challenges Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-divider pb-3 gap-3">
            <div className="flex items-center gap-2">
              <FiCrosshair className="w-5 h-5 text-primary" />
              <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
                PENDING CHALLENGES
              </h2>
            </div>

            {/* Sub-tabs: Incoming vs Outgoing */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setChallengeTab('incoming')}
                className={`px-3 py-1.5 uppercase font-bold border transition-colors flex items-center gap-1.5 ${
                  challengeTab === 'incoming'
                    ? 'bg-primary text-background border-primary'
                    : 'bg-surface-container-low text-secondary border-divider hover:text-primary'
                }`}
              >
                <FiInbox className="w-3.5 h-3.5" />
                <span>Incoming Challenges ({incomingChallenges.filter((c) => c.status === 'awaiting_response').length})</span>
              </button>

              <button
                onClick={() => setChallengeTab('outgoing')}
                className={`px-3 py-1.5 uppercase font-bold border transition-colors flex items-center gap-1.5 ${
                  challengeTab === 'outgoing'
                    ? 'bg-primary text-background border-primary'
                    : 'bg-surface-container-low text-secondary border-divider hover:text-primary'
                }`}
              >
                <FiSend className="w-3.5 h-3.5" />
                <span>Outgoing Transmissions ({outgoingChallenges.length})</span>
              </button>
            </div>
          </div>

          {challengeTab === 'incoming' ? (
            /* Incoming Challenges View */
            <div className="space-y-4">
              {incomingChallenges.filter((c) => c.status === 'awaiting_response').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incomingChallenges
                    .filter((c) => c.status === 'awaiting_response')
                    .map((challenge) => (
                      <div 
                        key={challenge.id} 
                        className="border border-divider p-5 bg-surface-container-low space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-mono border-b border-divider pb-2">
                            <span className="px-2 py-0.5 bg-warning text-primary font-bold uppercase">
                              DUEL INVITE RECEIVED
                            </span>
                            <span className="text-secondary">{formatDate(challenge.createdAt)}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                            {/* Challenger Beast Info (8 cols) */}
                            <div className="sm:col-span-8 flex items-center gap-3">
                              <div className="relative w-14 h-14 border border-divider overflow-hidden bg-zinc-900 flex-shrink-0">
                                <Image
                                  src={challenge.challengerBeast.avatarUrl}
                                  alt={challenge.challengerBeast.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="font-headline font-bold text-lg uppercase text-primary leading-tight">
                                  {challenge.challengerBeast.name}
                                </div>
                                <div className="font-mono text-[10px] text-secondary">
                                  BY: {challenge.challengerAddress.slice(0, 6)}...{challenge.challengerAddress.slice(-4)}
                                </div>
                                <div className="font-mono text-[10px] text-primary flex gap-2 font-bold">
                                  <span>P:{challenge.challengerBeast.stats.power}</span>
                                  <span>D:{challenge.challengerBeast.stats.defense}</span>
                                  <span>S:{challenge.challengerBeast.stats.speed}</span>
                                  <span>SP:{challenge.challengerBeast.stats.special}</span>
                                </div>
                              </div>
                            </div>

                            {/* Target Defender Indicator (4 cols) */}
                            <div className="sm:col-span-4 border-l sm:border-divider sm:pl-3 space-y-1 font-mono text-[10px]">
                              <span className="text-secondary uppercase block">TARGET DEFENDER:</span>
                              <span className="font-bold text-primary block uppercase">
                                {challenge.challengedBeast.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Accept / Decline Action Controls */}
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-divider">
                          <button
                            onClick={() => handleAcceptChallenge(challenge.id)}
                            disabled={processingChallengeId === challenge.id}
                            className="py-2.5 bg-primary text-background font-headline font-bold text-xs uppercase tracking-wider hover:bg-secondary transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                            <span>{processingChallengeId === challenge.id ? 'OPENING DUEL...' : 'ACCEPT DUEL (1-HR)'}</span>
                          </button>

                          <button
                            onClick={() => handleDeclineChallenge(challenge.id)}
                            disabled={processingChallengeId === challenge.id}
                            className="py-2.5 bg-surface-container-low text-primary font-headline font-bold text-xs uppercase tracking-wider hover:bg-neutral transition-colors border border-divider disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            <FiX className="w-3.5 h-3.5" />
                            <span>DECLINE</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="border border-divider p-8 bg-background text-center font-mono text-xs text-secondary space-y-2">
                  <FiInbox className="w-6 h-6 mx-auto text-primary" />
                  <p className="font-bold text-primary uppercase">NO INCOMING CHALLENGES</p>
                  <p>When another beast challenges your roster in the Arena, you can accept or decline here.</p>
                </div>
              )}
            </div>
          ) : (
            /* Outgoing Challenges View */
            <div className="space-y-4">
              {outgoingChallenges.length > 0 ? (
                <div className="border border-divider bg-background overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-divider bg-surface-container-low text-secondary uppercase">
                        <th className="p-4">CHALLENGE ID</th>
                        <th className="p-4">YOUR COMBATANT</th>
                        <th className="p-4">TARGET DEFENDER</th>
                        <th className="p-4">DEFENDER ADDRESS</th>
                        <th className="p-4">STATUS</th>
                        <th className="p-4">TRANSMITTED</th>
                        <th className="p-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-divider">
                      {outgoingChallenges.map((c) => (
                        <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="p-4 font-bold">{c.id.slice(0, 14)}...</td>
                          <td className="p-4 font-headline font-bold text-sm text-primary uppercase">
                            {c.challengerBeast.name}
                          </td>
                          <td className="p-4 font-headline font-bold text-sm text-primary uppercase">
                            {c.challengedBeast.name}
                          </td>
                          <td className="p-4 text-secondary">
                            {c.challengedAddress.slice(0, 6)}...{c.challengedAddress.slice(-4)}
                          </td>
                          <td className="p-4">
                            {c.status === 'awaiting_response' && (
                              <span className="px-2 py-0.5 bg-warning text-primary font-bold text-[10px] uppercase">
                                AWAITING RESPONSE
                              </span>
                            )}
                            {c.status === 'accepted' && (
                              <span className="px-2 py-0.5 bg-primary text-background font-bold text-[10px] uppercase">
                                ACCEPTED (LIVE)
                              </span>
                            )}
                            {c.status === 'declined' && (
                              <span className="px-2 py-0.5 bg-danger text-background font-bold text-[10px] uppercase">
                                DECLINED
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-secondary">{formatDate(c.createdAt)}</td>
                          <td className="p-4 text-right">
                            {c.status === 'accepted' && c.battleId ? (
                              <Link
                                href={`/battle/${c.battleId}`}
                                className="px-3 py-1.5 bg-primary text-background font-headline font-bold uppercase text-xs hover:bg-secondary transition-colors inline-flex items-center gap-1"
                              >
                                <span>Enter Pit</span>
                                <FiArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            ) : (
                              <span className="text-secondary text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-divider p-8 bg-background text-center font-mono text-xs text-secondary space-y-2">
                  <FiSend className="w-6 h-6 mx-auto text-primary" />
                  <p className="font-bold text-primary uppercase">NO OUTGOING TRANSMISSIONS</p>
                  <p>You haven't challenged any opponent beasts yet. Use the Arena to issue duels.</p>
                </div>
              )}
            </div>
          )}
        </div>

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
              className="font-mono text-xs uppercase text-primary hover:text-secondary flex items-center gap-1 font-bold"
            >
              <FiPlusSquare className="w-3.5 h-3.5" />
              <span>Forge Another</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBeasts.map((beast) => (
              <div key={beast.id} className="dash-beast-card border border-divider p-6 bg-background flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="relative aspect-square w-full border border-divider overflow-hidden bg-zinc-900">
                    <Image
                      src={beast.avatarUrl}
                      alt={beast.name}
                      fill
                      className="object-cover"
                    />
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
                    className="w-full py-2.5 bg-surface-container-low text-primary font-headline font-bold text-center text-sm uppercase tracking-wider hover:bg-primary hover:text-background border border-primary transition-colors block"
                  >
                    View Combatant Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Active Wagers */}
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
                  <th className="p-4">EST. MULTIPLIER</th>
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
                      <td className="p-4 text-primary font-bold">1.85x</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-primary text-background font-bold text-[10px] uppercase">
                          {bet.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/battle/${bet.battleId}`}
                          className="px-3 py-1.5 bg-primary text-background font-headline font-bold uppercase hover:bg-secondary transition-colors inline-block"
                        >
                          Spectate
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-secondary font-mono text-xs">
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
