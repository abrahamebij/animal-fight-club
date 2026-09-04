'use client';

import React from 'react';
import { FiTerminal, FiTrendingUp, FiShield } from 'react-icons/fi';

export function FeaturesSection() {
  const features = [
    {
      icon: FiTerminal,
      title: 'AGENTIC AI COMBAT REASONER',
      desc: 'Battles are resolved turn-by-turn with LLM tactical reasoning analyzing stats, perks, and health thresholds.',
    },
    {
      icon: FiTrendingUp,
      title: 'DREAMDEX MARKET PULSE',
      desc: 'Bind beasts to BTC, ETH, or SOM prediction events to receive dynamic stat multipliers in live arena duels.',
    },
    {
      icon: FiShield,
      title: 'ON-CHAIN SOMNIA ESCROW',
      desc: 'Spectator wagers are secured in smart contracts with transparent pari-mutuel payouts distributed on-chain.',
    },
  ];

  return (
    <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 py-16 border-t border-divider">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="protocol-step border border-divider p-8 bg-background space-y-4">
            <f.icon className="w-8 h-8 text-primary" />
            <h3 className="font-headline font-extrabold text-2xl uppercase tracking-tight text-primary">
              {f.title}
            </h3>
            <p className="font-sans text-sm text-secondary leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
