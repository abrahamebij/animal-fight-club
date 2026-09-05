'use client';

import React, { useRef } from 'react';
import { FiTrendingUp, FiAlertCircle, FiCheck, FiCrosshair, FiRefreshCw } from 'react-icons/fi';
import { Battle, Bet } from '@/lib/types';

interface SpectatorWageringPanelProps {
  battle: Battle;
  userBet: Bet | null;
  address?: string;
  isOwnerOfFighter: boolean;
  selectedSide: 'beastA' | 'beastB';
  onSelectSide: (side: 'beastA' | 'beastB') => void;
  betAmount: string;
  onChangeBetAmount: (amount: string) => void;
  onPlaceBet: (e: React.FormEvent) => void;
  betPlaced: boolean;
  isClaiming: boolean;
  isPlacingWager?: boolean;
  onClaimPayout: () => void;
}

export function SpectatorWageringPanel({
  battle,
  userBet,
  address,
  isOwnerOfFighter,
  selectedSide,
  onSelectSide,
  betAmount,
  onChangeBetAmount,
  onPlaceBet,
  betPlaced,
  isClaiming,
  isPlacingWager = false,
  onClaimPayout,
}: SpectatorWageringPanelProps) {
  const betBtnRef = useRef<HTMLButtonElement>(null);

  const isLive = battle.status === 'live';
  const isPending = battle.status === 'pending';
  const isCompleted = battle.status === 'completed';

  const winningPool = battle.winner === 'beastA' ? (battle.totalPoolA || 0) : (battle.totalPoolB || 0);
  const losingPool = battle.winner === 'beastA' ? (battle.totalPoolB || 0) : (battle.totalPoolA || 0);
  const profit = userBet && winningPool > 0 ? (userBet.amount * losingPool) / winningPool : 0;
  const estimatedPayout = userBet ? Math.round((userBet.amount + profit) * 100) / 100 : 0;

  return (
    <div className="bottom-panel lg:col-span-5 border border-divider p-6 bg-background space-y-6">
      <div className="flex items-center justify-between border-b border-divider pb-3">
        <div className="flex items-center gap-2">
          <FiTrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-headline font-bold text-2xl uppercase tracking-tight">
            SPECTATOR WAGERING
          </h3>
        </div>
        <span className="font-mono text-xs font-bold text-primary">
          ESCROW POOL
        </span>
      </div>

      {/* Total Pools */}
      <div className="grid grid-cols-2 gap-4 font-mono text-xs">
        <div className="border border-divider p-3 bg-surface-container-low">
          <span className="text-secondary block text-[10px] uppercase">
            {battle.beastA.name} POOL
          </span>
          <span className="font-bold text-base">{battle.totalPoolA || 0} STT</span>
        </div>
        <div className="border border-divider p-3 bg-surface-container-low">
          <span className="text-secondary block text-[10px] uppercase">
            {battle.beastB.name} POOL
          </span>
          <span className="font-bold text-base">{battle.totalPoolB || 0} STT</span>
        </div>
      </div>

      {/* State Renderers: Owner Exclusion / Completed Duel / Active Bet / New Wager Form */}
      {isOwnerOfFighter ? (
        <div className="p-4 bg-surface-container-low border border-divider space-y-2">
          <div className="flex items-center gap-2 text-primary font-headline font-bold text-sm uppercase">
            <FiAlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
            <span>COMBATANT OWNER EXCLUSION</span>
          </div>
          <p className="font-mono text-xs text-secondary leading-relaxed">
            You own a combatant in this duel (<span className="text-primary font-bold">{battle.beastA.ownerAddress?.toLowerCase() === address?.toLowerCase() ? battle.beastA.name : battle.beastB.name}</span>). Protocol rules prohibit beast owners from placing spectator wagers on their own matches.
          </p>
        </div>
      ) : isCompleted ? (
        <div className="space-y-4">
          {userBet ? (
            <div className="border border-divider p-4 bg-surface-container-low space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-divider pb-2">
                <span className="text-secondary uppercase">YOUR SPECTATOR WAGER</span>
                <span className="font-bold text-primary">{userBet.amount} STT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary uppercase">PICKED VICTOR</span>
                <span className="font-bold text-primary uppercase">
                  {userBet.beastPicked === 'beastA' ? battle.beastA.name : battle.beastB.name}
                </span>
              </div>

              {userBet.beastPicked === battle.winner ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-primary/10 border border-primary text-primary flex items-center justify-between">
                    <span className="font-headline font-bold uppercase">OUTCOME: WON</span>
                    <span className="font-bold">{estimatedPayout} STT PAYOUT</span>
                  </div>

                  {userBet.status === 'claimed' ? (
                    <div className="p-3 bg-surface-container-low border border-divider text-center text-secondary uppercase font-bold">
                      PAYOUT CLAIMED & TRANSFERRED
                    </div>
                  ) : (
                    <button
                      onClick={onClaimPayout}
                      disabled={isClaiming}
                      className="w-full py-3.5 bg-primary text-background font-headline font-extrabold text-base uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>{isClaiming ? 'CLAIMING FROM ESCROW...' : `CLAIM ${estimatedPayout} STT PAYOUT`}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-surface-container-low border border-divider text-secondary space-y-1">
                  <span className="font-headline font-bold text-sm block uppercase text-primary">OUTCOME: LOSS</span>
                  <p className="text-[11px] leading-relaxed">
                    Your wager was distributed proportionally to the winning pool according to pari-mutuel protocol rules.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 border border-divider bg-surface-container-low text-center space-y-2 font-mono text-xs text-secondary">
              <span className="font-headline font-bold text-sm uppercase text-primary block">WAGERING RESOLVED</span>
              <p>This duel has concluded. Spectator betting is closed for this match.</p>
            </div>
          )}
        </div>
      ) : userBet ? (
        <div className="border border-divider p-5 bg-surface-container-low space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-divider pb-2.5">
            <div className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-primary" />
              <span className="font-headline font-bold text-sm uppercase text-primary">WAGER SECURED IN ESCROW</span>
            </div>
            <span className="px-2 py-0.5 bg-primary text-background text-[10px] font-bold uppercase">
              1 BET LIMIT REACHED
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-secondary uppercase">STAKED COMBATANT</span>
              <span className="font-bold text-primary text-sm uppercase">
                {userBet.beastPicked === 'beastA' ? battle.beastA.name : battle.beastB.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary uppercase">STAKED AMOUNT</span>
              <span className="font-bold text-primary text-sm">{userBet.amount} STT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary uppercase">STATUS</span>
              <span className="font-bold text-primary uppercase">ACTIVE ON-CHAIN</span>
            </div>
          </div>

          <div className="p-3 bg-background border border-divider text-secondary text-[11px] leading-relaxed">
            Your spectator stake of <strong className="text-primary">{userBet.amount} STT</strong> on <strong className="text-primary">{userBet.beastPicked === 'beastA' ? battle.beastA.name : battle.beastB.name}</strong> is locked in the Somnia escrow contract. Each spectator is permitted one wager per duel. Winnings will become claimable upon combat conclusion.
          </div>
        </div>
      ) : (
        <form onSubmit={onPlaceBet} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-2 font-bold">
              SELECT PREDICTED VICTOR
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectSide('beastA')}
                className={`p-3 font-headline font-bold text-sm uppercase tracking-wider border text-left transition-colors cursor-pointer ${
                  selectedSide === 'beastA'
                    ? 'bg-primary text-background border-primary'
                    : 'bg-surface-container-low text-primary border-divider hover:border-primary'
                }`}
              >
                {battle.beastA.name}
              </button>

              <button
                type="button"
                onClick={() => onSelectSide('beastB')}
                className={`p-3 font-headline font-bold text-sm uppercase tracking-wider border text-left transition-colors cursor-pointer ${
                  selectedSide === 'beastB'
                    ? 'bg-primary text-background border-primary'
                    : 'bg-surface-container-low text-primary border-divider hover:border-primary'
                }`}
              >
                {battle.beastB.name}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-1.5 font-bold">
              WAGER AMOUNT (STT)
            </label>
            <input
              type="number"
              min="1"
              value={betAmount}
              onChange={(e) => onChangeBetAmount(e.target.value)}
              className="w-full bg-surface-container-low border border-divider p-3 font-mono font-bold text-base text-primary focus:outline-none"
              placeholder="50"
            />
          </div>

          <button
            ref={betBtnRef}
            type="submit"
            disabled={(!isPending && !isLive) || isPlacingWager}
            className="w-full py-4 bg-primary text-background font-headline font-extrabold text-lg uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPlacingWager ? (
              <FiRefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FiCrosshair className="w-4 h-4" />
            )}
            <span>
              {betPlaced
                ? 'WAGER SUBMITTED TO ESCROW'
                : isPlacingWager
                ? 'CONFIRMING ON-CHAIN...'
                : 'CONFIRM SPECTATOR WAGER'}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}

