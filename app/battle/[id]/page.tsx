'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FiCrosshair, 
  FiShield, 
  FiZap, 
  FiClock, 
  FiActivity, 
  FiTrendingUp, 
  FiExternalLink, 
  FiCheckCircle, 
  FiArrowLeft,
  FiTerminal
} from 'react-icons/fi';
import { MOCK_BATTLES } from '@/lib/mockData';
import { Battle, CombatTurn } from '@/lib/types';

export default function BattleViewPage() {
  const params = useParams();
  const battleId = (params?.id as string) || 'battle_live_01';

  const battle: Battle = MOCK_BATTLES.find((b) => b.id === battleId) || MOCK_BATTLES[0];

  // Betting state for spectators
  const [selectedSide, setSelectedSide] = useState<'beastA' | 'beastB'>('beastA');
  const [betAmount, setBetAmount] = useState<string>('50');
  const [betPlaced, setBetPlaced] = useState<boolean>(false);

  const isLive = battle.status === 'live';
  const isPending = battle.status === 'pending';
  const isCompleted = battle.status === 'completed';

  const lastTurn: CombatTurn | undefined = battle.combatLog[battle.combatLog.length - 1];
  const hpA = lastTurn?.beastAHp ?? 100;
  const hpB = lastTurn?.beastBHp ?? 100;

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    setBetPlaced(true);
    setTimeout(() => setBetPlaced(false), 3000);
  };

  return (
    <div className="flex flex-col w-full bg-[#FAFAF8] min-h-screen text-[#0A0A0B] pb-24">
      {/* Top Breadcrumb & Status Bar */}
      <div className="border-b border-[#0A0A0B] bg-[#FAFAF8]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-14 flex items-center justify-between font-mono text-xs">
          <Link
            href="/arena"
            className="flex items-center gap-1.5 text-[#5D5F5D] hover:text-[#0A0A0B] transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>BACK TO ARENA</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 ${isLive ? 'bg-[#DC2626] animate-pulse' : isPending ? 'bg-[#F59E0B]' : 'bg-[#0A0A0B]'}`} />
              <span className="font-bold uppercase">
                {isLive ? 'LIVE COMBAT FEED' : isPending ? 'PENDING BETTING WINDOW' : 'COMBAT CONCLUDED'}
              </span>
            </div>
            <span className="text-[#E5E5E1]">|</span>
            <span className="text-[#5D5F5D]">BATTLE ID: {battle.id}</span>
          </div>
        </div>
      </div>

      {/* Main Battle Arena Grid */}
      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-8 space-y-8">
        {/* 1. Combatants Visual Duel Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Fighter A Panel (4 cols) */}
          <div className="lg:col-span-4 border-2 border-[#0A0A0B] p-6 bg-[#FAFAF8] flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-2">
                <span className="font-mono text-xs text-[#DC2626] font-bold">COMBATANT 01 // RED</span>
                <span className="font-mono text-xs text-[#5D5F5D]">{battle.beastA.ownerAddress}</span>
              </div>

              <div className="relative aspect-square w-full border border-[#0A0A0B] overflow-hidden bg-zinc-900">
                <Image
                  src={battle.beastA.avatarUrl}
                  alt={battle.beastA.name}
                  fill
                  className="object-cover"
                  priority
                />
                {battle.beastA.boundAsset && (
                  <div className="absolute top-2 right-2 bg-[#0A0A0B] text-[#FAFAF8] font-mono text-[11px] font-bold px-2.5 py-1">
                    {battle.beastA.boundAsset} BOUND
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-headline font-extrabold text-3xl uppercase tracking-tight text-[#0A0A0B]">
                  {battle.beastA.name}
                </h2>
                <div className="font-mono text-xs text-[#5D5F5D]">
                  RECORD: {battle.beastA.record.wins}W - {battle.beastA.record.losses}L
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between font-bold">
                  <span>HEALTH INTEGRITY</span>
                  <span className="text-[#DC2626]">{hpA} / 100 HP</span>
                </div>
                <div className="w-full h-3.5 bg-[#E5E5E1] border border-[#0A0A0B] p-0.5">
                  <div 
                    className="h-full bg-[#DC2626] transition-all duration-500" 
                    style={{ width: `${Math.max(0, hpA)}%` }} 
                  />
                </div>
              </div>

              {/* Stats & Market Modifier */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs border-t border-[#E5E5E1] pt-3">
                <div className="bg-[#F4F4F0] p-1.5">
                  <div className="text-[10px] text-[#5D5F5D]">PWR</div>
                  <div className="font-bold">{battle.beastA.stats.power}</div>
                </div>
                <div className="bg-[#F4F4F0] p-1.5">
                  <div className="text-[10px] text-[#5D5F5D]">DEF</div>
                  <div className="font-bold">{battle.beastA.stats.defense}</div>
                </div>
                <div className="bg-[#F4F4F0] p-1.5">
                  <div className="text-[10px] text-[#5D5F5D]">SPD</div>
                  <div className="font-bold">{battle.beastA.stats.speed}</div>
                </div>
                <div className="bg-[#F4F4F0] p-1.5">
                  <div className="text-[10px] text-[#5D5F5D]">SPC</div>
                  <div className="font-bold">{battle.beastA.stats.special}</div>
                </div>
              </div>

              {battle.marketPulseA && (
                <div className="border border-[#DC2626] bg-[#DC2626]/5 p-3 font-mono text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#DC2626] font-bold uppercase">
                    <FiTrendingUp className="w-3.5 h-3.5" />
                    <span>LOCKED MARKET PULSE:</span>
                  </div>
                  <div className="text-[#0A0A0B] font-bold">
                    {battle.marketPulseA.modifier.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Live Combat Log & Reasoner Feed (4 cols) */}
          <div className="lg:col-span-4 border-2 border-[#0A0A0B] p-6 bg-[#0A0A0B] text-[#FAFAF8] flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#FAFAF8]/20 pb-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-[#FAFAF8]/80">
                  <FiTerminal className="w-4 h-4 text-[#DC2626]" />
                  <span>LLM COMBAT REASONER</span>
                </div>
                <span className="text-[#F59E0B] font-bold">
                  {isLive ? `ROUND ${battle.combatLog.length}` : isPending ? 'WINDOW OPEN' : 'CONCLUDED'}
                </span>
              </div>

              {/* Combat narrative output */}
              <div className="space-y-4 min-h-[220px]">
                {lastTurn ? (
                  <div className="space-y-3 bg-[#FAFAF8]/5 p-4 border border-[#FAFAF8]/10 font-mono text-xs">
                    <div className="flex items-center justify-between text-[#DC2626] font-bold">
                      <span>TURN {lastTurn.turnNumber}: {lastTurn.actionName}</span>
                      <span>-{lastTurn.damageDealt} HP</span>
                    </div>
                    <p className="text-[#FAFAF8] text-sm leading-relaxed font-sans">
                      {lastTurn.combatNarrative}
                    </p>
                    <div className="text-[#FAFAF8]/60 text-[11px] border-t border-[#FAFAF8]/10 pt-2">
                      <span className="text-[#F59E0B] font-bold">AGENT REASONING: </span>
                      {lastTurn.reasoning}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 font-mono text-xs text-[#FAFAF8]/60 space-y-2">
                    <FiClock className="w-8 h-8 mx-auto text-[#F59E0B]" />
                    <p className="text-sm font-bold text-[#FAFAF8]">Awaiting Window Expiry</p>
                    <p>Combat will execute turn-by-turn with LLM reasoning when betting window closes.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Battle Log History list */}
            <div className="border-t border-[#FAFAF8]/20 pt-3 space-y-2">
              <div className="font-mono text-[11px] text-[#FAFAF8]/40 uppercase">
                COMBAT EVENT LOG ({battle.combatLog.length} TURNS)
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-2">
                {battle.combatLog.map((turn) => (
                  <div key={turn.turnNumber} className="flex justify-between text-[#FAFAF8]/70 border-b border-[#FAFAF8]/5 pb-1">
                    <span>T{turn.turnNumber} [{turn.actor === 'beastA' ? battle.beastA.name.split(' ')[0] : battle.beastB.name.split(' ')[0]}]: {turn.actionName}</span>
                    <span className="text-[#DC2626] font-bold">-{turn.damageDealt} HP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fighter B Panel (4 cols) */}
          <div className="lg:col-span-4 border-2 border-[#0A0A0B] p-6 bg-[#FAFAF8] flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-2">
                <span className="font-mono text-xs text-[#0A0A0B] font-bold">COMBATANT 02 // BLUE</span>
                <span className="font-mono text-xs text-[#5D5F5D]">{battle.beastB.ownerAddress}</span>
              </div>

              <div className="relative aspect-square w-full border border-[#0A0A0B] overflow-hidden bg-zinc-900">
                <Image
                  src={battle.beastB.avatarUrl}
                  alt={battle.beastB.name}
                  fill
                  className="object-cover"
                  priority
                />
                {battle.beastB.boundAsset && (
                  <div className="absolute top-2 right-2 bg-[#0A0A0B] text-[#FAFAF8] font-mono text-[11px] font-bold px-2.5 py-1">
                    {battle.beastB.boundAsset} BOUND
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-headline font-extrabold text-3xl uppercase tracking-tight text-[#0A0A0B]">
                  {battle.beastB.name}
                </h2>
                <div className="font-mono text-xs text-[#5D5F5D]">
                  RECORD: {battle.beastB.record.wins}W - {battle.beastB.record.losses}L
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between font-bold">
                  <span>HEALTH INTEGRITY</span>
                  <span className="text-[#DC2626]">{hpB} / 100 HP</span>
                </div>
                <div className="w-full h-3.5 bg-[#E5E5E1] border border-[#0A0A0B] p-0.5">
                  <div 
                    className="h-full bg-[#DC2626] transition-all duration-500" 
                    style={{ width: `${Math.max(0, hpB)}%` }} 
                  />
                </div>
              </div>

              {/* Stats & Market Modifier */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs border-t border-[#E5E5E1] pt-3">
                <div className="bg-[#F4F4F0] p-1.5">
                  <div className="text-[10px] text-[#5D5F5D]">PWR</div>
                  <div className="font-bold">{battle.beastB.stats.power}</div>
                </div>
                <div className="bg-[#F4F4F0] p-1.5">
                  <div className="text-[10px] text-[#5D5F5D]">DEF</div>
                  <div className="font-bold">{battle.beastB.stats.defense}</div>
                </div>
                <div className="bg-[#F4F4F0] p-1.5">
                  <div className="text-[10px] text-[#5D5F5D]">SPD</div>
                  <div className="font-bold">{battle.beastB.stats.speed}</div>
                </div>
                <div className="bg-[#F4F4F0] p-1.5">
                  <div className="text-[10px] text-[#5D5F5D]">SPC</div>
                  <div className="font-bold">{battle.beastB.stats.special}</div>
                </div>
              </div>

              {battle.marketPulseB && (
                <div className="border border-[#0A0A0B] bg-[#F4F4F0] p-3 font-mono text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#0A0A0B] font-bold uppercase">
                    <FiTrendingUp className="w-3.5 h-3.5" />
                    <span>LOCKED MARKET PULSE:</span>
                  </div>
                  <div className="text-[#0A0A0B] font-bold">
                    {battle.marketPulseB.modifier.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Market Pulse Terminal & Spectator Wagering Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Market Pulse Panel (7 cols) */}
          <div className="lg:col-span-7 border border-[#0A0A0B] p-6 bg-[#FAFAF8] space-y-6">
            <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-3">
              <div className="flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-[#DC2626]" />
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  DREAMDEX MARKET PULSE INTEGRATION
                </h3>
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 bg-[#0A0A0B] text-[#FAFAF8]">
                READ-ONLY SDK
              </span>
            </div>

            <p className="font-sans text-xs text-[#5D5F5D] leading-relaxed">
              This panel verifies real-time order book odds from DreamDEX Event Contracts on Somnia Shannon. The locked-in probability generates an in-combat attribute modifier for bound beasts.
            </p>

            <div className="space-y-4">
              {/* Asset A Pulse */}
              {battle.marketPulseA && (
                <div className="border border-[#E5E5E1] p-4 bg-[#F4F4F0] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold uppercase text-[#0A0A0B]">
                      {battle.beastA.name} // {battle.marketPulseA.symbol}
                    </div>
                    <span className="text-[#DC2626] font-bold">
                      UP PROBABILITY: {Math.round(battle.marketPulseA.upProbability * 100)}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-[#E5E5E1] flex overflow-hidden">
                    <div 
                      className="h-full bg-[#0A0A0B]" 
                      style={{ width: `${battle.marketPulseA.upProbability * 100}%` }} 
                    />
                    <div 
                      className="h-full bg-[#DC2626]" 
                      style={{ width: `${(1 - battle.marketPulseA.upProbability) * 100}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5D5F5D]">
                    <span>BEST BID: {battle.marketPulseA.bestBid} // BEST ASK: {battle.marketPulseA.bestAsk}</span>
                    {battle.marketPulseA.oracleQuestionId && (
                      <a
                        href={`https://prd.oracle.somnia.host/questions/${battle.marketPulseA.oracleQuestionId}?view=graph`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0A0A0B] underline inline-flex items-center gap-1 hover:text-[#DC2626]"
                      >
                        <span>Audit Oracle Resolution</span>
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Asset B Pulse */}
              {battle.marketPulseB ? (
                <div className="border border-[#E5E5E1] p-4 bg-[#F4F4F0] space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold uppercase text-[#0A0A0B]">
                      {battle.beastB.name} // {battle.marketPulseB.symbol}
                    </div>
                    <span className="text-[#0A0A0B] font-bold">
                      UP PROBABILITY: {Math.round(battle.marketPulseB.upProbability * 100)}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-[#E5E5E1] flex overflow-hidden">
                    <div 
                      className="h-full bg-[#0A0A0B]" 
                      style={{ width: `${battle.marketPulseB.upProbability * 100}%` }} 
                    />
                    <div 
                      className="h-full bg-[#DC2626]" 
                      style={{ width: `${(1 - battle.marketPulseB.upProbability) * 100}%` }} 
                    />
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[#C7C6CA] p-4 text-center font-mono text-xs text-[#5D5F5D]">
                  {battle.beastB.name} is UNBOUND — No DreamDEX Market Pulse applied.
                </div>
              )}
            </div>
          </div>

          {/* Spectator Wagering Panel (5 cols) */}
          <div className="lg:col-span-5 border-2 border-[#0A0A0B] p-6 bg-[#FAFAF8] space-y-6">
            <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-3">
              <div className="flex items-center gap-2">
                <FiZap className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  SPECTATOR WAGERING
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-[#0A0A0B]">
                ESCROW POOL
              </span>
            </div>

            {/* Total Pools */}
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="border border-[#0A0A0B] p-3 bg-[#F4F4F0]">
                <span className="text-[#5D5F5D] block text-[10px] uppercase">{battle.beastA.name} POOL</span>
                <span className="font-bold text-base">{battle.totalPoolA} STT</span>
              </div>
              <div className="border border-[#0A0A0B] p-3 bg-[#F4F4F0]">
                <span className="text-[#5D5F5D] block text-[10px] uppercase">{battle.beastB.name} POOL</span>
                <span className="font-bold text-base">{battle.totalPoolB} STT</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePlaceBet} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0A0A0B] mb-2 font-bold">
                  SELECT PREDICTED VICTOR
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedSide('beastA')}
                    className={`p-3 font-headline font-bold text-sm uppercase tracking-wider border text-left transition-colors ${
                      selectedSide === 'beastA'
                        ? 'bg-[#0A0A0B] text-[#FAFAF8] border-[#0A0A0B]'
                        : 'bg-[#F4F4F0] text-[#0A0A0B] border-[#E5E5E1]'
                    }`}
                  >
                    {battle.beastA.name}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSide('beastB')}
                    className={`p-3 font-headline font-bold text-sm uppercase tracking-wider border text-left transition-colors ${
                      selectedSide === 'beastB'
                        ? 'bg-[#0A0A0B] text-[#FAFAF8] border-[#0A0A0B]'
                        : 'bg-[#F4F4F0] text-[#0A0A0B] border-[#E5E5E1]'
                    }`}
                  >
                    {battle.beastB.name}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-[#0A0A0B] mb-1.5 font-bold">
                  WAGER AMOUNT (STT)
                </label>
                <input
                  type="number"
                  min="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-[#F4F4F0] border border-[#0A0A0B] p-3 font-mono font-bold text-base text-[#0A0A0B] focus:outline-none"
                  placeholder="50"
                />
              </div>

              <button
                type="submit"
                disabled={!isPending && !isLive}
                className="w-full py-4 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-extrabold text-lg uppercase tracking-wider hover:bg-[#DC2626] transition-colors border border-[#0A0A0B] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiZap className="w-4 h-4" />
                <span>{betPlaced ? 'WAGER SUBMITTED TO ESCROW' : 'CONFIRM SPECTATOR WAGER'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
