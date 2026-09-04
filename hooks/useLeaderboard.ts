import { useQuery } from '@tanstack/react-query';
import { getAllBeasts } from '@/lib/services/beastService';
import { getAllBets } from '@/lib/services/battleService';
import { Beast, Bet } from '@/lib/types';

export interface BettorLeaderboardEntry {
  address: string;
  totalWagered: number;
  totalPayout: number;
  netProfit: number;
  betsCount: number;
  winsCount: number;
  winRate: number;
}

export function useLeaderboardBeasts() {
  return useQuery({
    queryKey: ['leaderboard', 'beasts'],
    queryFn: async () => {
      const beasts = await getAllBeasts();
      return [...beasts].sort((a, b) => {
        const totalA = a.record.wins + a.record.losses;
        const totalB = b.record.wins + b.record.losses;
        const winRateA = totalA > 0 ? a.record.wins / totalA : 0;
        const winRateB = totalB > 0 ? b.record.wins / totalB : 0;
        if (b.record.wins !== a.record.wins) {
          return b.record.wins - a.record.wins;
        }
        return winRateB - winRateA;
      });
    },
    staleTime: 1000 * 30,
  });
}

export function useLeaderboardBettors() {
  return useQuery({
    queryKey: ['leaderboard', 'bettors'],
    queryFn: async (): Promise<BettorLeaderboardEntry[]> => {
      const bets = await getAllBets();
      const map: Record<string, {
        totalWagered: number;
        totalPayout: number;
        betsCount: number;
        winsCount: number;
      }> = {};

      bets.forEach((bet) => {
        const addr = bet.bettorAddress.toLowerCase();
        if (!map[addr]) {
          map[addr] = { totalWagered: 0, totalPayout: 0, betsCount: 0, winsCount: 0 };
        }
        map[addr].totalWagered += bet.amount;
        map[addr].betsCount += 1;
        if (bet.status === 'won' || bet.status === 'claimed') {
          map[addr].winsCount += 1;
          map[addr].totalPayout += bet.payoutAmount || bet.amount;
        }
      });

      return Object.entries(map)
        .map(([address, data]) => {
          const netProfit = data.totalPayout - data.totalWagered;
          const winRate = data.betsCount > 0 ? Math.round((data.winsCount / data.betsCount) * 100) : 0;
          return {
            address,
            totalWagered: data.totalWagered,
            totalPayout: data.totalPayout,
            netProfit,
            betsCount: data.betsCount,
            winsCount: data.winsCount,
            winRate,
          };
        })
        .sort((a, b) => b.netProfit - a.netProfit);
    },
    staleTime: 1000 * 30,
  });
}
