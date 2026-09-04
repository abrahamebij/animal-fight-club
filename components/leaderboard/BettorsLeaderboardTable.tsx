'use client';

import React from 'react';
import { BettorLeaderboardEntry } from '@/hooks/useLeaderboard';

interface BettorsLeaderboardTableProps {
  bettors: BettorLeaderboardEntry[];
}

export function BettorsLeaderboardTable({ bettors }: BettorsLeaderboardTableProps) {
  return (
    <div className="border border-divider overflow-x-auto bg-background">
      <table className="w-full text-left font-mono text-xs">
        <thead className="bg-surface-container-low border-b border-divider uppercase text-secondary">
          <tr>
            <th className="p-4">RANK</th>
            <th className="p-4">SPECTATOR WALLET</th>
            <th className="p-4">TOTAL WAGERED</th>
            <th className="p-4">TOTAL PAYOUT</th>
            <th className="p-4">NET PROFIT</th>
            <th className="p-4">BETS COUNT</th>
            <th className="p-4">WIN RATE</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {bettors.map((bettor, idx) => (
            <tr key={bettor.address} className="lb-row hover:bg-surface-container-low/50 transition-colors">
              <td className="p-4 font-bold text-primary">#{idx + 1}</td>
              <td className="p-4 text-secondary truncate max-w-[160px]">{bettor.address}</td>
              <td className="p-4">{bettor.totalWagered} STT</td>
              <td className="p-4 font-bold text-primary">{bettor.totalPayout} STT</td>
              <td className={`p-4 font-bold ${bettor.netProfit >= 0 ? 'text-primary' : 'text-danger'}`}>
                {bettor.netProfit >= 0 ? `+${bettor.netProfit}` : bettor.netProfit} STT
              </td>
              <td className="p-4">{bettor.betsCount}</td>
              <td className="p-4 font-bold">{bettor.winRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
