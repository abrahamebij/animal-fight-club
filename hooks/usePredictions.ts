'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { 
  fetchLivePredictionMarkets, 
  fetchUserPredictions, 
  fetchTUsdcBalance, 
  claimTUsdcFaucet, 
  placePredictionOrder,
  PlacePredictionOrderParams 
} from '@/lib/services/predictionService';
import { LiveEventMarket, EventPrediction } from '@/lib/types';
import { toast } from 'sonner';

export const PREDICTION_KEYS = {
  allMarkets: ['predictionMarkets'] as const,
  userPredictions: (address?: string) => ['userPredictions', address?.toLowerCase()] as const,
  balance: (address?: string) => ['tUsdcBalance', address?.toLowerCase()] as const,
};

/**
 * Hook to discover live DreamDEX binary markets (BTC and ETH)
 */
export function useLivePredictionMarkets() {
  return useQuery<LiveEventMarket[]>({
    queryKey: PREDICTION_KEYS.allMarkets,
    queryFn: fetchLivePredictionMarkets,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 15,
  });
}

/**
 * Hook to fetch user's prediction history with resolution status
 */
export function useUserPredictions(address?: string) {
  return useQuery<EventPrediction[]>({
    queryKey: PREDICTION_KEYS.userPredictions(address),
    queryFn: () => fetchUserPredictions(address),
    enabled: Boolean(address),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}

/**
 * Hook to read user's tUSDC balance
 */
export function useTUsdcBalance(address?: string) {
  const publicClient = usePublicClient();

  return useQuery<string>({
    queryKey: PREDICTION_KEYS.balance(address),
    queryFn: async () => {
      if (!publicClient || !address) return '0.00';
      return fetchTUsdcBalance(publicClient, address as `0x${string}`);
    },
    enabled: Boolean(publicClient && address),
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 15,
  });
}

/**
 * Hook to claim 1,000 tUSDC from testnet faucet
 */
export function useClaimFaucetMutation() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  return useMutation({
    mutationFn: async (amount: number = 1000) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }
      return claimTUsdcFaucet(walletClient, publicClient, amount);
    },
    onSuccess: () => {
      toast.success('Testnet tUSDC Minted!', {
        description: 'Successfully credited 1,000 tUSDC to your connected wallet.',
      });
      if (address) {
        queryClient.invalidateQueries({ queryKey: PREDICTION_KEYS.balance(address) });
      }
    },
    onError: (err: unknown) => {
      console.error('Faucet error:', err);
      const msg = err instanceof Error ? err.message : 'Transaction was rejected';
      toast.error('Faucet Request Failed', { description: msg.slice(0, 100) });
    },
  });
}

/**
 * Hook to place a real IOC order on DreamDEX Event Contracts
 */
export function usePlacePredictionMutation() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  return useMutation({
    mutationFn: async (params: Omit<PlacePredictionOrderParams, 'userAddress'>) => {
      if (!walletClient || !publicClient || !address) {
        throw new Error('Please connect your wallet to place a prediction');
      }
      return placePredictionOrder(walletClient, publicClient, {
        ...params,
        userAddress: address as `0x${string}`,
      });
    },
    onSuccess: (data, variables) => {
      toast.success('Prediction Placed on DreamDEX!', {
        description: `Staked ${variables.stakeAmount} tUSDC on ${variables.side} (${variables.market.symbol}).`,
      });
      if (address) {
        queryClient.invalidateQueries({ queryKey: PREDICTION_KEYS.userPredictions(address) });
        queryClient.invalidateQueries({ queryKey: PREDICTION_KEYS.balance(address) });
      }
      queryClient.invalidateQueries({ queryKey: PREDICTION_KEYS.allMarkets });
    },
    onError: (err: unknown) => {
      console.error('Place prediction error:', err);
      let errorMsg = 'Failed to execute order on DreamDEX';
      if (err instanceof Error) {
        if (err.message.includes('User rejected') || err.message.includes('User denied')) {
          errorMsg = 'Transaction rejected in wallet';
        } else if (err.message.includes('Market is not open')) {
          errorMsg = 'Window has locked or expired. Refresh for live windows.';
        } else {
          errorMsg = err.message.slice(0, 120);
        }
      }
      toast.error('Order Submission Failed', { description: errorMsg });
    },
  });
}
