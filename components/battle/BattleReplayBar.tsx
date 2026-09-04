'use client';

import React from 'react';
import { FiPlay, FiSquare, FiRotateCcw, FiChevronsRight } from 'react-icons/fi';

interface BattleReplayBarProps {
  isReplayActive: boolean;
  isReplaying: boolean;
  replayIndex: number;
  totalTurns: number;
  replaySpeed: number;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function BattleReplayBar({
  isReplayActive,
  isReplaying,
  replayIndex,
  totalTurns,
  replaySpeed,
  onStart,
  onStop,
  onReset,
  onSpeedChange,
}: BattleReplayBarProps) {
  if (totalTurns <= 0) return null;

  return (
    <div className="border border-divider bg-background px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
      {/* Left: progress track */}
      <div className="flex items-center gap-3">
        <span className="text-secondary uppercase font-bold text-[11px]">REPLAY</span>
        <div className="w-32 sm:w-44 h-2 bg-neutral border border-divider overflow-hidden">
          <div
            className="h-full bg-primary transition-none"
            style={{
              width: isReplayActive ? `${((replayIndex + 1) / totalTurns) * 100}%` : '0%',
            }}
          />
        </div>
        <span className="text-secondary text-[11px]">
          {isReplayActive ? `${replayIndex + 1} / ${totalTurns}` : `${totalTurns} TURNS`}
        </span>
      </div>

      {/* Centre: Play / Reset */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="p-1.5 border border-divider text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer"
          title="Reset"
        >
          <FiRotateCcw className="w-3.5 h-3.5" />
        </button>

        {isReplaying ? (
          <button
            onClick={onStop}
            className="px-3.5 py-1.5 bg-primary text-background font-headline font-bold text-[10px] uppercase tracking-wider hover:bg-secondary border border-primary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FiSquare className="w-3 h-3" />
            <span>STOP</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="px-3.5 py-1.5 bg-primary text-background font-headline font-bold text-[10px] uppercase tracking-wider hover:bg-secondary border border-primary transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FiPlay className="w-3 h-3" />
            <span>{isReplayActive ? 'RESTART' : 'REPLAY DUEL'}</span>
          </button>
        )}
      </div>

      {/* Right: speed */}
      <div className="flex items-center gap-1.5">
        <span className="text-secondary uppercase text-[11px]">SPEED</span>
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-0.5 border text-[10px] font-bold uppercase transition-colors cursor-pointer ${
              replaySpeed === s
                ? 'bg-primary text-background border-primary'
                : 'border-divider text-secondary hover:border-primary hover:text-primary'
            }`}
          >
            {s === 3 ? <FiChevronsRight className="w-3 h-3 inline" /> : `${s}×`}
          </button>
        ))}
      </div>
    </div>
  );
}
