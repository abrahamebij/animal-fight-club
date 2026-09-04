import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllBeasts, getBeastById, getBeastsByOwner, saveBeast } from '@/lib/services/beastService';
import { Beast } from '@/lib/types';

export const BEAST_KEYS = {
  all: ['beasts'] as const,
  lists: () => [...BEAST_KEYS.all, 'list'] as const,
  detail: (id?: string) => [...BEAST_KEYS.all, 'detail', id] as const,
  byOwner: (address?: string) => [...BEAST_KEYS.all, 'owner', address?.toLowerCase()] as const,
};

export function useBeasts() {
  return useQuery({
    queryKey: BEAST_KEYS.lists(),
    queryFn: () => getAllBeasts(),
    staleTime: 1000 * 30,
  });
}

export function useBeast(id?: string) {
  return useQuery({
    queryKey: BEAST_KEYS.detail(id),
    queryFn: () => (id ? getBeastById(id) : null),
    enabled: Boolean(id),
    staleTime: 1000 * 30,
  });
}

export function useUserBeasts(address?: string) {
  return useQuery({
    queryKey: BEAST_KEYS.byOwner(address),
    queryFn: () => (address ? getBeastsByOwner(address) : []),
    enabled: Boolean(address),
    staleTime: 1000 * 15,
  });
}

export function useCreateBeastMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newBeast: Beast) => saveBeast(newBeast),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: BEAST_KEYS.all });
      if (variables.ownerAddress) {
        queryClient.invalidateQueries({ queryKey: BEAST_KEYS.byOwner(variables.ownerAddress) });
      }
    },
  });
}
