'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { 
  FiX, 
  FiShield, 
  FiCrosshair, 
  FiZap, 
  FiPlusSquare, 
  FiAlertTriangle 
} from 'react-icons/fi';
import { useWalletGate } from '@/components/wallet/useWalletGate';
import { getBeastsByOwner, getAllBeasts } from '@/lib/services/beastService';
import { createBattle } from '@/lib/services/battleService';
import { Beast } from '@/lib/types';
import gsap from 'gsap';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetOpponent?: Beast | null;
}

export function ChallengeModal({ isOpen, onClose, targetOpponent }: ChallengeModalProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { requireAuth } = useWalletGate();

  const [myBeasts, setMyBeasts] = useState<Beast[]>([]);
  const [availableOpponents, setAvailableOpponents] = useState<Beast[]>([]);
  const [selectedMyBeast, setSelectedMyBeast] = useState<Beast | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<Beast | null>(targetOpponent || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // Animate in when opened
  useLayoutEffect(() => {
    if (!isOpen || !panelRef.current) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, scale: 0.94, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
    );
  }, [isOpen]);

  useEffect(() => {
    if (targetOpponent) {
      setSelectedOpponent(targetOpponent);
    }
  }, [targetOpponent]);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    async function loadData() {
      const owner = address || '';
      const userBeasts = owner ? await getBeastsByOwner(owner) : [];
      const all = await getAllBeasts();

      if (mounted) {
        setMyBeasts(userBeasts);
        setSelectedMyBeast(userBeasts[0] || null);

        const opps = all.filter((b) => !userBeasts.some((ub) => ub.id === b.id));
        setAvailableOpponents(opps.length > 0 ? opps : all);
        if (!targetOpponent && (opps[0] || all[0])) {
          setSelectedOpponent(opps[0] || all[0]);
        }
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [isOpen, address, targetOpponent]);

  if (!isOpen) return null;

  const handleInitiateDuel = () => {
    if (!selectedMyBeast || !selectedOpponent) return;

    requireAuth({
      actionTitle: `challenge ${selectedOpponent.name} to a 1-hour arena duel`,
      onSuccess: async () => {
        setIsSubmitting(true);
        try {
          const battle = await createBattle(selectedMyBeast, selectedOpponent);
          onClose();
          router.push(`/battle/${battle.id}`);
        } catch (err) {
          console.error('Failed to create battle:', err);
          setIsSubmitting(false);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        ref={panelRef}
        className="w-full max-w-3xl bg-background border-2 border-primary shadow-2xl p-6 relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary pb-3">
          <div className="flex items-center gap-2">
            <FiCrosshair className="w-5 h-5 text-primary" />
            <span className="font-headline font-extrabold text-2xl uppercase tracking-wider text-primary">
              INITIATE ARENA CHALLENGE
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-primary hover:bg-primary hover:text-background transition-colors text-primary"
            aria-label="Close modal"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Hour Window Info Banner */}
        <div className="border border-neutral bg-surface-container-low p-3 font-mono text-xs text-secondary flex items-center justify-between">
          <span>WINDOW DURATION: 1 HOUR (3600S)</span>
          <span className="font-bold text-primary">PUBLIC SPECTATOR BETTING OPENS</span>
        </div>

        {/* Matchup Duel Stage Selector */}
        <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-4 py-2">
          {/* Challenger Selection (5 cols) */}
          <div className="md:col-span-5 border border-primary p-4 bg-surface-container-low space-y-3">
            <div className="font-mono text-xs text-secondary uppercase font-bold">
              YOUR COMBATANT (ALPHA)
            </div>

            {myBeasts.length > 0 ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full border border-primary overflow-hidden bg-zinc-900">
                  {selectedMyBeast && (
                    <Image
                      src={selectedMyBeast.avatarUrl}
                      alt={selectedMyBeast.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-secondary uppercase mb-1 font-bold">
                    SELECT FROM ROSTER
                  </label>
                  <select
                    value={selectedMyBeast?.id || ''}
                    onChange={(e) => {
                      const found = myBeasts.find((b) => b.id === e.target.value);
                      if (found) setSelectedMyBeast(found);
                    }}
                    className="w-full bg-background border border-primary p-2 font-headline font-bold text-sm uppercase"
                  >
                    {myBeasts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.stats.power}P / {b.stats.defense}D)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="font-mono text-xs text-secondary">You haven't forged any beasts yet.</p>
                <button
                  onClick={() => {
                    onClose();
                    router.push('/create');
                  }}
                  className="px-4 py-2 bg-primary text-background font-headline font-bold text-xs uppercase"
                >
                  Forge Beast First
                </button>
              </div>
            )}
          </div>

          {/* VS Center (1 col) */}
          <div className="md:col-span-1 text-center font-headline font-extrabold text-3xl text-secondary">
            VS
          </div>

          {/* Opponent Selection (5 cols) */}
          <div className="md:col-span-5 border border-primary p-4 bg-surface-container-low space-y-3">
            <div className="font-mono text-xs text-secondary uppercase font-bold">
              OPPONENT COMBATANT (BRAVO)
            </div>

            <div className="relative aspect-video w-full border border-primary overflow-hidden bg-zinc-900">
              {selectedOpponent && (
                <Image
                  src={selectedOpponent.avatarUrl}
                  alt={selectedOpponent.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div>
              <label className="block font-mono text-[10px] text-secondary uppercase mb-1 font-bold">
                SELECT TARGET DEFENDER
              </label>
              <select
                value={selectedOpponent?.id || ''}
                onChange={(e) => {
                  const found = availableOpponents.find((b) => b.id === e.target.value);
                  if (found) setSelectedOpponent(found);
                }}
                className="w-full bg-background border border-primary p-2 font-headline font-bold text-sm uppercase"
              >
                {availableOpponents.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.stats.power}P / {b.stats.defense}D)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit CTA */}
        <button
          onClick={handleInitiateDuel}
          disabled={!selectedMyBeast || !selectedOpponent || isSubmitting}
          className="w-full py-4 bg-primary text-background font-headline font-extrabold text-xl uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FiZap className="w-5 h-5 text-warning" />
          <span>{isSubmitting ? 'OPENING BATTLE WINDOW...' : 'CONFIRM CHALLENGE // INITIATE 1-HR BETTING WINDOW'}</span>
        </button>
      </div>
    </div>
  );
}
