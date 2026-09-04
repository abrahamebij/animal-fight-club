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
  gloveColor = '#dc2626',
}: {
  avatarUrl: string;
  clipId: string;
  flipped?: boolean;
  gloveColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 200"
      className="w-full h-full"
      style={{ transform: flipped ? 'scaleX(-1)' : 'none', transformOrigin: '50% 50%', overflow: 'visible' }}
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
      <rect x="16" y="3" width="68" height="68" rx="5" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />

      {/* Neck */}
      <line x1="50" y1="71" x2="50" y2="87" stroke="#d4d4d4" strokeWidth="8" strokeLinecap="round" />

      {/* Torso */}
      <line x1="50" y1="87" x2="50" y2="128" stroke="#d4d4d4" strokeWidth="10" strokeLinecap="round" />

      {/* Shoulder bar */}
      <line x1="20" y1="93" x2="80" y2="93" stroke="#d4d4d4" strokeWidth="6.5" strokeLinecap="round" />

      {/* Right arm — raised boxing guard (front arm) */}
      <line x1="80" y1="93" x2="90" y2="114" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round" />
      <line x1="90" y1="114" x2="97" y2="96"  stroke="#d4d4d4" strokeWidth="5.5" strokeLinecap="round" />
      {/* Front boxing glove */}
      <circle cx="98" cy="92" r="7" fill={gloveColor} stroke="#ffffff" strokeWidth="1.2" />

      {/* Left arm — rear guard */}
      <line x1="20" y1="93" x2="10" y2="117" stroke="#d4d4d4" strokeWidth="6" strokeLinecap="round" />
      <line x1="10" y1="117" x2="5"  y2="103" stroke="#d4d4d4" strokeWidth="5.5" strokeLinecap="round" />
      {/* Rear boxing glove */}
      <circle cx="4" cy="99" r="6" fill={gloveColor} stroke="#ffffff" strokeWidth="1.2" />

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
  // ── replay mode ──────────────────────────────────
  replayTurn?: CombatTurn;   // drives attack animation without touching the real log
  overrideHpA?: number;      // HP to display during replay
  overrideHpB?: number;
  replayReset?: number;      // increment to snap fighters back to standing
  suppressVictory?: boolean; // hide the winner banner mid-replay
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
  replayTurn,
  overrideHpA,
  overrideHpB,
  replayReset,
  suppressVictory,
}: BattleArenaRingProps) {
  const figARef      = useRef<HTMLDivElement>(null);
  const figBRef      = useRef<HTMLDivElement>(null);
  const hitFlashARef = useRef<HTMLDivElement>(null);
  const hitFlashBRef = useRef<HTMLDivElement>(null);
  const hpBarARef    = useRef<HTMLDivElement>(null);
  const hpBarBRef    = useRef<HTMLDivElement>(null);
  const idleTlRef    = useRef<gsap.core.Timeline | null>(null);
  const idleTlBRef   = useRef<gsap.core.Timeline | null>(null);
  const prevLogLen       = useRef(battle.combatLog.length);
  const prevReplayTurnNo = useRef<number | undefined>(undefined);
  const aDeadRef     = useRef(false);
  const bDeadRef     = useRef(false);

  const isLive      = battle.status === 'live';
  const isCompleted = battle.status === 'completed';

  // ── Display HP: use replay overrides when provided ─────────────────────────
  const displayHpA = overrideHpA !== undefined ? overrideHpA : hpA;
  const displayHpB = overrideHpB !== undefined ? overrideHpB : hpB;

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

  // ── replayReset: snap fighters back to standing position ──────────────────
  useEffect(() => {
    if (replayReset === undefined) return;
    aDeadRef.current = false;
    bDeadRef.current = false;
    prevReplayTurnNo.current = undefined;
    if (figARef.current) {
      gsap.to(figARef.current, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
    if (figBRef.current) {
      gsap.to(figBRef.current, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
    // Reset HP bars to 100%
    if (hpBarARef.current) {
      gsap.to(hpBarARef.current, { width: '100%', backgroundColor: hpColor(100), duration: 0.4 });
    }
    if (hpBarBRef.current) {
      gsap.to(hpBarBRef.current, { width: '100%', backgroundColor: hpColor(100), duration: 0.4 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayReset]);

  // ── HP bar animations (driven by displayHpA/B) ────────────────────────────
  useEffect(() => {
    if (hpBarARef.current) {
      gsap.to(hpBarARef.current, {
        width: `${Math.max(0, displayHpA)}%`,
        backgroundColor: hpColor(displayHpA),
        duration: 0.55,
        ease: 'power2.out',
      });
    }
  }, [displayHpA]);

  useEffect(() => {
    if (hpBarBRef.current) {
      gsap.to(hpBarBRef.current, {
        width: `${Math.max(0, displayHpB)}%`,
        backgroundColor: hpColor(displayHpB),
        duration: 0.55,
        ease: 'power2.out',
      });
    }
  }, [displayHpB]);

  // ── Shared attack animation logic ─────────────────────────────────────────
  function fireAttackAnimation(turn: CombatTurn) {
    const isAAttacking = turn.actor === 'beastA';
    const attackerEl   = isAAttacking ? figARef.current : figBRef.current;
    const defenderEl   = isAAttacking ? figBRef.current : figARef.current;
    const hitFlashEl   = isAAttacking ? hitFlashBRef.current : hitFlashARef.current;
    const lungeDir     = isAAttacking ? 58 : -58;
    const shakeAmt     = isAAttacking ? 10 : -10;

    if (!attackerEl || !defenderEl) return;

    idleTlRef.current?.pause();
    idleTlBRef.current?.pause();

    const atk = gsap.timeline({
      onComplete: () => {
        if (!aDeadRef.current) idleTlRef.current?.resume();
        if (!bDeadRef.current) idleTlBRef.current?.resume();
      },
    });

    atk.to(attackerEl, { x: lungeDir, duration: 0.17, ease: 'power2.in' })
       .to(attackerEl, { x: 0,        duration: 0.33, ease: 'power2.out' });

    if (turn.isCritical) {
      atk.to(attackerEl, { scale: 1.14, duration: 0.1,  ease: 'power2.out' }, 0.1)
         .to(attackerEl, { scale: 1,    duration: 0.22, ease: 'power2.in'  }, 0.2);
    }

    atk.to(defenderEl, { x: shakeAmt * -1,   duration: 0.06 }, 0.14)
       .to(defenderEl, { x: shakeAmt,          duration: 0.06 })
       .to(defenderEl, { x: shakeAmt * -0.5,   duration: 0.05 })
       .to(defenderEl, { x: 0,                 duration: 0.06 });

    if (hitFlashEl) {
      atk.to(hitFlashEl, { opacity: 0.8, duration: 0.04 }, 0.14)
         .to(hitFlashEl, { opacity: 0,   duration: 0.28, ease: 'power2.out' });
    }
  }

  // ── Attack animation — real live turns ────────────────────────────────────
  useEffect(() => {
    const curLen = battle.combatLog.length;
    if (curLen <= prevLogLen.current || !lastTurn) {
      prevLogLen.current = curLen;
      return;
    }
    prevLogLen.current = curLen;
    fireAttackAnimation(lastTurn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle.combatLog.length, lastTurn]);

  // ── Attack animation — replay turns ───────────────────────────────────────
  useEffect(() => {
    if (!replayTurn) return;
    if (replayTurn.turnNumber === prevReplayTurnNo.current) return;
    prevReplayTurnNo.current = replayTurn.turnNumber;
    fireAttackAnimation(replayTurn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayTurn]);

  // ── Death collapse (driven by displayHpA/B) ────────────────────────────────
  useEffect(() => {
    if (displayHpA <= 0 && figARef.current && !aDeadRef.current) {
      aDeadRef.current = true;
      idleTlRef.current?.kill();
      gsap.to(figARef.current, { rotation: -88, y: 30, opacity: 0.45, duration: 0.9, ease: 'power2.in' });
    }
  }, [displayHpA]);

  useEffect(() => {
    if (displayHpB <= 0 && figBRef.current && !bDeadRef.current) {
      bDeadRef.current = true;
      idleTlBRef.current?.kill();
      gsap.to(figBRef.current, { rotation: 88, y: 30, opacity: 0.45, duration: 0.9, ease: 'power2.in' });
    }
  }, [displayHpB]);

  return (
    <div className="w-full">
      {/* ── HP BARS ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Beast A — fills left→right */}
        <div className="space-y-1">
          <div className="flex items-center justify-between font-mono text-xs font-bold">
            <span className="text-primary uppercase truncate max-w-[55%]">{battle.beastA.name}</span>
            <span style={{ color: hpColor(displayHpA) }}>{Math.max(0, displayHpA)} HP</span>
          </div>
          <div className="h-4 bg-neutral border border-divider overflow-hidden p-[2px]">
            <div
              ref={hpBarARef}
              className="h-full"
              style={{ width: `${Math.max(0, displayHpA)}%`, backgroundColor: hpColor(displayHpA) }}
            />
          </div>
        </div>

        {/* Beast B — fills right→left */}
        <div className="space-y-1">
          <div className="flex items-center justify-between font-mono text-xs font-bold flex-row-reverse">
            <span className="text-primary uppercase truncate max-w-[55%] text-right">{battle.beastB.name}</span>
            <span style={{ color: hpColor(displayHpB) }}>{Math.max(0, displayHpB)} HP</span>
          </div>
          <div className="h-4 bg-neutral border border-divider overflow-hidden p-[2px] flex justify-end">
            <div
              ref={hpBarBRef}
              className="h-full"
              style={{ width: `${Math.max(0, displayHpB)}%`, backgroundColor: hpColor(displayHpB) }}
            />
          </div>
        </div>
      </div>


      {/* ── BOXING RING CANVAS ─────────────────────────────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden border-2 border-divider bg-black select-none"
        style={{ aspectRatio: '16 / 8.5' }}
      >
        {/* Arena stadium background with subtle atmospheric haze */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0d] via-[#101015] to-[#08080a]" />

        {/* Overhead arena spotlights illuminating the fighting ring */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 65% at 50% 35%, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.03) 50%, transparent 75%)',
          }}
        />
        <div
          className="absolute top-0 left-1/4 w-1/2 h-full pointer-events-none opacity-20"
          style={{
            background: 'conic-gradient(from 180deg at 50% 0%, transparent 45deg, rgba(255,255,255,0.12) 65deg, rgba(255,255,255,0.12) 115deg, transparent 135deg)',
          }}
        />

        {/* ── 3D ELEVATED RING CANVAS PLATFORM ── */}
        {/* Ring apron skirt (front face of elevated stage) */}
        <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-[#121216] border-t-2 border-[#3f3f46] shadow-2xl flex items-center justify-between px-6 font-mono text-[10px] text-zinc-500 uppercase tracking-widest z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="font-bold text-zinc-300">RED CORNER</span>
          </div>
          <span className="hidden sm:inline font-headline tracking-widest text-zinc-600 font-extrabold text-xs">
            SOMNIA SHANNON TESTNET · APEX ARENA RING
          </span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">BLUE CORNER</span>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          </div>
        </div>

        {/* Ring Canvas Surface (textured mat floor) */}
        <div 
          className="absolute bottom-[11%] left-[5%] right-[5%] top-[16%] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, #18181d 0%, #202028 55%, #252530 100%)',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.85), 0 10px 30px rgba(0,0,0,0.9)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          {/* Canvas texture weave lines */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.8) 20px, rgba(255,255,255,0.8) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.8) 20px, rgba(255,255,255,0.8) 21px)',
            }}
          />

          {/* Inner ring perimeter line (boundary line inside ring) */}
          <div className="absolute inset-[6%] border border-red-500/25 pointer-events-none" />
          <div className="absolute inset-[6.5%] border border-white/10 pointer-events-none" />

          {/* Center ring canvas logo / combat insignia */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-20">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-white/40 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-dashed border-white/50 flex items-center justify-center">
                <span className="font-headline font-black text-2xl sm:text-3xl text-white tracking-tighter">
                  AFC
                </span>
              </div>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/70 mt-1">
              FIGHT CLUB
            </span>
          </div>
        </div>

        {/* ── BACK RING ROPES (Behind Fighters for true 3D spatial depth) ── */}
        {[26, 40, 54, 68].map((topPct, i) => (
          <div
            key={`back-rope-${i}`}
            className="absolute pointer-events-none"
            style={{
              top: `${topPct}%`,
              left: '8%',
              right: '8%',
              height: '3px',
              background: 'linear-gradient(90deg, #333 0%, #666 20%, #888 50%, #666 80%, #333 100%)',
              opacity: 0.45,
            }}
          />
        ))}

        {/* ── BACK CORNER POSTS ── */}
        <div 
          className="absolute pointer-events-none"
          style={{ top: '14%', left: '8%', width: '10px', height: '62%', transform: 'translateX(-50%)' }}
        >
          <div className="w-full h-full bg-gradient-to-r from-[#1a1a1a] via-[#444] to-[#1a1a1a] border-x border-white/10" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-zinc-600 border border-white/30" />
        </div>
        <div 
          className="absolute pointer-events-none"
          style={{ top: '14%', right: '8%', width: '10px', height: '62%', transform: 'translateX(50%)' }}
        >
          <div className="w-full h-full bg-gradient-to-r from-[#1a1a1a] via-[#444] to-[#1a1a1a] border-x border-white/10" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-zinc-600 border border-white/30" />
        </div>

        {/* ── FIGHTER A (Red Corner / Alpha) ── */}
        <div
          ref={figARef}
          className="absolute z-10"
          style={{ left: '18%', bottom: '11%', width: 'clamp(72px, 14%, 120px)' }}
        >
          <div className="w-3/4 h-2.5 bg-black/60 rounded-full blur-[2px] mx-auto translate-y-1" />
          <div
            ref={hitFlashARef}
            className="absolute inset-0 z-20 pointer-events-none opacity-0"
            style={{ background: 'radial-gradient(circle at center, #ef4444 0%, transparent 70%)' }}
          />
          <FighterFigure avatarUrl={battle.beastA.avatarUrl} clipId={clipIdA} flipped={false} gloveColor="#dc2626" />
        </div>

        {/* ── FIGHTER B (Blue Corner / Bravo) ── */}
        <div
          ref={figBRef}
          className="absolute z-10"
          style={{ right: '18%', bottom: '11%', width: 'clamp(72px, 14%, 120px)' }}
        >
          <div className="w-3/4 h-2.5 bg-black/60 rounded-full blur-[2px] mx-auto translate-y-1" />
          <div
            ref={hitFlashBRef}
            className="absolute inset-0 z-20 pointer-events-none opacity-0"
            style={{ background: 'radial-gradient(circle at center, #ef4444 0%, transparent 70%)' }}
          />
          <FighterFigure avatarUrl={battle.beastB.avatarUrl} clipId={clipIdB} flipped={true} gloveColor="#2563eb" />
        </div>

        {/* ── FRONT RING ROPES (In front of fighters, authentic boxing ring) ── */}
        {[24, 38, 52, 66].map((topPct, i) => {
          const ropeGradients = [
            'linear-gradient(90deg, #991b1b 0%, #ef4444 20%, #fca5a5 50%, #ef4444 80%, #991b1b 100%)',
            'linear-gradient(90deg, #555 0%, #fff 20%, #fff 50%, #fff 80%, #555 100%)',
            'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 20%, #93c5fd 50%, #3b82f6 80%, #1e3a8a 100%)',
            'linear-gradient(90deg, #991b1b 0%, #ef4444 20%, #fca5a5 50%, #ef4444 80%, #991b1b 100%)',
          ];
          return (
            <div
              key={`front-rope-${i}`}
              className="absolute z-20 pointer-events-none"
              style={{
                top: `${topPct}%`,
                left: '6%',
                right: '6%',
                height: '4px',
                borderRadius: 9999,
                background: ropeGradients[i],
                boxShadow: '0 2px 4px rgba(0,0,0,0.6), 0 0 6px rgba(255,255,255,0.15)',
              }}
            />
          );
        })}

        {/* Vertical rope spacers / straps (clamps holding the 4 ropes together in parallel) */}
        {['32%', '68%'].map((leftPos, idx) => (
          <div
            key={`rope-strap-${idx}`}
            className="absolute z-20 pointer-events-none w-2 bg-neutral border border-black/50"
            style={{
              left: leftPos,
              top: '24%',
              height: '42%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          />
        ))}

        {/* ── MAIN FRONT CORNER POSTS WITH PADDED TURNBUCKLES ── */}
        {/* LEFT CORNER POST (Red Corner) */}
        <div
          className="absolute z-30 pointer-events-none flex flex-col items-center"
          style={{ top: '12%', left: '6%', transform: 'translateX(-50%)', height: '77%' }}
        >
          {/* Post top cap */}
          <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white/60 shadow-lg mb-1" />
          
          {/* Padded Turnbuckle Cushion */}
          <div 
            className="w-5 flex-1 rounded-sm shadow-2xl relative flex flex-col justify-between py-2 items-center"
            style={{
              background: 'linear-gradient(90deg, #7f1d1d 0%, #dc2626 50%, #991b1b 100%)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            {[0.12, 0.35, 0.58, 0.82].map((_, idx) => (
              <div key={idx} className="w-7 h-1.5 bg-zinc-300 border border-black rounded-sm shadow-sm" />
            ))}
            <span className="font-headline font-extrabold text-[8px] text-white tracking-widest [writing-mode:vertical-lr] uppercase">
              RED CORNER
            </span>
          </div>

          {/* Post base into apron */}
          <div className="w-4 h-3 bg-zinc-700 border border-zinc-500 mt-0.5" />
        </div>

        {/* RIGHT CORNER POST (Blue Corner) */}
        <div
          className="absolute z-30 pointer-events-none flex flex-col items-center"
          style={{ top: '12%', right: '6%', transform: 'translateX(50%)', height: '77%' }}
        >
          {/* Post top cap */}
          <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white/60 shadow-lg mb-1" />
          
          {/* Padded Turnbuckle Cushion */}
          <div 
            className="w-5 flex-1 rounded-sm shadow-2xl relative flex flex-col justify-between py-2 items-center"
            style={{
              background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            {[0.12, 0.35, 0.58, 0.82].map((_, idx) => (
              <div key={idx} className="w-7 h-1.5 bg-zinc-300 border border-black rounded-sm shadow-sm" />
            ))}
            <span className="font-headline font-extrabold text-[8px] text-white tracking-widest [writing-mode:vertical-lr] uppercase">
              BLUE CORNER
            </span>
          </div>

          {/* Post base into apron */}
          <div className="w-4 h-3 bg-zinc-700 border border-zinc-500 mt-0.5" />
        </div>

        {/* LIVE badge */}
        {isLive && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/80 border border-white/15 px-3 py-1 font-mono text-[11px] font-bold z-40">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white tracking-widest">LIVE</span>
          </div>
        )}

        {/* Victory banner */}
        {isCompleted && battle.winner && !suppressVictory && (
          <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/60 backdrop-blur-[1px]">
            <div className="bg-primary text-background px-8 py-5 text-center shadow-2xl border border-divider">
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
