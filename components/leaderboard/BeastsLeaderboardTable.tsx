'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Beast } from '@/lib/types';
import Img from '@/components/ui/Img';

interface BeastsLeaderboardTableProps {
  beasts: Beast[];
}

export function BeastsLeaderboardTable({ beasts }: BeastsLeaderboardTableProps) {
  return (
    <div className="border border-divider overflow-x-auto bg-background">
      <table className="w-full text-left font-mono text-xs">
        <thead className="bg-surface-container-low border-b border-divider uppercase text-secondary">
          <tr>
            <th className="p-4">RANK</th>
            <th className="p-4">COMBATANT</th>
            <th className="p-4">OWNER</th>
            <th className="p-4">RECORD</th>
            <th className="p-4">WIN RATE</th>
            <th className="p-4">MARKET PULSE</th>
            <th className="p-4 text-right">ACTION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-divider">
          {beasts.map((beast, idx) => {
            const total = beast.record.wins + beast.record.losses;
            const rate = total > 0 ? Math.round((beast.record.wins / total) * 100) : 0;

            return (
              <tr key={beast.id} className="lb-row hover:bg-surface-container-low/50 transition-colors">
                <td className="p-4 font-bold text-primary">#{idx + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 border border-divider overflow-hidden bg-zinc-900">
                      <Img src={beast.avatarUrl} alt={beast.name} fill className="object-cover" />
                    </div>
                    <span className="font-bold uppercase text-primary">{beast.name}</span>
                  </div>
                </td>
                <td className="p-4 text-secondary truncate max-w-[120px]">{beast.ownerAddress}</td>
                <td className="p-4 font-bold">{beast.record.wins}W - {beast.record.losses}L</td>
                <td className="p-4 font-bold text-primary">{rate}%</td>
                <td className="p-4">{beast.boundAsset || 'UNBOUND'}</td>
                <td className="p-4 text-right">
                  <Link href={`/beast/${beast.id}`} className="text-primary underline font-bold hover:text-secondary">
                    PROFILE
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
