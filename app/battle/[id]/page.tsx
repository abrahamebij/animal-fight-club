'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { useAccount } from 'wagmi';
import { Battle, CombatTurn, Bet } from '@/lib/types';
import { useCountdown } from '@/hooks/useCountdown';
import { useBattle, useUserBets } from '@/hooks/useBattles';
import { useBattleCombat, useBattleWager } from '@/hooks/useBattleActions';
import { BattleArenaRing } from '@/components/battle/BattleArenaRing';
import { BattleFighterCard } from '@/components/battle/BattleFighterCard';
import { BattleReplayBar } from '@/components/battle/BattleReplayBar';
import { CombatLogFeed } from '@/components/battle/CombatLogFeed';
import { MarketPulsePanel } from '@/components/battle/MarketPulsePanel';
import { SpectatorWageringPanel } from '@/components/battle/SpectatorWageringPanel';

// ms between replay turns at each speed
const REPLAY_SPEEDS: Record<number, number> = { 1: 1800, 2: 900, 3: 400 };

export default function BattleViewPage() {
  const router = useRouter();
  const params = useParams();
  const battleId = (params?.id as string) || '';
  const { address } = useAccount();

  const { data: initialBattle, isLoading } = useBattle(battleId);
  const { data: userBets = [] } = useUserBets(address);

  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [selectedSide, setSelectedSide] = useState<'beastA' | 'beastB'>('beastA');
  const [betAmount, setBetAmount] = useState<string>('50');

  // ── Replay state ───────────────────────────────────────────────────────────
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(-1);     // -1 = not started, 0..n = turn index
  const [replaySpeed, setReplaySpeed] = useState(1);      // 1 | 2 | 3
  const [replayReset, setReplayReset] = useState(0);      // increment to snap ring back
  const replayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const battle = activeBattle || initialBattle || null;
  const countdown = useCountdown(battle?.status === 'pending' ? battle.bettingWindowClosesAt : null);
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

  useEffect(() => {
    if (initialBattle && (!activeBattle || !isSimulating)) {
      setActiveBattle(initialBattle);
    }
  }, [initialBattle, isSimulating]);

  const { placeWager, claimPayout, betPlaced, isClaiming, isPlacingWager } = useBattleWager({
    battle,
    userBet,
    isOwnerOfFighter,
    address,
    selectedSide,
    betAmount,
    onBattleUpdate: setActiveBattle,
  });

  // ── Replay interval: advance one turn per tick ────────────────────────────
  useEffect(() => {
    if (!isReplaying || !battle) return;

    replayIntervalRef.current = setInterval(() => {
      setReplayIndex((prev) => {
        const next = prev + 1;
        if (next >= battle.combatLog.length) {
          // Replay finished — stop
          setIsReplaying(false);
          return battle.combatLog.length - 1;
        }
        return next;
      });
    }, REPLAY_SPEEDS[replaySpeed]);

    return () => {
      if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    };
  }, [isReplaying, replaySpeed, battle]);

  // ── Replay controls ───────────────────────────────────────────────────────
  const startReplay = useCallback(() => {
    if (!battle?.combatLog.length) return;
    setReplayReset((r) => r + 1);   // snap fighters back to standing
    setReplayIndex(0);
    setIsReplaying(true);
  }, [battle]);

  const stopReplay = useCallback(() => {
    setIsReplaying(false);
    if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
  }, []);

  const resetReplay = useCallback(() => {
    stopReplay();
    setReplayIndex(-1);
    setReplayReset((r) => r + 1);
  }, [stopReplay]);

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

  // ── Derived replay values ─────────────────────────────────────────────────
  const isReplayActive   = replayIndex >= 0;
  const replayTurnData   = isReplayActive ? battle.combatLog[replayIndex] : undefined;
  const replayHpA        = replayTurnData?.beastAHp;
  const replayHpB        = replayTurnData?.beastBHp;
  const isFinalTurn      = replayIndex === battle.combatLog.length - 1;
  const canReplay        = battle.status === 'completed' && battle.combatLog.length > 0;

  return (
    <div className="flex-1 flex flex-col pb-16 bg-surface-container-lowest">
      {/* Top breadcrumb + status bar */}
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
            className="flex items-center gap-1.5 text-secondary cursor-pointer hover:text-primary transition-colors focus:outline-none"
            aria-label="Back to Arena"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>BACK</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 ${
                  battle.status === 'live' ? 'bg-secondary animate-pulse' : 'bg-primary'
                }`}
              />
              <span className="font-bold uppercase">
                {isReplayActive
                  ? `REPLAY — TURN ${replayIndex + 1} / ${battle.combatLog.length}`
                  : battle.status === 'live'
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
        {/* 3-column arena: 20% Opponent A | 60% Canvas / Ring | 20% Opponent B */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* Left: Opponent Alpha (20%) */}
          <div className="lg:col-span-1">
            <BattleFighterCard
              label="COMBATANT 01"
              role="ALPHA"
              beast={battle.beastA}
              hp={isReplayActive && replayHpA !== undefined ? replayHpA : hpA}
              marketPulse={battle.marketPulseA}
            />
          </div>

          {/* Center: Canvas & Replay Controls (60%) */}
          <div className="lg:col-span-3 space-y-4">
            <BattleArenaRing
              battle={battle}
              hpA={hpA}
              hpB={hpB}
              lastTurn={lastTurn}
              isSimulating={isSimulating}
              isOwnerOfFighter={isOwnerOfFighter}
              onExecuteCombat={executeCombat}
              replayTurn={replayTurnData}
              overrideHpA={replayHpA}
              overrideHpB={replayHpB}
              replayReset={replayReset}
              suppressVictory={isReplayActive && !isFinalTurn}
              backgroundImageUrl="/boxing-ring.webp"
            />

            {canReplay && (
              <BattleReplayBar
                isReplayActive={isReplayActive}
                isReplaying={isReplaying}
                replayIndex={replayIndex}
                totalTurns={battle.combatLog.length}
                replaySpeed={replaySpeed}
                onStart={startReplay}
                onStop={stopReplay}
                onReset={resetReplay}
                onSpeedChange={setReplaySpeed}
              />
            )}
          </div>

          {/* Right: Opponent Bravo (20%) */}
          <div className="lg:col-span-1">
            <BattleFighterCard
              label="COMBATANT 02"
              role="BRAVO"
              beast={battle.beastB}
              hp={isReplayActive && replayHpB !== undefined ? replayHpB : hpB}
              marketPulse={battle.marketPulseB}
            />
          </div>
        </div>

        {/* ③ Combat log feed — full width */}
        <CombatLogFeed
          battle={battle}
          isOwnerOfFighter={isOwnerOfFighter}
          isSimulating={isSimulating}
          onExecuteCombat={executeCombat}
          className="w-full"
        />

        {/* ④ Market pulse + wagering panels */}
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
            isPlacingWager={isPlacingWager}
            onClaimPayout={claimPayout}
          />
        </div>
      </div>
    </div>
  );
}

