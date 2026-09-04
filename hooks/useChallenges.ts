import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getOpenChallenges, 
  getChallengesForUser, 
  createChallenge, 
  acceptChallenge, 
  declineChallenge 
} from '@/lib/services/challengeService';
import { Beast, Challenge } from '@/lib/types';
import { BATTLE_KEYS } from './useBattles';

export const CHALLENGE_KEYS = {
  all: ['challenges'] as const,
  open: () => [...CHALLENGE_KEYS.all, 'open'] as const,
  forUser: (address?: string) => [...CHALLENGE_KEYS.all, 'user', address?.toLowerCase()] as const,
};

export function useOpenChallenges() {
  return useQuery({
    queryKey: CHALLENGE_KEYS.open(),
    queryFn: () => getOpenChallenges(),
    staleTime: 1000 * 3,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
}

export function useUserChallenges(address?: string) {
  return useQuery({
    queryKey: CHALLENGE_KEYS.forUser(address),
    queryFn: () => (address ? getChallengesForUser(address) : []),
    enabled: Boolean(address),
    staleTime: 1000 * 3,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateChallengeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      challengerBeast,
      challengedBeast,
    }: {
      challengerBeast: Beast;
      challengedBeast: Beast;
    }) => createChallenge(challengerBeast, challengedBeast),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHALLENGE_KEYS.all });
    },
  });
}

export function useAcceptChallengeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ challengeId, defenderAddress }: { challengeId: string; defenderAddress: string }) =>
      acceptChallenge(challengeId, defenderAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHALLENGE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BATTLE_KEYS.all });
    },
  });
}

export function useDeclineChallengeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ challengeId, defenderAddress }: { challengeId: string; defenderAddress: string }) =>
      declineChallenge(challengeId, defenderAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHALLENGE_KEYS.all });
    },
  });
}

