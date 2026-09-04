'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { useAccount } from 'wagmi';
import { Battle, CombatTurn, Bet } from '@/lib/types';
import { formatTimeRemaining } from '@/lib/utils/timer';
import { useBattle, useUserBets } from '@/hooks/useBattles';
import { useBattleCombat, useBattleWager } from '@/hooks/useBattleActions';
import { BattleArenaRing } from '@/components/battle/BattleArenaRing';
import { CombatLogFeed } from '@/components/battle/CombatLogFeed';
import { MarketPulsePanel } from '@/components/battle/MarketPulsePanel';
import { SpectatorWageringPanel } from '@/components/battle/SpectatorWageringPanel';

export default function BattleViewPage() {
  const params = useParams();
  const battleId = (params?.id as string) || '';
  const { address } = useAccount();

  const { data: initialBattle, isLoading } = useBattle(battleId);
  const { data: userBets = [] } = useUserBets(address);

  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [selectedSide, setSelectedSide] = useState<'beastA' | 'beastB'>('beastA');
  const [betAmount, setBetAmount] = useState<string>('50');

  useEffect(() => {
    if (initialBattle && !activeBattle) {
      setActiveBattle(initialBattle);
    }
  }, [initialBattle, activeBattle]);

  const battle = activeBattle || initialBattle || null;
  const userBet = userBets.find((b: Bet) => b.battleId === battleId) || null;

  const isOwnerOfFighter = Boolean(
    address &&
    battle && (
      battle.beastA.ownerAddress?.toLowerCase() === address.toLowerCase() ||
      battle.beastB.ownerAddress?.toLowerCase() === address.toLowerCase()
    )
  );

  const { isSimulating, executeCombat } = useBattleCombat({
    battle,
    isOwnerOfFighter,
    address,
    onBattleUpdate: setActiveBattle,
  });

  const { placeWager, claimPayout, betPlaced, isClaiming } = useBattleWager({
    battle,
    userBet,
    isOwnerOfFighter,
    address,
    selectedSide,
    betAmount,
    onBattleUpdate: setActiveBattle,
  });

  if (isLoading || !battle) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="font-mono text-sm uppercase tracking-widest text-secondary flex items-center gap-3">
          <span className="w-3 h-3 border-2 border-primary border-t-transparent animate-spin inline-block" />
          <span>INITIALIZING COMBAT TELEMETRY MATRIX...</span>
        </div>
      </div>
    );
  }

  const lastTurn: CombatTurn | undefined = battle.combatLog[battle.combatLog.length - 1];
  const hpA = lastTurn?.beastAHp ?? 100;
  const hpB = lastTurn?.beastBHp ?? 100;
  const countdown = battle.status === 'pending' && battle.bettingWindowClosesAt
    ? formatTimeRemaining(battle.bettingWindowClosesAt)
    : null;

  return (
    <div className="flex-1 flex flex-col pb-16 bg-surface-container-lowest">
      {/* Top breadcrumb + status bar */}
      <div className="border-b border-divider bg-background">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-14 flex items-center justify-between font-mono text-xs">
          <p
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-secondary cursor-pointer hover:text-primary transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 ${
                  battle.status === 'live' ? 'bg-secondary animate-pulse' : 'bg-primary'
                }`}
              />
              <span className="font-bold uppercase">
                {battle.status === 'live'
                  ? 'LIVE COMBAT FEED'
                  : battle.status === 'pending'
                  ? `PENDING BETTING WINDOW (${countdown?.formatted || '60:00'})`
                  : 'COMBAT CONCLUDED'}
              </span>
            </div>
            <span className="text-divider">|</span>
            <span className="text-secondary">BATTLE ID: {battle.id}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-8 space-y-6">
        {/* ① Boxing ring — hero visual */}
        <BattleArenaRing
          battle={battle}
          hpA={hpA}
          hpB={hpB}
          lastTurn={lastTurn}
          isSimulating={isSimulating}
          isOwnerOfFighter={isOwnerOfFighter}
          onExecuteCombat={executeCombat}
        />

        {/* ② Combat log feed — full width below ring */}
        <CombatLogFeed
          battle={battle}
          isOwnerOfFighter={isOwnerOfFighter}
          isSimulating={isSimulating}
          onExecuteCombat={executeCombat}
          className="w-full"
        />

        {/* ③ Market pulse + wagering panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8">
          <MarketPulsePanel battle={battle} />
          <SpectatorWageringPanel
            battle={battle}
            userBet={userBet}
            address={address}
            isOwnerOfFighter={isOwnerOfFighter}
            selectedSide={selectedSide}
            onSelectSide={setSelectedSide}
            betAmount={betAmount}
            onChangeBetAmount={setBetAmount}
            onPlaceBet={placeWager}
            betPlaced={betPlaced}
            isClaiming={isClaiming}
            onClaimPayout={claimPayout}
          />
        </div>
      </div>
    </div>
  );
}

