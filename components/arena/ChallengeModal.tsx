'use client';

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { 
  FiX, 
  FiShield, 
  FiCrosshair, 
  FiPlusSquare, 
  FiAlertTriangle 
} from 'react-icons/fi';
import { useWalletGate } from '@/components/wallet/useWalletGate';
import { getBeastsByOwner, getAllBeasts } from '@/lib/services/beastService';
import { createChallenge } from '@/lib/services/challengeService';
import { Beast } from '@/lib/types';
import { toast } from 'sonner';
import Img from '@/components/ui/Img';
import gsap from 'gsap';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetOpponent?: Beast | null;
  initialOpponent?: Beast | null;
}

export function ChallengeModal({ isOpen, onClose, targetOpponent, initialOpponent }: ChallengeModalProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { requireAuth } = useWalletGate();

  const [myBeasts, setMyBeasts] = useState<Beast[]>([]);
  const [availableOpponents, setAvailableOpponents] = useState<Beast[]>([]);
  const [selectedMyBeast, setSelectedMyBeast] = useState<Beast | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<Beast | null>(targetOpponent || initialOpponent || null);
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
    if (!isOpen) return;

    let mounted = true;
    async function loadData() {
      const owner = address?.toLowerCase() || '';
      const all = await getAllBeasts();
      const userBeasts = owner 
        ? all.filter((b) => b.ownerAddress?.toLowerCase() === owner)
        : [];

      if (mounted) {
        setMyBeasts(userBeasts);
        const defaultMyBeast = userBeasts[0] || null;
        setSelectedMyBeast(defaultMyBeast);

        // Filter out ALL user's beasts, plus selected beast
        const opps = all.filter(
          (b) => !userBeasts.some((ub) => ub.id === b.id) && 
                 (!owner || b.ownerAddress?.toLowerCase() !== owner) &&
                 (!defaultMyBeast || b.id !== defaultMyBeast.id)
        );

        // Check if targetOpponent is valid (not owned by user, not self)
        const isTargetValid = targetOpponent && 
          (!owner || targetOpponent.ownerAddress?.toLowerCase() !== owner) &&
          (!defaultMyBeast || targetOpponent.id !== defaultMyBeast.id);

        const finalOpps = isTargetValid && !opps.some((b) => b.id === targetOpponent.id)
          ? [targetOpponent, ...opps]
          : opps;

        setAvailableOpponents(finalOpps);

        if (isTargetValid) {
          setSelectedOpponent(targetOpponent);
        } else if (finalOpps.length > 0) {
          setSelectedOpponent(finalOpps[0]);
        } else {
          setSelectedOpponent(null);
        }
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [isOpen, address, targetOpponent]);

  if (!isOpen) return null;

  const handleSelectMyBeast = (beast: Beast) => {
    setSelectedMyBeast(beast);
    // If selected opponent is the same beast, clear or re-select
    if (selectedOpponent?.id === beast.id) {
      const fallback = availableOpponents.find((b) => b.id !== beast.id) || null;
      setSelectedOpponent(fallback);
    }
  };

  const handleInitiateDuel = () => {
    if (!selectedMyBeast || !selectedOpponent || selectedMyBeast.id === selectedOpponent.id) return;

    requireAuth({
      actionTitle: `challenge ${selectedOpponent.name} to an arena duel`,
      onSuccess: async () => {
        setIsSubmitting(true);
        try {
          await createChallenge(selectedMyBeast, selectedOpponent);
          toast.success(`Challenge Transmitted to ${selectedOpponent.name}!`, {
            description: `Duel proposal sent. Awaiting defender acceptance in Command Center.`,
            duration: 5000,
          });
          onClose();
          router.push('/dashboard');
        } catch (err) {
          console.error('Failed to transmit challenge:', err);
          toast.error('Failed to Transmit Challenge', {
            description: err instanceof Error ? err.message : 'Please check your connection and try again.',
            duration: 5000,
          });
          setIsSubmitting(false);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        ref={panelRef}
        className="w-full max-w-3xl bg-background border border-divider shadow-2xl p-6 relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-divider pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 relative flex items-center justify-center overflow-hidden flex-shrink-0">
              <Img 
                src="/logo.png" 
                alt="Animal Fight Club Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-headline font-extrabold text-2xl uppercase tracking-wider text-primary">
              INITIATE ARENA CHALLENGE
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-divider hover:bg-primary hover:text-background transition-colors text-primary"
            aria-label="Close modal"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Hour Window Info Banner */}
        <div className="border border-divider bg-surface-container-low p-3 font-mono text-xs text-secondary flex items-center justify-between">
          <span>WINDOW DURATION: 1 HOUR UPON ACCEPTANCE</span>
          <span className="font-bold text-primary">REQUIRES DEFENDER CONSENT</span>
        </div>

        {/* Matchup Duel Stage Selector */}
        <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-4 py-2">
          {/* Challenger Selection (5 cols) */}
          <div className="md:col-span-5 border border-divider p-4 bg-surface-container-low space-y-3">
            <div className="font-mono text-xs text-secondary uppercase font-bold">
              YOUR COMBATANT (ALPHA)
            </div>

            {myBeasts.length > 0 ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full border border-divider overflow-hidden bg-zinc-900">
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
                      if (found) handleSelectMyBeast(found);
                    }}
                    className="w-full bg-background border border-divider p-2 font-headline font-bold text-sm uppercase"
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
          <div className="md:col-span-5 border border-divider p-4 bg-surface-container-low space-y-3">
            <div className="font-mono text-xs text-secondary uppercase font-bold">
              OPPONENT COMBATANT (BRAVO)
            </div>

            {availableOpponents.length > 0 ? (
              <div className="space-y-3">
                <div className="relative aspect-video w-full border border-divider overflow-hidden bg-zinc-900">
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
                    className="w-full bg-background border border-divider p-2 font-headline font-bold text-sm uppercase"
                  >
                    {availableOpponents.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.stats.power}P / {b.stats.defense}D)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2 border border-dashed border-divider p-4">
                <p className="font-mono text-xs text-primary uppercase font-bold">NO ELIGIBLE DEFENDERS</p>
                <p className="font-mono text-xs text-secondary">
                  No beasts from other gladiators are currently available to challenge.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit CTA */}
        <button
          onClick={handleInitiateDuel}
          disabled={!selectedMyBeast || !selectedOpponent || selectedMyBeast.id === selectedOpponent.id || isSubmitting || availableOpponents.length === 0}
          className="w-full py-4 bg-primary text-background font-headline font-extrabold text-xl uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <FiCrosshair className="w-5 h-5" />
          <span>
            {isSubmitting
              ? 'TRANSMITTING CHALLENGE...'
              : selectedMyBeast?.id === selectedOpponent?.id
              ? 'CANNOT CHALLENGE OWN COMBATANT'
              : 'TRANSMIT FORMAL CHALLENGE - AWAITS DEFENDER ACCEPTANCE'}
          </span>
        </button>
      </div>
    </div>
  );
}
