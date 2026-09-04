'use client';

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { useWalletGate } from '@/components/wallet/useWalletGate';
import { Battle, CombatTurn, Bet } from '@/lib/types';
import { ESCROW_ABI } from '@/lib/contracts/escrowAbi';
import { ESCROW_CONTRACT_CONFIG } from '@/lib/constants/game';
import { somniaShannon } from '@/lib/config/wagmi';
import { 
  battleIdToBytes32, 
  sideToEscrowEnum, 
  fetchOnChainBattle, 
  getEscrowPublicClient, 
  EscrowBattleStatus 
} from '@/lib/services/escrowService';
import { usePlaceBetMutation, useClaimPayoutMutation } from './useBattles';
import { toast } from 'sonner';

export function useBattleCombat({
  battle,
  isOwnerOfFighter,
  address,
  onBattleUpdate,
}: {
  battle: Battle | null;
  isOwnerOfFighter: boolean;
  address?: string;
  onBattleUpdate: (updater: (prev: Battle | null) => Battle | null) => void;
}) {
  const [isSimulating, setIsSimulating] = useState(false);

  const executeCombat = async () => {
    if (!battle || isSimulating || battle.status === 'completed') return;
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

      for (let i = 0; i < allTurns.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1100));
        const partialTurns = allTurns.slice(0, i + 1);
        onBattleUpdate((prev) => {
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

  return { isSimulating, executeCombat };
}

export function useBattleWager({
  battle,
  userBet,
  isOwnerOfFighter,
  address,
  selectedSide,
  betAmount,
  onBattleUpdate,
}: {
  battle: Battle | null;
  userBet: Bet | null;
  isOwnerOfFighter: boolean;
  address?: string;
  selectedSide: 'beastA' | 'beastB';
  betAmount: string;
  onBattleUpdate: (updater: (prev: Battle | null) => Battle | null) => void;
}) {
  const { writeContractAsync } = useWriteContract();
  const { requireAuth } = useWalletGate();
  const placeBetMutation = usePlaceBetMutation();
  const claimPayoutMutation = useClaimPayoutMutation();

  const [betPlaced, setBetPlaced] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const placeWager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!battle || isOwnerOfFighter) return;
    const amountNum = Number(betAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Invalid Wager Amount', { description: 'Please enter a valid STT amount greater than 0.' });
      return;
    }

    if (userBet) {
      toast.error('Single Wager Limit', {
        description: 'You have already placed a wager on this match. Each spectator is limited to one wager per duel.',
      });
      return;
    }

    const chosenBeast = selectedSide === 'beastA' ? battle.beastA : battle.beastB;

    requireAuth({
      actionTitle: `place a ${betAmount} STT wager on ${chosenBeast.name}`,
      onSuccess: async () => {
        try {
          if (!address || !battle || isOwnerOfFighter) return;

          if (ESCROW_CONTRACT_CONFIG.isConfigured) {
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

            const txHash = await writeContractAsync({
              address: ESCROW_CONTRACT_CONFIG.address,
              abi: ESCROW_ABI,
              functionName: 'placeWager',
              args: [battleIdToBytes32(battle.id), sideToEscrowEnum(selectedSide)],
              value: parseEther(betAmount),
              chainId: somniaShannon.id,
            });

            const client = getEscrowPublicClient();
            const receipt = await client.waitForTransactionReceipt({ hash: txHash });
            if (receipt.status !== 'success') {
              throw new Error('On-chain wager transaction was reverted.');
            }
          }

          await placeBetMutation.mutateAsync({
            battleId: battle.id,
            bettorAddress: address,
            beastPicked: selectedSide,
            amount: amountNum,
          });

          onBattleUpdate((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              totalPoolA: selectedSide === 'beastA' ? (prev.totalPoolA || 0) + amountNum : prev.totalPoolA,
              totalPoolB: selectedSide === 'beastB' ? (prev.totalPoolB || 0) + amountNum : prev.totalPoolB,
            };
          });

          setBetPlaced(true);
          toast.success('Wager Confirmed On-Chain!', {
            description: `Staked ${amountNum} STT on ${chosenBeast.name}.`,
          });
          setTimeout(() => setBetPlaced(false), 3000);
        } catch (err: unknown) {
          console.error('Failed to place bet:', err);
          let errorMessage = 'Transaction was cancelled or rejected by network.';
          if (err instanceof Error) {
            const msg = err.message || '';
            if (msg.includes('User rejected') || msg.includes('User denied')) {
              errorMessage = 'Transaction rejected in wallet.';
            } else if (msg.includes('insufficient funds') || msg.includes('exceeds balance')) {
              errorMessage = 'Insufficient STT balance to cover wager amount + gas.';
            } else if (msg.includes('CannotWagerOnBothSides')) {
              errorMessage = 'Protocol violation: You have already wagered on the opposing combatant.';
            } else {
              errorMessage = msg.split('\n')[0].slice(0, 100);
            }
          }
          toast.error('Wager Submission Failed', { description: errorMessage });
        }
      },
    });
  };

  const claimPayout = async () => {
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

      const winningPool = battle.winner === 'beastA' ? (battle.totalPoolA || 0) : (battle.totalPoolB || 0);
      const losingPool = battle.winner === 'beastA' ? (battle.totalPoolB || 0) : (battle.totalPoolA || 0);
      const profit = winningPool > 0 ? (userBet.amount * losingPool) / winningPool : 0;
      const estimatedPayout = Math.round((userBet.amount + profit) * 100) / 100;

      await claimPayoutMutation.mutateAsync({ betId: userBet.id, payoutAmount: estimatedPayout });
      toast.success(`Claimed ${estimatedPayout} STT Payout!`, {
        description: 'Pari-mutuel winnings transferred to your connected wallet.',
      });
    } catch (err: unknown) {
      console.error('Failed to claim payout:', err);
      toast.error('Claim Payout Failed', { description: 'Contract claim failed or transaction was rejected.' });
    } finally {
      setIsClaiming(false);
    }
  };

  return { placeWager, claimPayout, betPlaced, isClaiming };
}

