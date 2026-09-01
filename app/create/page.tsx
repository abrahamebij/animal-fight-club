'use client';

import React, { useState, useRef, useCallback, useLayoutEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  FiPlusSquare, 
  FiCheck, 
} from 'react-icons/fi';
import { useAccount } from 'wagmi';
import { useWalletGate } from '@/components/wallet/useWalletGate';
import { STAT_BUDGET, AVAILABLE_PERKS, AVATAR_PRESETS } from '@/lib/constants/game';
import { BeastStats, BoundAsset } from '@/lib/types';
import { createBeast } from '@/lib/services/beastService';
import gsap from 'gsap';

export default function CreateBeastPage() {
  const router = useRouter();
  const { address } = useAccount();

  const [name, setName] = useState('CYBER VENOM');
  const [description, setDescription] = useState('Genetically augmented apex predator forged for aggressive close-quarters combat.');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].imageUrl);
  const [boundAsset, setBoundAsset] = useState<BoundAsset>('BTC');
  
  const [stats, setStats] = useState<BeastStats>({
    power: 7,
    defense: 5,
    speed: 5,
    special: 3,
  });

  const [selectedPerks, setSelectedPerks] = useState<string[]>([
    AVAILABLE_PERKS[0].id,
    AVAILABLE_PERKS[1].id,
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Points calculation
  const usedPoints = stats.power + stats.defense + stats.speed + stats.special;
  const remainingPoints = STAT_BUDGET.TOTAL_POINTS - usedPoints;

  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const pointsBadgeRef = useRef<HTMLSpanElement>(null);
  // Track stat value element refs by key
  const statRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  // Header entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.from('.forge-badge', { opacity: 0, y: -12, duration: 0.4 })
        .from('.forge-title', { opacity: 0, y: 28, duration: 0.55 }, '-=0.2')
        .from('.forge-desc', { opacity: 0, y: 18, duration: 0.4 }, '-=0.2');
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // Form panels stagger in
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.forge-panel', {
        opacity: 0,
        y: 32,
        duration: 0.55,
        stagger: 0.12,
        ease: 'power2.out',
        delay: 0.3,
      });
    }, formRef);
    return () => ctx.revert();
  }, []);

  const handleStatChange = useCallback((statKey: keyof BeastStats, delta: number) => {
    const currentValue = stats[statKey];
    const newValue = currentValue + delta;

    if (newValue < STAT_BUDGET.MIN_PER_STAT || newValue > STAT_BUDGET.MAX_PER_STAT) return;
    if (delta > 0 && remainingPoints <= 0) return;

    setStats((prev) => ({
      ...prev,
      [statKey]: newValue,
    }));

    // Bounce the stat number
    const el = statRefs.current[statKey];
    if (el) {
      gsap.fromTo(
        el,
        { scale: delta > 0 ? 1.5 : 0.6 },
        { scale: 1, duration: 0.35, ease: 'elastic.out(1.2, 0.5)' }
      );
    }

    // Flash the points badge when budget changes
    if (pointsBadgeRef.current) {
      gsap.fromTo(
        pointsBadgeRef.current,
        { scale: 1.2 },
        { scale: 1, duration: 0.3, ease: 'back.out(2)' }
      );
    }
  }, [stats, remainingPoints]);

  const togglePerk = (perkId: string) => {
    if (selectedPerks.includes(perkId)) {
      setSelectedPerks(selectedPerks.filter((id) => id !== perkId));
    } else {
      if (selectedPerks.length < 2) {
        setSelectedPerks([...selectedPerks, perkId]);
      }
    }
  };

  const handleAvatarSelect = (imageUrl: string) => {
    setSelectedAvatar(imageUrl);
    // Scale-flash the preview image
    gsap.fromTo(
      '.avatar-preview',
      { scale: 0.95, opacity: 0.6 },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' }
    );
  };

  const { requireAuth } = useWalletGate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingPoints < 0 || isSubmitting) return;

    requireAuth({
      actionTitle: 'mint this beast to the on-chain arena',
      onSuccess: async () => {
        setIsSubmitting(true);

        // Pulse the submit button
        if (submitBtnRef.current) {
          gsap.fromTo(
            submitBtnRef.current,
            { scale: 0.96 },
            { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.5)' }
          );
        }

        try {
          if (!address) {
            setIsSubmitting(false);
            return;
          }
          const createdBeast = await createBeast({
            ownerAddress: address,
            name: name.trim() || 'UNTITLED BEAST',
            description: description.trim() || 'No tactical lore entered.',
            avatarUrl: selectedAvatar,
            stats,
            perks: selectedPerks,
            boundAsset,
          });

          // Navigate directly to the newly forged beast profile
          router.push(`/beast/${createdBeast.id}`);
        } catch (err) {
          console.error('Failed to create beast:', err);
          setIsSubmitting(false);
        }
      },
    });
  };

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground pb-24">
      {/* Header */}
      <section ref={headerRef} className="border-b border-primary bg-background pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="forge-badge inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider mb-3">
            <span className="w-2 h-2 bg-secondary" />
            <span>GENETIC FORGE // ATTRIBUTE MATRIX</span>
          </div>
          <h1 className="forge-title font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
            CREATE YOUR BEAST
          </h1>
          <p className="forge-desc font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
            Distribute your 20-point attribute budget, equip tactical perks, and optionally bind your combatant to live DreamDEX Event Contract market odds.
          </p>
        </div>
      </section>

      {/* Main Form Grid */}
      <section ref={formRef} className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Config Section (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Identity & Name */}
            <div className="forge-panel border border-primary p-6 bg-background space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
                  1. IDENTIFIER & PROFILE
                </h2>
                <span className="font-mono text-xs text-secondary">STEP 01/04</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-1.5 font-bold">
                    COMBATANT CODENAME
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={30}
                    className="w-full bg-surface-container-low border border-primary p-3 font-headline font-bold text-lg uppercase tracking-wider text-primary focus:outline-none focus:border-2"
                    placeholder="E.G. TITAN MEGAKONG"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-1.5 font-bold">
                    TACTICAL SUMMARY / LORE
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    maxLength={150}
                    className="w-full bg-surface-container-low border border-primary p-3 font-sans text-sm text-primary focus:outline-none focus:border-2"
                    placeholder="Short description of combat style and biomechanical augmentations..."
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-primary mb-2 font-bold">
                    AVATAR GENOTYPE
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleAvatarSelect(preset.imageUrl)}
                        className={`relative aspect-square border overflow-hidden transition-all ${
                          selectedAvatar === preset.imageUrl
                            ? 'border-2 border-primary ring-2 ring-primary'
                            : 'border-primary opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={preset.imageUrl}
                          alt={preset.name}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Stat Points Budget */}
            <div className="forge-panel border border-primary p-6 bg-background space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
                  2. ATTRIBUTE MATRIX ALLOCATION
                </h2>
                <div className="font-mono text-xs">
                  <span>POINTS REMAINING: </span>
                  <span
                    ref={pointsBadgeRef}
                    className={`inline-block font-bold px-2 py-0.5 ${remainingPoints === 0 ? 'bg-primary text-background' : 'bg-warning text-primary'}`}
                  >
                    {remainingPoints} / {STAT_BUDGET.TOTAL_POINTS}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {(['power', 'defense', 'speed', 'special'] as const).map((statKey) => {
                  const val = stats[statKey];
                  const labels = {
                    power: { title: 'POWER', desc: 'Direct offensive damage capacity and strike force.' },
                    defense: { title: 'DEFENSE', desc: 'Armor mitigation, health endurance, and damage reduction.' },
                    speed: { title: 'SPEED', desc: 'Turn order initiative and evasive dodge probability.' },
                    special: { title: 'SPECIAL', desc: 'Critical strike threshold and ability synergy.' },
                  };

                  return (
                    <div key={statKey} className="border border-neutral p-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="font-headline font-bold text-lg uppercase tracking-wider text-primary">
                          {labels[statKey].title}
                        </div>
                        <p className="font-sans text-xs text-secondary">
                          {labels[statKey].desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleStatChange(statKey, -1)}
                          disabled={val <= STAT_BUDGET.MIN_PER_STAT}
                          className="w-9 h-9 bg-primary text-background font-mono font-bold text-base flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
                        >
                          -
                        </button>
                        <span
                          ref={(el) => { statRefs.current[statKey] = el; }}
                          className="inline-block font-mono font-bold text-xl w-8 text-center text-primary"
                        >
                          {val}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStatChange(statKey, 1)}
                          disabled={val >= STAT_BUDGET.MAX_PER_STAT || remainingPoints <= 0}
                          className="w-9 h-9 bg-primary text-background font-mono font-bold text-base flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Perk Selection */}
            <div className="forge-panel border border-primary p-6 bg-background space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
                  3. TACTICAL PERKS (SELECT UP TO 2)
                </h2>
                <span className="font-mono text-xs text-secondary">
                  {selectedPerks.length} / 2 EQUIPPED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {AVAILABLE_PERKS.map((perk) => {
                  const isSelected = selectedPerks.includes(perk.id);
                  return (
                    <div
                      key={perk.id}
                      onClick={() => togglePerk(perk.id)}
                      className={`border p-4 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-2 border-primary bg-primary text-background'
                          : 'border-neutral bg-surface-container-low hover:border-primary'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-headline font-bold text-base uppercase tracking-tight">
                          {perk.name}
                        </div>
                        <div className={`w-5 h-5 border flex items-center justify-center ${isSelected ? 'border-background bg-secondary text-background' : 'border-primary'}`}>
                          {isSelected && <FiCheck className="w-3.5 h-3.5 text-background" />}
                        </div>
                      </div>
                      <p className={`font-sans text-xs ${isSelected ? 'text-background/80' : 'text-secondary'}`}>
                        {perk.description}
                      </p>
                      <div className={`font-mono text-[11px] font-bold ${isSelected ? 'text-warning' : 'text-primary'}`}>
                        {perk.effectSummary}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Market Binding */}
            <div className="forge-panel border border-primary p-6 bg-background space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
                  4. DREAMDEX MARKET BINDING
                </h2>
                <span className="font-mono text-xs text-primary font-bold">EVENT CONTRACT DATA</span>
              </div>

              <p className="font-sans text-xs text-secondary leading-relaxed">
                Optionally bind your beast to live DreamDEX BTC or ETH binary order books. When a battle starts, real-time probability odds will calculate a locked combat modifier (Market Pulse).
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { key: 'BTC', label: 'BTC / USDso', desc: '15M Rolling Window' },
                  { key: 'ETH', label: 'ETH / USDso', desc: '15M Rolling Window' },
                  { key: null, label: 'UNBOUND', desc: 'Standard Combat Stats' },
                ].map((option) => {
                  const isSelected = boundAsset === option.key;
                  return (
                    <button
                      key={option.key ?? 'none'}
                      type="button"
                      onClick={() => setBoundAsset(option.key as BoundAsset)}
                      className={`border p-4 text-left transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-2 border-primary bg-primary text-background'
                          : 'border-neutral bg-surface-container-low hover:border-primary'
                      }`}
                    >
                      <div className="font-headline font-bold text-lg uppercase tracking-tight">
                        {option.label}
                      </div>
                      <div className={`font-mono text-[11px] ${isSelected ? 'text-background/70' : 'text-secondary'}`}>
                        {option.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right / Live Preview Card (5 cols) */}
          <div className="forge-panel lg:col-span-5">
            <div className="border-2 border-primary p-6 bg-background sticky top-24 space-y-6">
              <div className="flex items-center justify-between border-b border-primary pb-3">
                <span className="font-headline font-bold text-xl uppercase tracking-wider">
                  BEAST HUD PREVIEW
                </span>
                <span className="font-mono text-xs text-secondary font-bold">READY TO FORGE</span>
              </div>

              <div className="avatar-preview relative aspect-square w-full border border-primary overflow-hidden bg-zinc-900">
                <Image
                  src={selectedAvatar}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                />
                {boundAsset && (
                  <div className="absolute top-3 right-3 bg-primary text-background font-mono text-xs font-bold px-3 py-1 border border-background/30">
                    {boundAsset} BOUND
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-headline font-extrabold text-3xl uppercase tracking-tight truncate">
                  {name || 'UNTITLED BEAST'}
                </h3>
                <p className="font-sans text-xs text-secondary line-clamp-2 mt-1">
                  {description || 'No tactical lore entered.'}
                </p>
              </div>

              {/* Stat breakdown */}
              <div className="space-y-2 border-t border-b border-primary py-4 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">POWER:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-neutral overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(stats.power / 10) * 100}%` }} />
                    </div>
                    <span className="font-bold w-4 text-right">{stats.power}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary">DEFENSE:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-neutral overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(stats.defense / 10) * 100}%` }} />
                    </div>
                    <span className="font-bold w-4 text-right">{stats.defense}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary">SPEED:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-neutral overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(stats.speed / 10) * 100}%` }} />
                    </div>
                    <span className="font-bold w-4 text-right">{stats.speed}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary">SPECIAL:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-neutral overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(stats.special / 10) * 100}%` }} />
                    </div>
                    <span className="font-bold w-4 text-right">{stats.special}</span>
                  </div>
                </div>
              </div>

              {/* Equipped Perks */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="text-secondary uppercase">EQUIPPED PERKS:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedPerks.length === 0 ? (
                    <span className="text-secondary">None selected</span>
                  ) : (
                    selectedPerks.map((pId) => {
                      const p = AVAILABLE_PERKS.find((item) => item.id === pId);
                      return (
                        <span key={pId} className="bg-primary text-background px-2 py-1 text-[11px] font-bold uppercase">
                          {p?.name}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                ref={submitBtnRef}
                type="submit"
                disabled={remainingPoints < 0 || isSubmitting}
                className="w-full py-4 bg-primary text-background font-headline font-extrabold text-xl uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiPlusSquare className="w-5 h-5" />
                <span>{isSubmitting ? 'FORGING BEAST ON-CHAIN...' : 'MINT BEAST TO ARENA'}</span>
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
