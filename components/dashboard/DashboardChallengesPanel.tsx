'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiCrosshair, FiInbox, FiSend, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import { Challenge } from '@/lib/types';

import { useUserChallenges, useAcceptChallengeMutation, useDeclineChallengeMutation } from '@/hooks/useChallenges';
import Img from '@/components/ui/Img';
import { toast } from 'sonner';

interface DashboardChallengesPanelProps {
  address?: string;
}

export function DashboardChallengesPanel({ address }: DashboardChallengesPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const { data: allChallenges = [], isLoading } = useUserChallenges(address);

  const acceptMutation = useAcceptChallengeMutation();
  const declineMutation = useDeclineChallengeMutation();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const normalized = address?.toLowerCase() || '';
  const incomingChallenges = allChallenges.filter(
    (c: Challenge) => c.challengedAddress.toLowerCase() === normalized
  );
  const outgoingChallenges = allChallenges.filter(
    (c: Challenge) => c.challengerAddress.toLowerCase() === normalized
  );
  const pendingIncomingCount = incomingChallenges.filter((c: Challenge) => c.status === 'awaiting_response').length;

  const handleAccept = async (challengeId: string) => {
    if (!address) return;
    setProcessingId(challengeId);
    try {
      const res = await acceptMutation.mutateAsync({
        challengeId,
        defenderAddress: address,
      });
      toast.success('Challenge Accepted!', {
        description: 'Official duel document initialized. 1-hour spectator window is open.',
      });
      if (res?.battle?.id) {
        router.push(`/battle/${res.battle.id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept challenge';
      toast.error('Accept Failed', { description: msg });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (challengeId: string) => {
    if (!address) return;
    setProcessingId(challengeId);
    try {
      await declineMutation.mutateAsync({
        challengeId,
        defenderAddress: address,
      });
      toast.success('Challenge Declined', { description: 'The matchmaking challenge was dismissed.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to decline challenge';
      toast.error('Decline Failed', { description: msg });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-divider pb-3 gap-4">
        <div className="flex items-center gap-2">
          <FiCrosshair className="w-5 h-5 text-primary" />
          <h2 className="font-headline font-bold text-2xl uppercase tracking-tight">
            CHALLENGE CONTROL MATRIX
          </h2>
        </div>


        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('incoming')}
            className={`px-3 py-1.5 font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'incoming'
                ? 'bg-primary text-background'
                : 'bg-surface-container-low text-secondary hover:text-primary'
            }`}
          >
            <FiInbox className="w-3.5 h-3.5" />
            <span>Incoming</span>
            {pendingIncomingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-danger text-background text-[10px] font-extrabold">
                {pendingIncomingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outgoing')}
            className={`px-3 py-1.5 font-bold uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'outgoing'
                ? 'bg-primary text-background'
                : 'bg-surface-container-low text-secondary hover:text-primary'
            }`}
          >
            <FiSend className="w-3.5 h-3.5" />
            <span>Transmitted ({outgoingChallenges.length})</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-10 text-center font-mono text-xs text-secondary uppercase">
          SCANNING RADAR FOR DUEL SIGNALS...
        </div>
      ) : activeTab === 'incoming' ? (
        incomingChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingChallenges.map((c: Challenge) => (
              <div
                key={c.id}
                className="border border-divider p-5 bg-background space-y-4 font-mono text-xs"
              >
                <div className="flex items-center justify-between border-b border-divider pb-2.5">
                  <span className="text-secondary text-[11px]">
                    CHALLENGE ID: {c.id.slice(0, 16)}...
                  </span>
                  <span
                    className={`px-2 py-0.5 font-bold text-[10px] uppercase ${
                      c.status === 'awaiting_response'
                        ? 'bg-primary text-background'
                        : c.status === 'accepted'
                        ? 'bg-primary/10 text-primary border border-divider'
                        : 'bg-danger text-background'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Challenger info */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 border border-divider overflow-hidden flex-shrink-0 bg-zinc-900">
                      <Img src={c.challengerBeast.avatarUrl} alt={c.challengerBeast.name} fill className="object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] text-secondary uppercase block">CHALLENGER</span>
                      <h4 className="font-headline font-bold text-base text-primary uppercase truncate">
                        {c.challengerBeast.name}
                      </h4>
                      <div className="text-[10px] text-secondary">
                        P:{c.challengerBeast.stats.power} D:{c.challengerBeast.stats.defense} S:{c.challengerBeast.stats.speed} SP:{c.challengerBeast.stats.special}
                      </div>
                    </div>
                  </div>

                  {/* Target defender info */}
                  <div className="border-t sm:border-t-0 sm:border-l border-divider pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-[10px] text-secondary uppercase block">YOUR DEFENDER</span>
                    <h4 className="font-headline font-bold text-base text-primary uppercase truncate">
                      {c.challengedBeast.name}
                    </h4>
                    <span className="text-[10px] text-secondary truncate block">
                      {c.challengedBeast.ownerAddress}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {c.status === 'awaiting_response' ? (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-divider">
                    <button
                      type="button"
                      onClick={() => handleAccept(c.id)}
                      disabled={processingId === c.id}
                      className="py-2.5 bg-primary text-background font-headline font-bold text-xs uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>{processingId === c.id ? 'OPENING DUEL...' : 'ACCEPT DUEL (1-HR)'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecline(c.id)}
                      disabled={processingId === c.id}
                      className="py-2.5 bg-surface-container-low text-primary font-headline font-bold text-xs uppercase tracking-wider hover:bg-neutral transition-colors border border-primary disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FiX className="w-3.5 h-3.5" />
                      <span>DECLINE</span>
                    </button>
                  </div>
                ) : c.status === 'accepted' && c.battleId ? (
                  <div className="pt-2 border-t border-divider">
                    <Link
                      href={`/battle/${c.battleId}`}
                      className="w-full py-2.5 bg-primary text-background font-headline font-bold text-xs uppercase tracking-wider hover:bg-secondary transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>ENTER COMBAT ARENA</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-divider p-8 bg-background text-center font-mono text-xs text-secondary space-y-2">
            <FiInbox className="w-6 h-6 mx-auto text-primary" />
            <p className="font-bold text-primary uppercase">NO INCOMING CHALLENGES</p>
            <p>When another combatant challenges your beasts in the Arena, you can accept or decline here.</p>
          </div>
        )
      ) : (
        /* Outgoing challenges table */
        outgoingChallenges.length > 0 ? (
          <div className="border border-divider bg-background overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-divider bg-surface-container-low text-secondary uppercase">
                  <th className="p-4">CHALLENGE ID</th>
                  <th className="p-4">YOUR BEAST</th>
                  <th className="p-4">OPPONENT</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {outgoingChallenges.map((c: Challenge) => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-4 font-bold">{c.id.slice(0, 16)}...</td>
                    <td className="p-4 font-headline font-bold text-sm text-primary uppercase">
                      {c.challengerBeast.name}
                    </td>
                    <td className="p-4 font-headline font-bold text-sm text-primary uppercase">
                      {c.challengedBeast.name}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-primary text-background font-bold text-[10px] uppercase">
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {c.status === 'accepted' && c.battleId ? (
                        <Link
                          href={`/battle/${c.battleId}`}
                          className="px-3 py-1.5 bg-primary text-background font-headline font-bold uppercase text-xs hover:bg-secondary transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Enter Duel</span>
                          <FiArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-secondary text-[11px]">Awaiting</span>
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
            <p className="font-bold text-primary uppercase">NO TRANSMITTED CHALLENGES</p>
            <p>You have not issued any challenges yet. Go to the Arena to challenge opposing combatants.</p>
          </div>
        )
      )}
    </div>
  );
}

