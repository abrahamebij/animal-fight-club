import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllBattles, 
  getBattleById, 
  getBetsByBettor, 
  placeBet, 
  claimBetPayout 
} from '@/lib/services/battleService';
import { 
  fetchOnChainBattle, 
  fetchOnChainWager 
} from '@/lib/services/escrowService';
import { Battle, Bet } from '@/lib/types';

export const BATTLE_KEYS = {
  all: ['battles'] as const,
  lists: () => [...BATTLE_KEYS.all, 'list'] as const,
  detail: (id?: string) => [...BATTLE_KEYS.all, 'detail', id] as const,
  live: () => [...BATTLE_KEYS.all, 'live'] as const,
  bets: (address?: string) => ['bets', address?.toLowerCase()] as const,
  onChainBattle: (id?: string) => ['onchain-battle', id] as const,
  onChainWager: (id?: string, address?: string) => ['onchain-wager', id, address?.toLowerCase()] as const,
};

export function useBattles() {
  return useQuery({
    queryKey: BATTLE_KEYS.lists(),
    queryFn: () => getAllBattles(),
    staleTime: 1000 * 15,
  });
}

export function useBattle(id?: string) {
  return useQuery({
    queryKey: BATTLE_KEYS.detail(id),
    queryFn: () => (id ? getBattleById(id) : null),
    enabled: Boolean(id),
    staleTime: 1000 * 10,
  });
}

export function useLiveBattle() {
  return useQuery({
    queryKey: BATTLE_KEYS.live(),
    queryFn: async () => {
      const battles = await getAllBattles();
      const live = battles.find((b) => b.status === 'live');
      if (live) return live;
      const pending = battles.find((b) => b.status === 'pending');
      if (pending) return pending;
      return battles[0] || null;
    },
    staleTime: 1000 * 15,
  });
}

export function useUserBets(address?: string) {
  return useQuery({
    queryKey: BATTLE_KEYS.bets(address),
    queryFn: () => (address ? getBetsByBettor(address) : []),
    enabled: Boolean(address),
    staleTime: 1000 * 15,
  });
}

export function useOnChainBattle(id?: string) {
  return useQuery({
    queryKey: BATTLE_KEYS.onChainBattle(id),
    queryFn: () => (id ? fetchOnChainBattle(id) : null),
    enabled: Boolean(id),
    staleTime: 1000 * 20,
  });
}

export function useOnChainWager(id?: string, address?: string) {
  return useQuery({
    queryKey: BATTLE_KEYS.onChainWager(id, address),
    queryFn: () => (id && address ? fetchOnChainWager(id, address) : null),
    enabled: Boolean(id && address),
    staleTime: 1000 * 20,
  });
}

export function usePlaceBetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      battleId,
      bettorAddress,
      beastPicked,
      amount,
    }: {
      battleId: string;
      bettorAddress: string;
      beastPicked: 'beastA' | 'beastB';
      amount: number;
    }) => placeBet(battleId, bettorAddress, beastPicked, amount),
    onSuccess: (newBet) => {
      queryClient.invalidateQueries({ queryKey: BATTLE_KEYS.detail(newBet.battleId) });
      queryClient.invalidateQueries({ queryKey: BATTLE_KEYS.bets(newBet.bettorAddress) });
      queryClient.invalidateQueries({ queryKey: BATTLE_KEYS.onChainBattle(newBet.battleId) });
      queryClient.invalidateQueries({ queryKey: BATTLE_KEYS.onChainWager(newBet.battleId, newBet.bettorAddress) });
    },
  });
}

export function useClaimPayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ betId, payoutAmount }: { betId: string; payoutAmount: number }) =>
      claimBetPayout(betId, payoutAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
    },
  });
}
