'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { useAccount } from 'wagmi';
import { useBeast } from '@/hooks/useBeasts';
import { useBattles } from '@/hooks/useBattles';
import { BeastProfileHeader } from '@/components/beast/BeastProfileHeader';
import { BeastStatsCard } from '@/components/beast/BeastStatsCard';
import { BeastMatchHistory } from '@/components/beast/BeastMatchHistory';
import { ChallengeModal } from '@/components/arena/ChallengeModal';

export default function BeastProfilePage() {
  const router = useRouter();
  const params = useParams();
  const beastId = (params?.id as string) || '';
  const { address } = useAccount();

  const { data: beast, isLoading: loadingBeast } = useBeast(beastId);
  const { data: allBattles = [] } = useBattles();

  const [challengeModalOpen, setChallengeModalOpen] = useState(false);

  if (loadingBeast) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-mono text-xs text-secondary uppercase tracking-widest">
        LOADING COMBATANT TELEMETRY...
      </div>
    );
  }

  if (!beast) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center space-y-4 font-mono">
        <h1 className="font-headline font-extrabold text-3xl uppercase text-primary">BEAST NOT FOUND</h1>
        <p className="text-xs text-secondary">No genetic record exists for identifier [{beastId}].</p>
        <Link href="/arena" className="inline-block px-6 py-2 bg-primary text-background text-xs uppercase font-bold">
          Return to Arena
        </Link>
      </div>
    );
  }

  const beastBattles = allBattles.filter((b) => b.beastA.id === beast.id || b.beastB.id === beast.id);
  const isOwner = Boolean(address && beast.ownerAddress?.toLowerCase() === address.toLowerCase());

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      <div className="border-b border-divider bg-background">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-14 flex items-center justify-between font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                router.push('/arena');
              }
            }}
            className="flex items-center gap-1.5 cursor-pointer text-secondary hover:text-primary transition-colors focus:outline-none"
            aria-label="Back to Arena"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>
          <span className="text-secondary font-bold">AGENT GENOME: {beast.id}</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <BeastProfileHeader
            beast={beast}
            onOpenChallenge={() => setChallengeModalOpen(true)}
            isOwner={isOwner}
          />
          <div className="beast-col-right lg:col-span-7 space-y-8">
            <BeastStatsCard beast={beast} />
            <BeastMatchHistory battles={beastBattles} currentBeastId={beast.id} />
          </div>
        </div>
      </div>

      <ChallengeModal
        isOpen={challengeModalOpen}
        onClose={() => setChallengeModalOpen(false)}
        initialOpponent={beast}
      />
    </div>
  );
}
