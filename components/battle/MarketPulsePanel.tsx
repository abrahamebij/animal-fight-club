'use client';

import React from 'react';
import { FiActivity, FiShield, FiCheckCircle } from 'react-icons/fi';
import { Battle, MarketPulse } from '@/lib/types';

interface MarketPulsePanelProps {
  battle: Battle;
}

function MarketPulseCard({
  beastName,
  pulse,
}: {
  beastName: string;
  pulse: MarketPulse;
}) {
  const upPercent = Math.round(pulse.upProbability * 100);
  const downPercent = 100 - upPercent;
  const isBullish = upPercent >= 50;

  return (
    <div className="border border-divider p-5 bg-surface-container-low space-y-4 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-divider pb-2.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 flex-shrink-0 ${isBullish ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span className="font-bold uppercase text-primary text-sm">
            {beastName} ({pulse.symbol})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-surface-container-high border border-divider text-[11px] font-bold">
            PROBABILITY:{' '}
            <span>
              {upPercent}% UP
            </span>
          </span>
        </div>
      </div>

      {/* Dual Probability Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2.5 bg-neutral flex overflow-hidden border border-divider">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500" 
            style={{ width: `${pulse.upProbability * 100}%` }} 
          />
          <div 
            className="h-full bg-rose-500 transition-all duration-500" 
            style={{ width: `${(1 - pulse.upProbability) * 100}%` }} 
          />
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
            BULLISH BIAS ({upPercent}%)
          </span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">
            BEARISH BIAS ({downPercent}%)
          </span>
        </div>
      </div>

      {/* Orderbook Depth & Modifier Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] pt-1 border-t border-divider">
        <div>
          <span className="text-secondary block text-[10px] uppercase">BEST BID</span>
          <span className="font-bold text-primary">{pulse.bestBid ?? '0.50'}</span>
        </div>
        <div>
          <span className="text-secondary block text-[10px] uppercase">BEST ASK</span>
          <span className="font-bold text-primary">{pulse.bestAsk ?? '0.50'}</span>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-secondary block text-[10px] uppercase">DYNAMIC MODIFIER</span>
          <span className="font-bold text-primary truncate block" title={pulse.modifier.description}>
            {pulse.modifier.description}
          </span>
        </div>
      </div>
    </div>
  );
}

function UnboundCard({ beastName }: { beastName: string }) {
  return (
    <div className="border border-dashed border-divider p-6 text-center font-mono text-xs text-secondary space-y-2 bg-surface-container-low">
      <div className="font-bold text-primary uppercase">{beastName} is UNBOUND</div>
      <p className="font-sans text-xs max-w-md mx-auto leading-relaxed">
        No financial event contract bound to this combatant. Combat resolves strictly on innate genetic attributes without decentralized DreamDEX market modifiers.
      </p>
    </div>
  );
}

export function MarketPulsePanel({ battle }: MarketPulsePanelProps) {
  return (
    <div className="bottom-panel lg:col-span-7 border border-divider p-6 bg-background space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-divider pb-3 gap-2">
        <div className="flex items-center gap-2">
          <FiActivity className="w-5 h-5 text-primary" />
          <h3 className="font-headline font-bold text-2xl uppercase tracking-tight">
            DREAMDEX MARKET PULSE INTEGRATION
          </h3>
        </div>
        <span className="font-mono text-xs px-2.5 py-0.5 bg-primary text-background font-bold flex items-center gap-1.5 w-fit">
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>ORACLEHUB AUDITABLE</span>
        </span>
      </div>

      <div className="p-3.5 border border-divider bg-surface-container-low font-mono text-xs text-secondary space-y-1.5">
        <div className="text-primary font-bold uppercase flex items-center gap-1.5">
          <FiShield className="w-3.5 h-3.5 text-primary" />
          <span>DECENTRALIZED CONSENSUS VERIFICATION</span>
        </div>
        <p className="font-sans text-xs leading-relaxed">
          Combat probabilities and stat modifiers are not hardcoded or simulated. Live orderbook telemetry is pulled via <strong className="text-primary">@somnia-chain/markets-sdk</strong> directly from DreamDEX Event Contracts, with resolution questions registered on <strong className="text-primary">Somnia OracleHub</strong>.
        </p>
      </div>

      <div className="space-y-4">
        {/* Asset A Pulse */}
        {battle.marketPulseA ? (
          <MarketPulseCard beastName={battle.beastA.name} pulse={battle.marketPulseA} />
        ) : (
          <UnboundCard beastName={battle.beastA.name} />
        )}

        {/* Asset B Pulse */}
        {battle.marketPulseB ? (
          <MarketPulseCard beastName={battle.beastB.name} pulse={battle.marketPulseB} />
        ) : (
          <UnboundCard beastName={battle.beastB.name} />
        )}
      </div>
    </div>
  );
}

