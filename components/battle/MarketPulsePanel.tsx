'use client';

import React from 'react';
import { FiActivity, FiExternalLink } from 'react-icons/fi';
import { Battle } from '@/lib/types';

interface MarketPulsePanelProps {
  battle: Battle;
}

export function MarketPulsePanel({ battle }: MarketPulsePanelProps) {
  return (
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
        {battle.marketPulseA ? (
          <div className="border border-divider p-4 bg-surface-container-low space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold uppercase text-primary">
                {battle.beastA.name} ({battle.marketPulseA.symbol})
              </div>
              <span className="text-primary font-bold">
                UP PROBABILITY: {Math.round(battle.marketPulseA.upProbability * 100)}%
              </span>
            </div>

            <div className="w-full h-3 bg-neutral flex overflow-hidden border border-divider">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${battle.marketPulseA.upProbability * 100}%` }} 
              />
              <div 
                className="h-full bg-secondary" 
                style={{ width: `${(1 - battle.marketPulseA.upProbability) * 100}%` }} 
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-secondary">
              <span>
                BEST BID: {battle.marketPulseA.bestBid} | BEST ASK: {battle.marketPulseA.bestAsk}
              </span>
              {battle.marketPulseA.oracleQuestionId && (
                <a
                  href={`https://prd.oracle.somnia.host/questions/?view=graph`}
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
        ) : (
          <div className="border border-dashed border-divider p-4 text-center font-mono text-xs text-secondary">
            {battle.beastA.name} is UNBOUND — No DreamDEX Market Pulse applied.
          </div>
        )}

        {/* Asset B Pulse */}
        {battle.marketPulseB ? (
          <div className="border border-divider p-4 bg-surface-container-low space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold uppercase text-primary">
                {battle.beastB.name} ({battle.marketPulseB.symbol})
              </div>
              <span className="text-primary font-bold">
                UP PROBABILITY: {Math.round(battle.marketPulseB.upProbability * 100)}%
              </span>
            </div>

            <div className="w-full h-3 bg-neutral flex overflow-hidden border border-divider">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${battle.marketPulseB.upProbability * 100}%` }} 
              />
              <div 
                className="h-full bg-secondary" 
                style={{ width: `${(1 - battle.marketPulseB.upProbability) * 100}%` }} 
              />
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-divider p-4 text-center font-mono text-xs text-secondary">
            {battle.beastB.name} is UNBOUND — No DreamDEX Market Pulse applied.
          </div>
        )}
      </div>
    </div>
  );
}

