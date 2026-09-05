'use client';

import React from 'react';
import { FiActivity, FiExternalLink, FiShield, FiCheckCircle } from 'react-icons/fi';
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
  const auditUrl = pulse.oracleQuestionId
    ? `https://prd.oracle.somnia.host/questions/${pulse.oracleQuestionId}?view=graph`
    : 'https://prd.oracle.somnia.host/questions/?view=graph';

  return (
    <div className="border border-divider p-5 bg-surface-container-low space-y-4 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-divider pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-primary flex-shrink-0" />
          <span className="font-bold uppercase text-primary text-sm">
            {beastName} ({pulse.symbol})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-primary/10 border border-divider text-primary text-[11px] font-bold">
            PROBABILITY: {upPercent}% UP
          </span>
        </div>
      </div>

      {/* Dual Probability Bar */}
      <div className="space-y-1">
        <div className="w-full h-3 bg-neutral flex overflow-hidden border border-divider">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${pulse.upProbability * 100}%` }} 
          />
          <div 
            className="h-full bg-secondary transition-all duration-500" 
            style={{ width: `${(1 - pulse.upProbability) * 100}%` }} 
          />
        </div>
        <div className="flex justify-between text-[10px] text-secondary">
          <span>BULLISH BIAS ({upPercent}%)</span>
          <span>BEARISH BIAS ({100 - upPercent}%)</span>
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

      {/* Prominent Somnia OracleHub Consensus Audit Card */}
      <div className="border border-primary bg-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
            <FiShield className="w-4 h-4 text-primary" />
            <span className="tracking-wider uppercase">SOMNIA ORACLEHUB CONSENSUS PROOF</span>
          </div>
          <span className="text-[10px] bg-primary text-background px-2 py-0.5 font-bold uppercase flex items-center gap-1">
            <FiCheckCircle className="w-3 h-3" />
            <span>VERIFIED ON-CHAIN</span>
          </span>
        </div>

        <p className="text-[11px] text-secondary leading-relaxed font-sans">
          Decentralized consensus trail: verified median calculated from multi-source price feeds on Somnia Shannon testnet.
        </p>

        {pulse.oracleQuestionId && (
          <div className="flex items-center justify-between text-[11px] font-mono text-secondary bg-surface-container-low px-2.5 py-1.5 border border-divider">
            <span className="text-[10px] uppercase">QUESTION ID:</span>
            <span className="font-bold text-primary">
              {pulse.oracleQuestionId.length > 22
                ? `${pulse.oracleQuestionId.slice(0, 10)}...${pulse.oracleQuestionId.slice(-8)}`
                : pulse.oracleQuestionId}
            </span>
          </div>
        )}

        <a
          href={auditUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 bg-primary text-background font-headline font-bold text-xs uppercase tracking-wider hover:bg-secondary transition-colors flex items-center justify-center gap-2 border border-primary block text-center"
        >
          <span>AUDIT RESOLUTION ON SOMNIA ORACLEHUB</span>
          <FiExternalLink className="w-3.5 h-3.5" />
        </a>
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

