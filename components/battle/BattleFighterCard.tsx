'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiTrendingUp } from 'react-icons/fi';
import { Beast, MarketPulse } from '@/lib/types';
import gsap from 'gsap';

interface BattleFighterCardProps {
  label: string;
  role: 'ALPHA' | 'BRAVO';
  beast: Beast;
  hp: number;
  marketPulse?: MarketPulse | null;
}

export function BattleFighterCard({
  label,
  role,
  beast,
  hp,
  marketPulse,
}: BattleFighterCardProps) {
  const hpBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hpBarRef.current) {
      gsap.to(hpBarRef.current, {
        width: ${Math.max(0, hp)}%,
        duration: 0.7,
        ease: 'power2.out',
      });
      if (hp < 100) {
        gsap.to(hpBarRef.current, {
          opacity: 0.5,
          duration: 0.08,
          yoyo: true,
          repeat: 3,
        });
      }
    }
  }, [hp]);

  return (
    <div className=" fighter-panel lg:col-span-4 border border-divider p-6 bg-background flex flex-col justify-between gap-6\>
 <div className=\space-y-4\>
 <div className=\flex items-center justify-between border-b border-divider pb-2\>
 <span className=\font-mono text-xs text-secondary font-bold\>
 {label} ({role})
 </span>
 <span className=\font-mono text-xs text-secondary truncate max-w-[140px]\>
 {beast.ownerAddress}
 </span>
 </div>

 <div className=\relative aspect-square w-full border border-divider overflow-hidden bg-zinc-900\>
 <Image
 src={beast.avatarUrl}
 alt={beast.name}
 fill
 className=\object-cover\
 priority
 />
 {beast.boundAsset && (
 <div className=\absolute top-2 right-2 bg-primary text-background font-mono text-[11px] font-bold px-2.5 py-1\>
 {beast.boundAsset} BOUND
 </div>
 )}
 </div>

 <div>
 <h2 className=\font-headline font-extrabold text-3xl uppercase tracking-tight text-primary truncate\>
 {beast.name}
 </h2>
 <div className=\font-mono text-xs text-secondary\>
 RECORD: {beast.record.wins}W - {beast.record.losses}L
 </div>
 </div>

 {/* Health Integrity Bar */}
 <div className=\space-y-1.5 font-mono text-xs\>
 <div className=\flex justify-between font-bold\>
 <span>HEALTH INTEGRITY</span>
 <span className={hp <= 25 ? 'text-danger font-bold' : 'text-primary'}>
 {Math.max(0, hp)} / 100 HP
 </span>
 </div>
 <div className=\w-full h-3.5 bg-neutral border border-divider p-0.5\>
 <div
 ref={hpBarRef}
 className={h-full }
 style={{ width: ${Math.max(0, hp)}% }}
 />
 </div>
 </div>

 {/* Stats Grid */}
 <div className=\grid grid-cols-4 gap-1 text-center font-mono text-xs border-t border-divider pt-3\>
 <div className=\bg-surface-container-low p-1.5\>
 <div className=\text-[10px] text-secondary\>PWR</div>
 <div className=\font-bold\>{beast.stats.power}</div>
 </div>
 <div className=\bg-surface-container-low p-1.5\>
 <div className=\text-[10px] text-secondary\>DEF</div>
 <div className=\font-bold\>{beast.stats.defense}</div>
 </div>
 <div className=\bg-surface-container-low p-1.5\>
 <div className=\text-[10px] text-secondary\>SPD</div>
 <div className=\font-bold\>{beast.stats.speed}</div>
 </div>
 <div className=\bg-surface-container-low p-1.5\>
 <div className=\text-[10px] text-secondary\>SPC</div>
 <div className=\font-bold\>{beast.stats.special}</div>
 </div>
 </div>

 {/* Market Pulse Modifier Tag */}
 {marketPulse?.modifier && (
 <div className=\border border-divider bg-surface-container-low p-3 font-mono text-xs space-y-1\>
 <div className=\flex items-center gap-1.5 text-primary font-bold uppercase\>
 <FiTrendingUp className=\w-3.5 h-3.5\ />
 <span>LOCKED MARKET PULSE:</span>
 </div>
 <div className=\text-primary font-bold\>
 {marketPulse.modifier.description}
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
