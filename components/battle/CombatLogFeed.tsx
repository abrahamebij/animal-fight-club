'use client';

import React, { useRef, useEffect } from 'react';
import { FiTerminal, FiClock, FiShield } from 'react-icons/fi';
import { Battle, CombatTurn } from '@/lib/types';
import gsap from 'gsap';

interface CombatLogFeedProps {
  battle: Battle;
  isOwnerOfFighter: boolean;
  isSimulating: boolean;
  onExecuteCombat: () => void;
  className?: string;
}

export function CombatLogFeed({
  battle,
  isOwnerOfFighter,
  isSimulating,
  onExecuteCombat,
  className = 'fighter-panel lg:col-span-4',
}: CombatLogFeedProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const prevLogLength = useRef(battle.combatLog.length);

  const isLive = battle.status === 'live';
  const isPending = battle.status === 'pending';
  const isCompleted = battle.status === 'completed';

  const lastTurn: CombatTurn | undefined = battle.combatLog[battle.combatLog.length - 1];

  useEffect(() => {
    const currentLength = battle.combatLog.length;
    if (currentLength > prevLogLength.current && logRef.current) {
      const entries = logRef.current.querySelectorAll('.log-entry');
      const newEntries = Array.from(entries).slice(prevLogLength.current);
      gsap.from(newEntries, {
        opacity: 0,
        y: -12,
        duration: 0.35,
        stagger: 0.06,
        ease: 'power2.out',
      });
    }
    prevLogLength.current = currentLength;
  }, [battle.combatLog.length]);

  return (
    <div className={`${className} border border-divider p-6 bg-primary text-background flex flex-col justify-between gap-6`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-background/20 pb-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-background/80">
            <FiTerminal className="w-4 h-4 text-secondary" />
            <span>LLM COMBAT REASONER</span>
          </div>
          <span className="text-background font-bold">
            {isLive ? `ROUND ${battle.combatLog.length}` : isPending ? 'WINDOW OPEN' : 'CONCLUDED'}
          </span>
        </div>

        {/* Combat narrative output */}
        <div className="space-y-4 min-h-[220px] flex flex-col justify-between">
          {lastTurn ? (
            <div className="space-y-3 bg-background/5 p-4 border border-background/10 font-mono text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-background">
                  TURN {lastTurn.turnNumber}: {lastTurn.actionName}
                </span>
                <span className="text-danger font-bold">-{lastTurn.damageDealt} HP</span>
              </div>
              <p className="text-background text-sm leading-relaxed font-sans">
                {lastTurn.combatNarrative}
              </p>
              <div className="text-background/60 text-[11px] border-t border-background/10 pt-2">
                <span className="text-background/90 font-bold">AGENT REASONING: </span>
                {lastTurn.reasoning}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 font-mono text-xs text-background/60 space-y-2">
              <FiClock className="w-8 h-8 mx-auto text-background/80" />
              <p className="text-sm font-bold text-background">Awaiting Window Expiry</p>
              <p>Combat will execute turn-by-turn with LLM reasoning when betting window closes.</p>
            </div>
          )}

          {/* Combat Trigger / Status */}
          {isCompleted ? (
            <div className="bg-background text-primary p-3 text-center font-headline font-extrabold text-sm uppercase tracking-wider border border-background">
              DUEL CONCLUDED - VICTOR: {battle.winner === 'beastA' ? battle.beastA.name : battle.beastB.name}
            </div>
          ) : isOwnerOfFighter ? (
            <button
              onClick={onExecuteCombat}
              disabled={isSimulating}
              className="w-full py-3 bg-background text-primary font-headline font-bold text-xs uppercase tracking-wider hover:bg-neutral transition-colors border border-background disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FiTerminal className="w-4 h-4 text-primary" />
              <span>{isSimulating ? 'SIMULATING COMBAT ROUNDS...' : 'TRIGGER AGENTIC COMBAT ENGINE'}</span>
            </button>
          ) : (
            <div className="bg-background/10 border border-background/20 p-3 text-center font-mono text-xs text-background/80 flex items-center justify-center gap-2">
              <FiShield className="w-3.5 h-3.5 text-background/80 flex-shrink-0" />
              <span>AWAITING COMBATANT OWNER TRIGGER</span>
            </div>
          )}
        </div>
      </div>

      {/* Battle Log History list */}
      <div className="border-t border-background/20 pt-3 space-y-2">
        <div className="font-mono text-[11px] text-background/40 uppercase">
          COMBAT EVENT LOG ({battle.combatLog.length} TURNS)
        </div>
        <div ref={logRef} className="max-h-36 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-2">
          {battle.combatLog.map((turn) => (
            <div key={turn.turnNumber} className="log-entry flex justify-between text-background/70 border-b border-background/5 pb-1">
              <span>
                T{turn.turnNumber} [{turn.actor === 'beastA' ? battle.beastA.name.split(' ')[0] : battle.beastB.name.split(' ')[0]}]: {turn.actionName}
              </span>
              <span className="text-danger font-bold">-{turn.damageDealt} HP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

