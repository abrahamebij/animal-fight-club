'use client';

import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { FiTerminal, FiShield, FiZap } from 'react-icons/fi';
import { Battle, CombatTurn } from '@/lib/types';
import gsap from 'gsap';

// ─── Fighter SVG Figure ───────────────────────────────────────────────────────
function FighterFigure({
  avatarUrl,
  clipId,
  flipped = false,
}: {
  avatarUrl: string;
  clipId: string;
  flipped?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 100 200"
      className="w-full h-full"
      style={{ transform: flipped ? 'scaleX(-1)' : 'none', overflow: 'visible' }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="16" y="3" width="68" height="68" rx="5" />
        </clipPath>
      </defs>

      {/* Avatar portrait */}
      <image
        href={avatarUrl}
        x="16" y="3" width="68" height="68"
        clipPath={`url(#${clipId})`}
        preserveAspectRatio="xMidYMid slice"
      />
      {/* Portrait frame */}
      <rect x="16" y="3" width="68" height="68" rx="5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />

      {/* Neck */}
      <line x1="50" y1="71" x2="50" y2="87" stroke="#d4d4d4" strokeWidth="8" strokeLinecap="round" />

      {/* Torso */}
      <line x1="50" y1="87" x2="50" y2="128" stroke="#d4d4d4" strokeWidth="10" strokeLinecap="round" />

      {/* Shoulder bar */}
      <line x1="20" y1="93" x2="80" y2="93" stroke="#d4d4d4" strokeWidth="6.5" strokeLinecap="round" />

      {/* Right arm — raised boxing guard (front arm) */}
      <line x1="80" y1="93" x2="90" y2="114" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round" />
      <line x1="90" y1="114" x2="97" y2="96"  stroke="#d4d4d4" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="98" cy="92" r="5.5" fill="#d4d4d4" />

      {/* Left arm — rear guard */}
      <line x1="20" y1="93" x2="10" y2="117" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round" />
      <line x1="10" y1="117" x2="5"  y2="103" stroke="#d4d4d4" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="4" cy="99" r="5" fill="#d4d4d4" />

      {/* Hip line */}
      <line x1="33" y1="128" x2="67" y2="128" stroke="#d4d4d4" strokeWidth="7" strokeLinecap="round" />

      {/* Left leg */}
      <line x1="33" y1="128" x2="22" y2="166" stroke="#d4d4d4" strokeWidth="7.5" strokeLinecap="round" />
      <line x1="22" y1="166" x2="24" y2="186" stroke="#d4d4d4" strokeWidth="7"   strokeLinecap="round" />
      <line x1="24" y1="186" x2="8"  y2="193" stroke="#d4d4d4" strokeWidth="5.5" strokeLinecap="round" />

      {/* Right leg — front stance */}
      <line x1="67" y1="128" x2="78" y2="164" stroke="#d4d4d4" strokeWidth="7.5" strokeLinecap="round" />
      <line x1="78" y1="164" x2="76" y2="184" stroke="#d4d4d4" strokeWidth="7"   strokeLinecap="round" />
      <line x1="76" y1="184" x2="92" y2="191" stroke="#d4d4d4" strokeWidth="5.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── HP colour helper ─────────────────────────────────────────────────────────
function hpColor(hp: number): string {
  if (hp > 60) return '#22c55e';
  if (hp > 30) return '#eab308';
  return '#ef4444';
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface BattleArenaRingProps {
  battle: Battle;
  hpA: number;
  hpB: number;
  lastTurn?: CombatTurn;
  isSimulating: boolean;
  isOwnerOfFighter: boolean;
  onExecuteCombat: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function BattleArenaRing({
  battle,
  hpA,
  hpB,
  lastTurn,
  isSimulating,
  isOwnerOfFighter,
  onExecuteCombat,
}: BattleArenaRingProps) {
  const figARef      = useRef<HTMLDivElement>(null);
  const figBRef      = useRef<HTMLDivElement>(null);
  const hitFlashARef = useRef<HTMLDivElement>(null);
  const hitFlashBRef = useRef<HTMLDivElement>(null);
  const hpBarARef    = useRef<HTMLDivElement>(null);
  const hpBarBRef    = useRef<HTMLDivElement>(null);
  const idleTlRef    = useRef<gsap.core.Timeline | null>(null);
  const idleTlBRef   = useRef<gsap.core.Timeline | null>(null);
  const prevLogLen   = useRef(battle.combatLog.length);
  const aDeadRef     = useRef(false);
  const bDeadRef     = useRef(false);

  const isLive      = battle.status === 'live';
  const isCompleted = battle.status === 'completed';

  // Unique SVG clip IDs per battle
  const clipIdA = `clip-${battle.id}-a`;
  const clipIdB = `clip-${battle.id}-b`;

  // ── Mount: walk-in + idle breathing loop ──────────────────────────────────
  useLayoutEffect(() => {
    if (!figARef.current || !figBRef.current) return;

    const walkIn = gsap.timeline({
      onComplete: () => {
        if (!figARef.current || !figBRef.current) return;
        idleTlRef.current = gsap.timeline({ repeat: -1 });
        idleTlRef.current
          .to(figARef.current, { y: -7, duration: 1.3, ease: 'sine.inOut' })
          .to(figARef.current, { y: 0,  duration: 1.3, ease: 'sine.inOut' });

        idleTlBRef.current = gsap.timeline({ repeat: -1, delay: 0.45 });
        idleTlBRef.current
          .to(figBRef.current, { y: -7, duration: 1.5, ease: 'sine.inOut' })
          .to(figBRef.current, { y: 0,  duration: 1.5, ease: 'sine.inOut' });
      },
    });

    walkIn
      .from(figARef.current, { x: -160, opacity: 0, duration: 0.75, ease: 'power3.out' })
      .from(figBRef.current, { x: 160,  opacity: 0, duration: 0.75, ease: 'power3.out' }, '-=0.45');

    return () => {
      walkIn.kill();
      idleTlRef.current?.kill();
      idleTlBRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── HP bar color + width animations ───────────────────────────────────────
  useEffect(() => {
    if (hpBarARef.current) {
      gsap.to(hpBarARef.current, {
        width: `${Math.max(0, hpA)}%`,
        backgroundColor: hpColor(hpA),
        duration: 0.65,
        ease: 'power2.out',
      });
    }
  }, [hpA]);

  useEffect(() => {
    if (hpBarBRef.current) {
      gsap.to(hpBarBRef.current, {
        width: `${Math.max(0, hpB)}%`,
        backgroundColor: hpColor(hpB),
        duration: 0.65,
        ease: 'power2.out',
      });
    }
  }, [hpB]);

  // ── Attack animation on each new combat turn ───────────────────────────────
  useEffect(() => {
    const curLen = battle.combatLog.length;
    if (curLen <= prevLogLen.current || !lastTurn) {
      prevLogLen.current = curLen;
      return;
    }
    prevLogLen.current = curLen;

    const isAAttacking = lastTurn.actor === 'beastA';
    const attackerEl   = isAAttacking ? figARef.current : figBRef.current;
    const defenderEl   = isAAttacking ? figBRef.current : figARef.current;
    const hitFlashEl   = isAAttacking ? hitFlashBRef.current : hitFlashARef.current;
    const lungeDir     = isAAttacking ? 58 : -58;
    const shakeAmt     = isAAttacking ? 10 : -10;

    if (!attackerEl || !defenderEl) return;

    // Pause idle bobs during combat move
    idleTlRef.current?.pause();
    idleTlBRef.current?.pause();

    const atk = gsap.timeline({
      onComplete: () => {
        if (!aDeadRef.current) idleTlRef.current?.resume();
        if (!bDeadRef.current) idleTlBRef.current?.resume();
      },
    });

    // Attacker lunges toward opponent then recoils
    atk.to(attackerEl, { x: lungeDir, duration: 0.17, ease: 'power2.in' })
       .to(attackerEl, { x: 0,        duration: 0.33, ease: 'power2.out' });

    // Critical: brief scale-up at the lunge apex
    if (lastTurn.isCritical) {
      atk.to(attackerEl, { scale: 1.14, duration: 0.1, ease: 'power2.out' }, 0.1)
         .to(attackerEl, { scale: 1,    duration: 0.22, ease: 'power2.in' }, 0.2);
    }

    // Defender shakes on impact
    atk.to(defenderEl, { x: shakeAmt * -1, duration: 0.06 }, 0.14)
       .to(defenderEl, { x: shakeAmt,       duration: 0.06 })
       .to(defenderEl, { x: shakeAmt * -0.5, duration: 0.05 })
       .to(defenderEl, { x: 0,               duration: 0.06 });

    // Hit-flash on defender
    if (hitFlashEl) {
      atk.to(hitFlashEl, { opacity: 0.8, duration: 0.04 }, 0.14)
         .to(hitFlashEl, { opacity: 0,   duration: 0.28, ease: 'power2.out' });
    }
  }, [battle.combatLog.length, lastTurn]);

  // ── Death collapse ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (hpA <= 0 && figARef.current && !aDeadRef.current) {
      aDeadRef.current = true;
      idleTlRef.current?.kill();
      gsap.to(figARef.current, { rotation: -88, y: 60, opacity: 0.2, duration: 0.9, ease: 'power2.in' });
    }
  }, [hpA]);

  useEffect(() => {
    if (hpB <= 0 && figBRef.current && !bDeadRef.current) {
      bDeadRef.current = true;
      idleTlBRef.current?.kill();
      gsap.to(figBRef.current, { rotation: 88, y: 60, opacity: 0.2, duration: 0.9, ease: 'power2.in' });
    }
  }, [hpB]);

  return (
    <div className="w-full">
      {/* ── HP BARS ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Beast A — fills left→right */}
        <div className="space-y-1">
          <div className="flex items-center justify-between font-mono text-xs font-bold">
            <span className="text-primary uppercase truncate max-w-[55%]">{battle.beastA.name}</span>
            <span style={{ color: hpColor(hpA) }}>{Math.max(0, hpA)} HP</span>
          </div>
          <div className="h-4 bg-neutral border border-divider overflow-hidden p-[2px]">
            <div
              ref={hpBarARef}
              className="h-full"
              style={{ width: `${Math.max(0, hpA)}%`, backgroundColor: hpColor(hpA) }}
            />
          </div>
        </div>

        {/* Beast B — fills right→left */}
        <div className="space-y-1">
          <div className="flex items-center justify-between font-mono text-xs font-bold flex-row-reverse">
            <span className="text-primary uppercase truncate max-w-[55%] text-right">{battle.beastB.name}</span>
            <span style={{ color: hpColor(hpB) }}>{Math.max(0, hpB)} HP</span>
          </div>
          <div className="h-4 bg-neutral border border-divider overflow-hidden p-[2px] flex justify-end">
            <div
              ref={hpBarBRef}
              className="h-full"
              style={{ width: `${Math.max(0, hpB)}%`, backgroundColor: hpColor(hpB) }}
            />
          </div>
        </div>
      </div>

      {/* ── BOXING RING ─────────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden border border-divider"
        style={{ aspectRatio: '16 / 7' }}
      >
        {/* Dark ring floor */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, #121212 0%, #080808 100%)' }}
        />

        {/* Mat grid texture */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: [
              'repeating-linear-gradient(0deg,  transparent, transparent 28px, rgba(255,255,255,1) 28px, rgba(255,255,255,1) 29px)',
              'repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,1) 28px, rgba(255,255,255,1) 29px)',
            ].join(','),
          }}
        />

        {/* Centre spotlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 90% at 50% 55%, rgba(255,255,255,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Ring ropes — 3 horizontal lines */}
        {[18, 34, 50].map((topPct, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              top: `${topPct}%`,
              left: '4%',
              right: '4%',
              height: '3px',
              borderRadius: 9999,
              background: 'linear-gradient(90deg, #555 0%, #bbb 18%, #fff 50%, #bbb 82%, #555 100%)',
              boxShadow: '0 0 6px rgba(255,255,255,0.2)',
            }}
          />
        ))}

        {/* Corner posts (where ropes meet the edges) */}
        {([
          { style: { top: '18%',  left: '4%',  transform: 'translate(-50%,-50%)' } },
          { style: { top: '18%',  right: '4%', transform: 'translate(50%,-50%)' } },
          { style: { top: '50%',  left: '4%',  transform: 'translate(-50%,-50%)' } },
          { style: { top: '50%',  right: '4%', transform: 'translate(50%,-50%)' } },
        ] as { style: React.CSSProperties }[]).map((p, i) => (
          <div
            key={i}
            className="absolute w-5 h-5 rounded-full border-[2px] border-white/40 bg-neutral pointer-events-none"
            style={p.style}
          />
        ))}

        {/* Ring outer border */}
        <div className="absolute inset-[3%] border border-white/10 pointer-events-none" />

        {/* VS watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-headline font-extrabold text-white/[0.04]" style={{ fontSize: 'clamp(40px, 7vw, 90px)' }}>
            VS
          </span>
        </div>

        {/* ── FIGHTER A ── */}
        <div
          ref={figARef}
          className="absolute"
          style={{ left: '16%', bottom: '4%', width: 'clamp(68px, 13%, 115px)' }}
        >
          <div
            ref={hitFlashARef}
            className="absolute inset-0 z-10 pointer-events-none opacity-0"
            style={{ background: 'radial-gradient(circle at center, #ef4444 0%, transparent 68%)' }}
          />
          <FighterFigure avatarUrl={battle.beastA.avatarUrl} clipId={clipIdA} flipped={false} />
        </div>

        {/* ── FIGHTER B (mirrored) ── */}
        <div
          ref={figBRef}
          className="absolute"
          style={{ right: '16%', bottom: '4%', width: 'clamp(68px, 13%, 115px)' }}
        >
          <div
            ref={hitFlashBRef}
            className="absolute inset-0 z-10 pointer-events-none opacity-0"
            style={{ background: 'radial-gradient(circle at center, #ef4444 0%, transparent 68%)' }}
          />
          <FighterFigure avatarUrl={battle.beastB.avatarUrl} clipId={clipIdB} flipped={true} />
        </div>

        {/* LIVE badge */}
        {isLive && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/75 border border-white/10 px-3 py-1 font-mono text-[11px] font-bold z-20">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white tracking-widest">LIVE</span>
          </div>
        )}

        {/* Victory banner */}
        {isCompleted && battle.winner && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/55">
            <div className="bg-primary text-background px-8 py-5 text-center shadow-2xl">
              <div className="font-mono text-[10px] uppercase opacity-60 mb-1 tracking-widest">COMBAT CONCLUDED</div>
              <div className="font-headline font-extrabold text-2xl uppercase tracking-wider">
                {battle.winner === 'beastA' ? battle.beastA.name : battle.beastB.name}
              </div>
              <div className="font-mono text-[10px] uppercase mt-1 opacity-70 tracking-widest">WINS</div>
            </div>
          </div>
        )}
      </div>

      {/* ── FIGHTER INFO STRIP ──────────────────────────────────────────────── */}
      <div className="border-x border-b border-divider bg-background">
        <div className="grid grid-cols-3 divide-x divide-divider font-mono text-xs">
          {/* Beast A */}
          <div className="p-3 space-y-1">
            <div className="font-bold text-primary uppercase truncate">{battle.beastA.name}</div>
            <div className="text-secondary text-[10px]">
              PWR {battle.beastA.stats.power} · DEF {battle.beastA.stats.defense} · SPD {battle.beastA.stats.speed} · SPC {battle.beastA.stats.special}
            </div>
            <div className="text-secondary text-[10px]">
              {battle.beastA.record.wins}W – {battle.beastA.record.losses}L
            </div>
            {battle.marketPulseA?.modifier && (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 border border-divider bg-surface-container-low text-[10px] text-primary font-bold">
                <FiZap className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{battle.marketPulseA.modifier.description}</span>
              </div>
            )}
          </div>

          {/* Centre — combat trigger */}
          <div className="p-3 flex items-center justify-center">
            {isCompleted ? (
              <div className="text-secondary text-[10px] uppercase font-bold text-center">DUEL CONCLUDED</div>
            ) : isOwnerOfFighter ? (
              <button
                onClick={onExecuteCombat}
                disabled={isSimulating}
                className="px-4 py-2.5 bg-primary text-background font-headline font-bold text-[10px] uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <FiTerminal className="w-3 h-3" />
                <span>{isSimulating ? 'SIMULATING…' : 'TRIGGER ENGINE'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-secondary text-[10px] uppercase">
                <FiShield className="w-3 h-3 flex-shrink-0" />
                <span>AWAITING OWNER</span>
              </div>
            )}
          </div>

          {/* Beast B */}
          <div className="p-3 space-y-1 text-right">
            <div className="font-bold text-primary uppercase truncate">{battle.beastB.name}</div>
            <div className="text-secondary text-[10px]">
              PWR {battle.beastB.stats.power} · DEF {battle.beastB.stats.defense} · SPD {battle.beastB.stats.speed} · SPC {battle.beastB.stats.special}
            </div>
            <div className="text-secondary text-[10px]">
              {battle.beastB.record.wins}W – {battle.beastB.record.losses}L
            </div>
            {battle.marketPulseB?.modifier && (
              <div className="inline-flex items-center justify-end gap-1 mt-1 px-2 py-0.5 border border-divider bg-surface-container-low text-[10px] text-primary font-bold">
                <FiZap className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{battle.marketPulseB.modifier.description}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
