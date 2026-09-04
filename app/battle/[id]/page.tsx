'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiPlay, FiSquare, FiRotateCcw, FiChevronsRight } from 'react-icons/fi';
import { useAccount } from 'wagmi';
import { Battle, CombatTurn, Bet } from '@/lib/types';
import { formatTimeRemaining } from '@/lib/utils/timer';
import { useBattle, useUserBets } from '@/hooks/useBattles';
import { useBattleCombat, useBattleWager } from '@/hooks/useBattleActions';
import { BattleArenaRing } from '@/components/battle/BattleArenaRing';
import { CombatLogFeed } from '@/components/battle/CombatLogFeed';
import { MarketPulsePanel } from '@/components/battle/MarketPulsePanel';
import { SpectatorWageringPanel } from '@/components/battle/SpectatorWageringPanel';

// ms between replay turns at each speed
const REPLAY_SPEEDS: Record<number, number> = { 1: 1800, 2: 900, 3: 400 };

export default function BattleViewPage() {
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
  const countdown = battle.status === 'pending' && battle.bettingWindowClosesAt
    ? formatTimeRemaining(battle.bettingWindowClosesAt)
    : null;

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
        {/* ① Boxing ring */}
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
        />

        {/* ② Replay control bar — only for completed battles with a log */}
        {canReplay && (
          <div className="border border-divider bg-background px-5 py-3 flex items-center justify-between font-mono text-xs">
            {/* Left: progress */}
            <div className="flex items-center gap-3">
              <span className="text-secondary uppercase font-bold">REPLAY</span>
              <div className="w-40 h-1.5 bg-neutral border border-divider overflow-hidden">
                <div
                  className="h-full bg-primary transition-none"
                  style={{
                    width: isReplayActive
                      ? `${((replayIndex + 1) / battle.combatLog.length) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <span className="text-secondary">
                {isReplayActive
                  ? `${replayIndex + 1} / ${battle.combatLog.length}`
                  : `${battle.combatLog.length} TURNS`}
              </span>
            </div>

            {/* Centre: controls */}
            <div className="flex items-center gap-2">
              {/* Reset */}
              <button
                onClick={resetReplay}
                className="p-2 border border-divider text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer"
                title="Reset"
              >
                <FiRotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Play / Stop */}
              {isReplaying ? (
                <button
                  onClick={stopReplay}
                  className="px-4 py-2 bg-primary text-background font-headline font-bold text-[10px] uppercase tracking-wider hover:bg-secondary border border-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FiSquare className="w-3 h-3" />
                  STOP
                </button>
              ) : (
                <button
                  onClick={startReplay}
                  className="px-4 py-2 bg-primary text-background font-headline font-bold text-[10px] uppercase tracking-wider hover:bg-secondary border border-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FiPlay className="w-3 h-3" />
                  {isReplayActive ? 'RESTART' : 'REPLAY'}
                </button>
              )}
            </div>

            {/* Right: speed selector */}
            <div className="flex items-center gap-2">
              <span className="text-secondary uppercase">SPEED</span>
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setReplaySpeed(s)}
                  className={`px-2 py-1 border text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    replaySpeed === s
                      ? 'bg-primary text-background border-primary'
                      : 'border-divider text-secondary hover:border-primary hover:text-primary'
                  }`}
                >
                  {s === 3 ? <FiChevronsRight className="w-3.5 h-3.5 inline" /> : `${s}×`}
                </button>
              ))}
            </div>
          </div>
        )}

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
            onClaimPayout={claimPayout}
          />
        </div>
      </div>
    </div>
  );
}

