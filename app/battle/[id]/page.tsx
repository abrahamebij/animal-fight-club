'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FiCrosshair, 
  FiClock, 
  FiActivity, 
  FiTrendingUp, 
  FiExternalLink, 
  FiArrowLeft,
  FiTerminal,
  FiAlertCircle,
  FiCheck,
  FiShield,
  FiLock
} from 'react-icons/fi';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { useWalletGate } from '@/components/wallet/useWalletGate';
import { getBattleById, placeBet, getBetsByBettor, claimBetPayout } from '@/lib/services/battleService';
import { Battle, CombatTurn, Bet } from '@/lib/types';
import { formatTimeRemaining } from '@/lib/utils/timer';
import { ESCROW_ABI } from '@/lib/contracts/escrowAbi';
import { ESCROW_CONTRACT_CONFIG } from '@/lib/constants/game';
import { somniaShannon } from '@/lib/config/wagmi';
import { 
  battleIdToBytes32, 
  sideToEscrowEnum, 
  fetchOnChainBattle, 
  fetchOnChainWager,
  getEscrowPublicClient,
  EscrowBattleStatus,
  EscrowSide
} from '@/lib/services/escrowService';
import { toast } from 'sonner';
import Img from '@/components/ui/Img';
import gsap from 'gsap';

export default function BattleViewPage() {
  const params = useParams();
  const battleId = (params?.id as string) || '';
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [battle, setBattle] = useState<Battle | null>(null);
  const [userBet, setUserBet] = useState<Bet | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeNow, setTimeNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadBattle() {
      if (!battleId) return;
      setLoading(true);
      const [data, userBets, onChainWager] = await Promise.all([
        getBattleById(battleId),
        address ? getBetsByBettor(address) : Promise.resolve([]),
        address ? fetchOnChainWager(battleId, address) : Promise.resolve(null),
      ]);
      if (mounted) {
        setBattle(data);
        const match = userBets.find((b) => b.battleId === battleId);
        if (match) {
          setUserBet(match);
          setSelectedSide(match.beastPicked);
        } else if (onChainWager && onChainWager.amount > 0n && onChainWager.side !== EscrowSide.None) {
          const sideStr = onChainWager.side === EscrowSide.BeastA ? 'beastA' : 'beastB';
          setSelectedSide(sideStr);
        } else {
          setUserBet(null);
        }
        setLoading(false);
      }
    }
    loadBattle();
    return () => {
      mounted = false;
    };
  }, [battleId, address]);

  // Betting state for spectators
  const [selectedSide, setSelectedSide] = useState<'beastA' | 'beastB'>('beastA');
  const [betAmount, setBetAmount] = useState<string>('50');
  const [betPlaced, setBetPlaced] = useState<boolean>(false);

  const countdown = battle?.status === 'pending' && battle.bettingWindowClosesAt
    ? formatTimeRemaining(battle.bettingWindowClosesAt)
    : null;

  const isLive = battle?.status === 'live';
  const isPending = battle?.status === 'pending';
  const isCompleted = battle?.status === 'completed';

  const lastTurn: CombatTurn | undefined = battle?.combatLog[battle.combatLog.length - 1];
  const hpA = lastTurn?.beastAHp ?? 100;
  const hpB = lastTurn?.beastBHp ?? 100;

  const containerRef = useRef<HTMLDivElement>(null);
  const hpBarARef = useRef<HTMLDivElement>(null);
  const hpBarBRef = useRef<HTMLDivElement>(null);
  const betBtnRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const prevLogLength = useRef(battle?.combatLog.length || 0);

  // Mount entrance: stagger the 3 fighter columns in
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fighter-panel', {
        opacity: 0,
        x: (i) => (i === 0 ? -80 : i === 2 ? 80 : 0),
        y: (i) => (i === 1 ? 30 : 0),
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
      });
      gsap.from('.bottom-panel', {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.5,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // HP bars: animate width on mount
  useEffect(() => {
    if (hpBarARef.current) {
      gsap.fromTo(
        hpBarARef.current,
        { width: '100%' },
        { width: `${Math.max(0, hpA)}%`, duration: 1.2, ease: 'power2.inOut', delay: 0.9 }
      );
    }
    if (hpBarBRef.current) {
      gsap.fromTo(
        hpBarBRef.current,
        { width: '100%' },
        { width: `${Math.max(0, hpB)}%`, duration: 1.2, ease: 'power2.inOut', delay: 1.0 }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isSimulating, setIsSimulating] = useState(false);

  // HP bars: animate on value change (after mount)
  useEffect(() => {
    if (hpBarARef.current) {
      gsap.to(hpBarARef.current, {
        width: `${Math.max(0, hpA)}%`,
        duration: 0.7,
        ease: 'power2.out',
      });
      if (hpA < 100) {
        gsap.to(hpBarARef.current, {
          opacity: 0.5,
          duration: 0.08,
          yoyo: true,
          repeat: 3,
        });
      }
    }
    if (hpBarBRef.current) {
      gsap.to(hpBarBRef.current, {
        width: `${Math.max(0, hpB)}%`,
        duration: 0.7,
        ease: 'power2.out',
      });
      if (hpB < 100) {
        gsap.to(hpBarBRef.current, {
          opacity: 0.5,
          duration: 0.08,
          yoyo: true,
          repeat: 3,
        });
      }
    }
  }, [hpA, hpB]);

  // Animate new combat log entries as they appear
  useEffect(() => {
    const currentLength = battle?.combatLog.length || 0;
    if (currentLength > prevLogLength.current && logRef.current) {
      const entries = logRef.current.querySelectorAll('.log-entry');
      const newEntries = Array.from(entries).slice(prevLogLength.current);
      gsap.from(newEntries, {
        opacity: 0,
        y: -12,
        duration: 0.35,
        stagger: 0.06,
        ease: 'power2.out',
      });
    }
    prevLogLength.current = currentLength;
  }, [battle?.combatLog.length]);

  const handleExecuteCombat = async () => {
    if (!battle || isSimulating || isCompleted) return;
    if (!isOwnerOfFighter) {
      toast.error('Combat Trigger Unauthorized', {
        description: 'Only the owners of the combatants can trigger the AI combat simulation.',
      });
      return;
    }
    setIsSimulating(true);

    try {
      const res = await fetch('/api/battle/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battleId: battle.id,
          battle,
          callerAddress: address,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to resolve combat');
      }

      const data = await res.json();
      const allTurns: CombatTurn[] = data.turns || [];

      // Step-by-step turn playback for live feedback
      for (let i = 0; i < allTurns.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
        const partialTurns = allTurns.slice(0, i + 1);
        setBattle((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: i === allTurns.length - 1 ? 'completed' : 'live',
            winner: i === allTurns.length - 1 ? data.winner : undefined,
            combatLog: partialTurns,
          };
        });
      }
    } catch (err) {
      console.error('Error during combat execution:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const { requireAuth } = useWalletGate();

  const isOwnerOfFighter = Boolean(
    address &&
    battle && (
      battle.beastA.ownerAddress?.toLowerCase() === address.toLowerCase() ||
      battle.beastB.ownerAddress?.toLowerCase() === address.toLowerCase()
    )
  );

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!battle || isOwnerOfFighter) return;
    const amountNum = Number(betAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid Wager Amount', {
        description: 'Please enter a valid STT amount greater than 0.',
      });
      return;
    }

    // Pre-validation: Verify user has not already placed a wager on this duel
    if (userBet) {
      toast.error('Single Wager Limit', {
        description: 'You have already placed a wager on this match. Each spectator is limited to one wager per duel.',
        duration: 5000,
      });
      return;
    }

    const chosenBeast = selectedSide === 'beastA' ? battle.beastA : battle.beastB;

    requireAuth({
      actionTitle: `place a ${betAmount} STT wager on ${chosenBeast.name}`,
      onSuccess: async () => {
        try {
          if (!address || !battle) return;
          if (isOwnerOfFighter) {
            toast.error('Combatant Owner Exclusion', {
              description: 'Combatant owners cannot wager on their own duels.',
            });
            return;
          }

          if (ESCROW_CONTRACT_CONFIG.isConfigured) {
            // 1. Check and ensure the battle is initialized on-chain before placing wager
            try {
              const onChain = await fetchOnChainBattle(battle.id);
              if (!onChain || onChain.status === EscrowBattleStatus.Uninitialized) {
                await fetch('/api/battle/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    battleId: battle.id,
                    ownerA: battle.beastA.ownerAddress,
                    ownerB: battle.beastB.ownerAddress,
                    bettingClosesAt: battle.bettingWindowClosesAt || (Date.now() + 3600 * 1000),
                  }),
                });
              }
            } catch (regErr) {
              console.warn('Auto battle registration on-chain attempt:', regErr);
            }

            // 2. Execute on-chain wager transaction
            const txHash = await writeContractAsync({
              address: ESCROW_CONTRACT_CONFIG.address,
              abi: ESCROW_ABI,
              functionName: 'placeWager',
              args: [battleIdToBytes32(battle.id), sideToEscrowEnum(selectedSide)],
              value: parseEther(betAmount),
              chainId: somniaShannon.id,
            });

            // 3. Wait for on-chain receipt confirmation
            const client = getEscrowPublicClient();
            const receipt = await client.waitForTransactionReceipt({ hash: txHash });
            if (receipt.status !== 'success') {
              throw new Error('On-chain wager transaction was reverted.');
            }
          }

          // 4. ONLY record to Firestore once on-chain transaction is verified successful
          const newBet = await placeBet(battle.id, address, selectedSide, amountNum);
          setUserBet(newBet);

          // Update local battle pool state
          setBattle((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              totalPoolA: selectedSide === 'beastA' ? (prev.totalPoolA || 0) + amountNum : prev.totalPoolA,
              totalPoolB: selectedSide === 'beastB' ? (prev.totalPoolB || 0) + amountNum : prev.totalPoolB,
            };
          });

          setBetPlaced(true);
          toast.success(`Wager Confirmed On-Chain!`, {
            description: `Staked ${amountNum} STT on ${chosenBeast.name}. Total wager: ${newBet.amount} STT.`,
            duration: 5000,
          });

          // Bounce animation on the button
          if (betBtnRef.current) {
            gsap.fromTo(
              betBtnRef.current,
              { scale: 0.94 },
              { scale: 1, duration: 0.45, ease: 'elastic.out(1.3, 0.5)' }
            );
          }
          setTimeout(() => setBetPlaced(false), 3000);
        } catch (err: unknown) {
          console.error('Failed to place bet:', err);
          let errorMessage = 'Transaction was cancelled or rejected by network.';
          if (err instanceof Error) {
            const msg = err.message || '';
            if (msg.includes('User rejected') || msg.includes('User denied') || msg.includes('rejected the request')) {
              errorMessage = 'Transaction rejected in wallet.';
            } else if (msg.includes('insufficient funds') || msg.includes('exceeds balance')) {
              errorMessage = 'Insufficient STT balance to cover wager amount + gas.';
            } else if (msg.includes('OwnerCannotWagerOnOwnBattle')) {
              errorMessage = 'Combatant owners cannot wager on their own duels.';
            } else if (msg.includes('CannotWagerOnBothSides')) {
              errorMessage = 'Protocol violation: You have already wagered on the opposing combatant.';
            } else if (msg.includes('BettingWindowClosed')) {
              errorMessage = 'The 1-hour spectator betting window has expired.';
            } else if (msg.includes('ZeroWagerAmount')) {
              errorMessage = 'Wager amount must be greater than 0 STT.';
            } else if (msg.includes('BattleNotPending')) {
              errorMessage = 'Wagering is closed because this duel has concluded or was cancelled.';
            } else {
              const firstLine = msg.split('\n')[0].replace(/^Error:\s*/, '');
              errorMessage = firstLine.length > 100 ? firstLine.slice(0, 100) + '...' : firstLine;
            }
          }
          toast.error('Wager Submission Failed', {
            description: errorMessage,
            duration: 6000,
          });
        }
      },
    });
  };

  const winningPool = battle?.winner === 'beastA' ? (battle.totalPoolA || 0) : (battle?.totalPoolB || 0);
  const losingPool = battle?.winner === 'beastA' ? (battle.totalPoolB || 0) : (battle?.totalPoolA || 0);
  const profit = userBet && winningPool > 0 ? (userBet.amount * losingPool) / winningPool : 0;
  const estimatedPayout = userBet ? Math.round((userBet.amount + profit) * 100) / 100 : 0;

  const handleClaimPayout = async () => {
    if (!battle || !userBet || !address || userBet.status === 'claimed') return;
    setIsClaiming(true);
    try {
      if (ESCROW_CONTRACT_CONFIG.isConfigured) {
        await writeContractAsync({
          address: ESCROW_CONTRACT_CONFIG.address,
          abi: ESCROW_ABI,
          functionName: 'claimPayout',
          args: [battleIdToBytes32(battle.id)],
          chainId: somniaShannon.id,
        });
      }

      await claimBetPayout(userBet.id, estimatedPayout);
      setUserBet((prev) => prev ? { ...prev, status: 'claimed', payoutAmount: estimatedPayout } : null);
      toast.success(`Claimed ${estimatedPayout} STT Payout!`, {
        description: 'Pari-mutuel winnings transferred to your connected wallet.',
        duration: 5000,
      });
    } catch (err: unknown) {
      console.error('Failed to claim payout:', err);
      let errorMsg = 'Transaction was rejected or failed on-chain.';
      if (err instanceof Error) {
        if (err.message.includes('AlreadyClaimed')) {
          errorMsg = 'Payout has already been claimed for this wager.';
        } else if (err.message.includes('WagerLost')) {
          errorMsg = 'Wager was on the losing combatant.';
        } else if (err.message.includes('BattleNotClaimable')) {
          errorMsg = 'This duel is not yet resolved for payout claims.';
        } else {
          errorMsg = err.message.slice(0, 100);
        }
      }
      toast.error('Payout Claim Failed', {
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-background text-foreground font-mono text-sm space-y-4">
        <div className="w-10 h-10 relative flex items-center justify-center overflow-hidden animate-spin">
          <Img 
            src="/logo.png" 
            alt="Loading Combat Telemetry..." 
            className="w-10 h-10 object-contain"
          />
        </div>
        <p className="uppercase tracking-widest text-secondary text-xs">LOADING COMBAT TELEMETRY...</p>
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-danger text-background font-mono text-xs uppercase tracking-wider">
          <span>ENCOUNTER NOT FOUND</span>
        </div>
        <h1 className="font-headline font-extrabold text-4xl uppercase tracking-tight text-primary">
          BATTLE IDENTIFIER DOES NOT EXIST
        </h1>
        <p className="font-mono text-xs text-secondary max-w-md mx-auto">
          No combat logs or wagering pools registered for battle <span className="text-primary font-bold">[{battleId}]</span>.
        </p>
        <Link
          href="/arena"
          className="inline-block px-6 py-3 bg-primary text-background font-headline font-bold text-sm uppercase tracking-wider hover:bg-neutral hover:text-primary transition-colors border border-primary"
        >
          Return to Arena
        </Link>
      </div>
    );
  }

  const activeBattle = battle;

  return (
    <div ref={containerRef} className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      {/* Top Breadcrumb & Status Bar */}
      <div className="border-b border-divider divider-ash bg-background">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-14 flex items-center justify-between font-mono text-xs">
          <Link
            href="/arena"
            className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>BACK TO ARENA</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 ${isLive ? 'bg-secondary animate-pulse' : isPending ? 'bg-secondary' : 'bg-primary'}`} />
              <span className="font-bold uppercase">
                {isLive ? 'LIVE COMBAT FEED' : isPending ? `PENDING BETTING WINDOW (${countdown?.formatted || '60:00'})` : 'COMBAT CONCLUDED'}
              </span>
            </div>
            <span className="text-divider">|</span>
            <span className="text-secondary">BATTLE ID: {activeBattle.id}</span>
          </div>
        </div>
      </div>

      {/* Main Battle Arena Grid */}
      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-8 space-y-8">
        {/* 1. Combatants Visual Duel Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Fighter A Panel (4 cols) */}
          <div className="fighter-panel lg:col-span-4 border border-divider p-6 bg-background flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-divider pb-2">
                <span className="font-mono text-xs text-secondary font-bold">COMBATANT 01 (ALPHA)</span>
                <span className="font-mono text-xs text-secondary">{activeBattle.beastA.ownerAddress}</span>
              </div>

              <div className="relative aspect-square w-full border border-divider overflow-hidden bg-zinc-900">
                <Image
                  src={activeBattle.beastA.avatarUrl}
                  alt={activeBattle.beastA.name}
                  fill
                  className="object-cover"
                  priority
                />
                {activeBattle.beastA.boundAsset && (
                  <div className="absolute top-2 right-2 bg-primary text-background font-mono text-[11px] font-bold px-2.5 py-1">
                    {activeBattle.beastA.boundAsset} BOUND
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-headline font-extrabold text-3xl uppercase tracking-tight text-primary">
                  {activeBattle.beastA.name}
                </h2>
                <div className="font-mono text-xs text-secondary">
                  RECORD: {activeBattle.beastA.record.wins}W - {activeBattle.beastA.record.losses}L
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between font-bold">
                  <span>HEALTH INTEGRITY</span>
                  <span className={hpA <= 25 ? 'text-danger font-bold' : 'text-primary'}>{hpA} / 100 HP</span>
                </div>
                <div className="w-full h-3.5 bg-neutral border border-divider p-0.5">
                  <div
                    ref={hpBarARef}
                    className={`h-full ${hpA <= 25 ? 'bg-danger' : 'bg-primary'}`}
                    style={{ width: `${Math.max(0, hpA)}%` }}
                  />
                </div>
              </div>

              {/* Stats & Market Modifier */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs border-t border-neutral pt-3">
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">PWR</div>
                  <div className="font-bold">{activeBattle.beastA.stats.power}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">DEF</div>
                  <div className="font-bold">{activeBattle.beastA.stats.defense}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">SPD</div>
                  <div className="font-bold">{activeBattle.beastA.stats.speed}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">SPC</div>
                  <div className="font-bold">{activeBattle.beastA.stats.special}</div>
                </div>
              </div>

              {activeBattle.marketPulseA && (
                <div className="border border-divider bg-surface-container-low p-3 font-mono text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold uppercase">
                    <FiTrendingUp className="w-3.5 h-3.5" />
                    <span>LOCKED MARKET PULSE:</span>
                  </div>
                  <div className="text-primary font-bold">
                    {activeBattle.marketPulseA.modifier.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center Live Combat Log & Reasoner Feed (4 cols) */}
          <div className="fighter-panel lg:col-span-4 border border-divider p-6 bg-primary text-background flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-background/20 pb-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-background/80">
                  <FiTerminal className="w-4 h-4 text-secondary" />
                  <span>LLM COMBAT REASONER</span>
                </div>
                <span className="text-background font-bold">
                  {isLive ? `ROUND ${activeBattle.combatLog.length}` : isPending ? 'WINDOW OPEN' : 'CONCLUDED'}
                </span>
              </div>

              {/* Combat narrative output */}
              <div className="space-y-4 min-h-[220px] flex flex-col justify-between">
                {lastTurn ? (
                  <div className="space-y-3 bg-background/5 p-4 border border-background/10 font-mono text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-background">TURN {lastTurn.turnNumber}: {lastTurn.actionName}</span>
                      <span className="text-danger">-{lastTurn.damageDealt} HP</span>
                    </div>
                    <p className="text-background text-sm leading-relaxed font-sans">
                      {lastTurn.combatNarrative}
                    </p>
                    <div className="text-background/60 text-[11px] border-t border-background/10 pt-2">
                      <span className="text-background/90 font-bold">AGENT REASONING: </span>
                      {lastTurn.reasoning}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 font-mono text-xs text-background/60 space-y-2">
                    <FiClock className="w-8 h-8 mx-auto text-background/80" />
                    <p className="text-sm font-bold text-background">Awaiting Window Expiry</p>
                    <p>Combat will execute turn-by-turn with LLM reasoning when betting window closes.</p>
                  </div>
                )}

                {/* Combat Trigger / Resolution Status */}
                {activeBattle.status === 'completed' ? (
                  <div className="bg-background text-primary p-3 text-center font-headline font-extrabold text-sm uppercase tracking-wider border border-background">
                    DUEL CONCLUDED - VICTOR: {activeBattle.winner === 'beastA' ? activeBattle.beastA.name : activeBattle.beastB.name}
                  </div>
                ) : isOwnerOfFighter ? (
                  <button
                    onClick={handleExecuteCombat}
                    disabled={isSimulating}
                    className="w-full py-3 bg-background text-primary font-headline font-bold text-xs uppercase tracking-wider hover:bg-neutral transition-colors border border-background disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiTerminal className="w-4 h-4 text-primary" />
                    <span>{isSimulating ? 'SIMULATING COMBAT ROUNDS...' : 'TRIGGER AGENTIC COMBAT ENGINE'}</span>
                  </button>
                ) : (
                  <div className="bg-background/10 border border-background/20 p-3 text-center font-mono text-xs text-background/80 flex items-center justify-center gap-2">
                    <FiShield className="w-3.5 h-3.5 text-background/80 flex-shrink-0" />
                    <span>AWAITING COMBATANT OWNER TRIGGER</span>
                  </div>
                )}
              </div>
            </div>

            {/* Battle Log History list */}
            <div className="border-t border-background/20 pt-3 space-y-2">
              <div className="font-mono text-[11px] text-background/40 uppercase">
                COMBAT EVENT LOG ({activeBattle.combatLog.length} TURNS)
              </div>
              <div ref={logRef} className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-2">
                {activeBattle.combatLog.map((turn) => (
                  <div key={turn.turnNumber} className="log-entry flex justify-between text-background/70 border-b border-background/5 pb-1">
                    <span>T{turn.turnNumber} [{turn.actor === 'beastA' ? activeBattle.beastA.name.split(' ')[0] : activeBattle.beastB.name.split(' ')[0]}]: {turn.actionName}</span>
                    <span className="text-danger font-bold">-{turn.damageDealt} HP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fighter B Panel (4 cols) */}
          <div className="fighter-panel lg:col-span-4 border border-divider p-6 bg-background flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-divider pb-2">
                <span className="font-mono text-xs text-secondary font-bold">COMBATANT 02 (BRAVO)</span>
                <span className="font-mono text-xs text-secondary">{activeBattle.beastB.ownerAddress}</span>
              </div>

              <div className="relative aspect-square w-full border border-divider overflow-hidden bg-zinc-900">
                <Image
                  src={activeBattle.beastB.avatarUrl}
                  alt={activeBattle.beastB.name}
                  fill
                  className="object-cover"
                  priority
                />
                {activeBattle.beastB.boundAsset && (
                  <div className="absolute top-2 right-2 bg-primary text-background font-mono text-[11px] font-bold px-2.5 py-1">
                    {activeBattle.beastB.boundAsset} BOUND
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-headline font-extrabold text-3xl uppercase tracking-tight text-primary">
                  {activeBattle.beastB.name}
                </h2>
                <div className="font-mono text-xs text-secondary">
                  RECORD: {activeBattle.beastB.record.wins}W - {activeBattle.beastB.record.losses}L
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between font-bold">
                  <span>HEALTH INTEGRITY</span>
                  <span className={hpB <= 25 ? 'text-danger font-bold' : 'text-primary'}>{hpB} / 100 HP</span>
                </div>
                <div className="w-full h-3.5 bg-neutral border border-divider p-0.5">
                  <div
                    ref={hpBarBRef}
                    className={`h-full ${hpB <= 25 ? 'bg-danger' : 'bg-primary'}`}
                    style={{ width: `${Math.max(0, hpB)}%` }}
                  />
                </div>
              </div>

              {/* Stats & Market Modifier */}
              <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs border-t border-divider pt-3">
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">PWR</div>
                  <div className="font-bold">{activeBattle.beastB.stats.power}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">DEF</div>
                  <div className="font-bold">{activeBattle.beastB.stats.defense}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">SPD</div>
                  <div className="font-bold">{activeBattle.beastB.stats.speed}</div>
                </div>
                <div className="bg-surface-container-low p-1.5">
                  <div className="text-[10px] text-secondary">SPC</div>
                  <div className="font-bold">{activeBattle.beastB.stats.special}</div>
                </div>
              </div>

              {activeBattle.marketPulseB && (
                <div className="border border-divider bg-surface-container-low p-3 font-mono text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-primary font-bold uppercase">
                    <FiTrendingUp className="w-3.5 h-3.5" />
                    <span>LOCKED MARKET PULSE:</span>
                  </div>
                  <div className="text-primary font-bold">
                    {activeBattle.marketPulseB.modifier.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Market Pulse Terminal & Spectator Wagering Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Market Pulse Panel (7 cols) */}
          <div className="bottom-panel lg:col-span-7 border border-divider p-6 bg-background space-y-6">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <div className="flex items-center gap-2">
                <FiActivity className="w-5 h-5 text-primary" />
                <h3 className="font-headline font-bold text-2xl uppercase tracking-tight">
                  DREAMDEX MARKET PULSE INTEGRATION
                </h3>
              </div>
              <span className="font-mono text-xs px-2.5 py-0.5 bg-primary text-background">
                READ-ONLY SDK
              </span>
            </div>

            <p className="font-sans text-xs text-secondary leading-relaxed">
              This panel verifies real-time order book odds from DreamDEX Event Contracts on Somnia Shannon. The locked-in probability generates an in-combat attribute modifier for bound beasts.
            </p>

            <div className="space-y-4">
              {/* Asset A Pulse */}
              {activeBattle.marketPulseA && (
                <div className="border border-divider p-4 bg-surface-container-low space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold uppercase text-primary">
                      {activeBattle.beastA.name} ({activeBattle.marketPulseA.symbol})
                    </div>
                    <span className="text-primary font-bold">
                      UP PROBABILITY: {Math.round(activeBattle.marketPulseA.upProbability * 100)}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-neutral flex overflow-hidden border border-divider">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${activeBattle.marketPulseA.upProbability * 100}%` }} 
                    />
                    <div 
                      className="h-full bg-secondary" 
                      style={{ width: `${(1 - activeBattle.marketPulseA.upProbability) * 100}%` }} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-secondary">
                    <span>BEST BID: {activeBattle.marketPulseA.bestBid} | BEST ASK: {activeBattle.marketPulseA.bestAsk}</span>
                    {activeBattle.marketPulseA.oracleQuestionId && (
                      <a
                        href={`https://prd.oracle.somnia.host/questions/${activeBattle.marketPulseA.oracleQuestionId}?view=graph`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline inline-flex items-center gap-1 hover:text-secondary"
                      >
                        <span>Audit Oracle Resolution</span>
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Asset B Pulse */}
              {activeBattle.marketPulseB ? (
                <div className="border border-divider p-4 bg-surface-container-low space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold uppercase text-primary">
                      {activeBattle.beastB.name} ({activeBattle.marketPulseB.symbol})
                    </div>
                    <span className="text-primary font-bold">
                      UP PROBABILITY: {Math.round(activeBattle.marketPulseB.upProbability * 100)}%
                    </span>
                  </div>

                  <div className="w-full h-3 bg-neutral flex overflow-hidden border border-divider">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${activeBattle.marketPulseB.upProbability * 100}%` }} 
                    />
                    <div 
                      className="h-full bg-secondary" 
                      style={{ width: `${(1 - activeBattle.marketPulseB.upProbability) * 100}%` }} 
                    />
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-divider p-4 text-center font-mono text-xs text-secondary">
                  {activeBattle.beastB.name} is UNBOUND — No DreamDEX Market Pulse applied.
                </div>
              )}
            </div>
          </div>

          {/* Spectator Wagering Panel (5 cols) */}
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
                <span className="text-secondary block text-[10px] uppercase">{activeBattle.beastA.name} POOL</span>
                <span className="font-bold text-base">{activeBattle.totalPoolA || 0} STT</span>
              </div>
              <div className="border border-divider p-3 bg-surface-container-low">
                <span className="text-secondary block text-[10px] uppercase">{activeBattle.beastB.name} POOL</span>
                <span className="font-bold text-base">{activeBattle.totalPoolB || 0} STT</span>
              </div>
            </div>

            {/* Wagering Form, Outcome Claim, or Owner Exclusion Notice */}
            {isOwnerOfFighter ? (
              <div className="p-4 bg-surface-container-low border border-divider space-y-2">
                <div className="flex items-center gap-2 text-primary font-headline font-bold text-sm uppercase">
                  <FiAlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>COMBATANT OWNER EXCLUSION</span>
                </div>
                <p className="font-mono text-xs text-secondary leading-relaxed">
                  You own a combatant in this duel (<span className="text-primary font-bold">{activeBattle.beastA.ownerAddress?.toLowerCase() === address?.toLowerCase() ? activeBattle.beastA.name : activeBattle.beastB.name}</span>). Protocol rules prohibit beast owners from placing spectator wagers on their own matches.
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
                        {userBet.beastPicked === 'beastA' ? activeBattle.beastA.name : activeBattle.beastB.name}
                      </span>
                    </div>

                    {userBet.beastPicked === activeBattle.winner ? (
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
                            onClick={handleClaimPayout}
                            disabled={isClaiming}
                            className="w-full py-3.5 bg-primary text-background font-headline font-extrabold text-base uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-50 flex items-center justify-center gap-2"
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
                      {userBet.beastPicked === 'beastA' ? activeBattle.beastA.name : activeBattle.beastB.name}
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
                  Your spectator stake of <strong className="text-primary">{userBet.amount} STT</strong> on <strong className="text-primary">{userBet.beastPicked === 'beastA' ? activeBattle.beastA.name : activeBattle.beastB.name}</strong> is locked in the Somnia escrow contract. Each spectator is permitted one wager per duel. Winnings will become claimable upon combat conclusion.
                </div>
              </div>
            ) : (
              <form onSubmit={handlePlaceBet} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-2 font-bold">
                    SELECT PREDICTED VICTOR
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSide('beastA')}
                      className={`p-3 font-headline font-bold text-sm uppercase tracking-wider border text-left transition-colors ${
                        selectedSide === 'beastA'
                          ? 'bg-primary text-background border-primary'
                          : 'bg-surface-container-low text-primary border-divider hover:border-primary'
                      }`}
                    >
                      {activeBattle.beastA.name}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedSide('beastB')}
                      className={`p-3 font-headline font-bold text-sm uppercase tracking-wider border text-left transition-colors ${
                        selectedSide === 'beastB'
                          ? 'bg-primary text-background border-primary'
                          : 'bg-surface-container-low text-primary border-divider hover:border-primary'
                      }`}
                    >
                      {activeBattle.beastB.name}
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
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full bg-surface-container-low border border-divider p-3 font-mono font-bold text-base text-primary focus:outline-none"
                    placeholder="50"
                  />
                </div>

                <button
                  ref={betBtnRef}
                  type="submit"
                  disabled={!isPending && !isLive}
                  className="w-full py-4 bg-primary text-background font-headline font-extrabold text-lg uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiCrosshair className="w-4 h-4" />
                  <span>{betPlaced ? 'WAGER SUBMITTED TO ESCROW' : 'CONFIRM SPECTATOR WAGER'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
