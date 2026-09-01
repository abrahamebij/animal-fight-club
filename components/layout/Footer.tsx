'use client';

import React from 'react';
import Link from 'next/link';
import { FiActivity, FiCpu, FiExternalLink, FiShield } from 'react-icons/fi';

export function Footer() {
  return (
    <footer className="border-t border-[#0A0A0B] bg-[#0A0A0B] text-[#FAFAF8] mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#FAFAF8]/20">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#DC2626] flex items-center justify-center text-[#FAFAF8]">
                <FiShield className="w-3.5 h-3.5" />
              </div>
              <span className="font-headline font-bold text-xl uppercase tracking-tight">
                ANIMAL FIGHT CLUB
              </span>
            </div>
            <p className="font-mono text-xs text-[#FAFAF8]/60 leading-relaxed">
              Primal AI-agent combat prediction protocol powered by Somnia Shannon and live DreamDEX Event Contract market odds.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-widest text-[#FAFAF8]/40 flex items-center gap-1.5">
              <FiActivity className="w-3 h-3" />
              <span>NAVIGATION</span>
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-[#FAFAF8]/80">
              <li>
                <Link href="/arena" className="hover:text-[#FAFAF8] hover:underline">Combat Arena</Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-[#FAFAF8] hover:underline">Create Your Beast</Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-[#FAFAF8] hover:underline">Leaderboards</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#FAFAF8] hover:underline">Command Center</Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="font-mono text-xs uppercase tracking-widest text-[#FAFAF8]/40 flex items-center gap-1.5">
              <FiCpu className="w-3 h-3" />
              <span>INFRASTRUCTURE</span>
            </div>
            <ul className="space-y-1.5 font-mono text-xs text-[#FAFAF8]/80">
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
            <div className="font-mono text-xs uppercase tracking-widest text-[#FAFAF8]/40">
              SPECIFICATION
            </div>
            <p className="font-mono text-[11px] text-[#FAFAF8]/60 leading-normal">
              Market Pulse values reflect live order-book midpoints from DreamDEX Event Contracts. Combat reasoning is executed per turn via agentic LLM context inference.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#FAFAF8]/40">
          <div>
            APEX COMBAT TERMINAL // PROTOCOL v0.1.0
          </div>
          <div className="flex items-center gap-6">
            <span>SOMNIA × DREAMDEX HACKATHON</span>
            <span className="text-[#DC2626] font-bold">LIVE STAGE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
