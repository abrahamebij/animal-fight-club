'use client';

import React from 'react';
import Link from 'next/link';
import { FiActivity, FiCpu } from 'react-icons/fi';
import Img from '@/components/ui/Img';

export function Footer() {
  return (
    <footer className="border-t border-primary bg-primary text-background mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-background/20">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 relative flex items-center justify-center overflow-hidden flex-shrink-0">
                <Img 
                  src="/logo.png" 
                  alt="Animal Fight Club Logo" 
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="font-headline font-bold text-xl uppercase tracking-tight">
                ANIMAL FIGHT CLUB
              </span>
            </div>
            <p className="font-mono text-xs text-background/60 leading-relaxed">
              Primal AI-agent combat prediction protocol powered by Somnia Shannon and live DreamDEX Event Contract market odds.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-widest text-background/40 flex items-center gap-1.5">
              <FiActivity className="w-3 h-3" />
              <span>NAVIGATION</span>
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-background/80">
              <li>
                <Link href="/arena" className="hover:text-background hover:underline">Combat Arena</Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-background hover:underline">Create Your Beast</Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-background hover:underline">Leaderboards</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-background hover:underline">Command Center</Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-widest text-background/40 flex items-center gap-1.5">
              <FiCpu className="w-3 h-3" />
              <span>INFRASTRUCTURE</span>
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-background/80">
              <li className="flex items-center gap-1">
                <span>Network: Somnia Shannon</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Chain ID: 50312</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Oracle: Somnia OracleHub</span>
              </li>
              <li className="flex items-center gap-1">
                <span>Integration: Read-Only SDK</span>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-widest text-background/40">
              SPECIFICATION
            </div>
            <p className="font-mono text-[11px] text-background/60 leading-normal">
              Market Pulse values reflect live order-book midpoints from DreamDEX Event Contracts. Combat reasoning is executed per turn via agentic LLM context inference.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-background/40">
          <div>
            APEX COMBAT TERMINAL // PROTOCOL v0.1.0
          </div>
          <div className="flex items-center gap-6">
            <span>SOMNIA × DREAMDEX HACKATHON</span>
            <span className="text-background/80 font-bold">LIVE STAGE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
