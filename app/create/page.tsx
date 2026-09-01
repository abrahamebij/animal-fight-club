'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  FiPlusSquare, 
  FiShield, 
  FiZap, 
  FiActivity, 
  FiCheck, 
  FiTrendingUp,
  FiInfo,
  FiAward
} from 'react-icons/fi';
import { STAT_BUDGET, AVAILABLE_PERKS, AVATAR_PRESETS } from '@/lib/constants/game';
import { BeastStats, BoundAsset } from '@/lib/types';

export default function CreateBeastPage() {
  const router = useRouter();

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

  const handleStatChange = (statKey: keyof BeastStats, delta: number) => {
    const currentValue = stats[statKey];
    const newValue = currentValue + delta;

    if (newValue < STAT_BUDGET.MIN_PER_STAT || newValue > STAT_BUDGET.MAX_PER_STAT) return;
    if (delta > 0 && remainingPoints <= 0) return;

    setStats((prev) => ({
      ...prev,
      [statKey]: newValue,
    }));
  };

  const togglePerk = (perkId: string) => {
    if (selectedPerks.includes(perkId)) {
      setSelectedPerks(selectedPerks.filter((id) => id !== perkId));
    } else {
      if (selectedPerks.length < 2) {
        setSelectedPerks([...selectedPerks, perkId]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (remainingPoints < 0) return;
    setIsSubmitting(true);

    // Simulate creation / redirect to dashboard or arena
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="flex flex-col w-full bg-[#FAFAF8] min-h-screen text-[#0A0A0B] pb-24">
      {/* Header */}
      <section className="border-b border-[#0A0A0B] bg-[#FAFAF8] pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#0A0A0B] text-[#FAFAF8] font-mono text-[11px] uppercase tracking-wider mb-3">
            <span className="w-2 h-2 bg-[#DC2626]" />
            <span>GENETIC FORGE // ATTRIBUTE MATRIX</span>
          </div>
          <h1 className="font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#0A0A0B]">
            CREATE YOUR BEAST
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#5D5F5D] max-w-2xl leading-relaxed">
            Distribute your 20-point attribute budget, equip tactical perks, and optionally bind your combatant to live DreamDEX Event Contract market odds.
          </p>
        </div>
      </section>

      {/* Main Form Grid */}
      <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Config Section (8 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Identity & Name */}
            <div className="border border-[#0A0A0B] p-6 bg-[#FAFAF8] space-y-6">
              <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-3">
                <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
                  1. IDENTIFIER & PROFILE
                </h2>
                <span className="font-mono text-xs text-[#5D5F5D]">STEP 01/04</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#0A0A0B] mb-1.5 font-bold">
                    COMBATANT CODENAME
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={30}
                    className="w-full bg-[#F4F4F0] border border-[#0A0A0B] p-3 font-headline font-bold text-lg uppercase tracking-wider text-[#0A0A0B] focus:outline-none focus:border-2"
                    placeholder="E.G. TITAN MEGAKONG"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#0A0A0B] mb-1.5 font-bold">
                    TACTICAL SUMMARY / LORE
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    maxLength={150}
                    className="w-full bg-[#F4F4F0] border border-[#0A0A0B] p-3 font-sans text-sm text-[#0A0A0B] focus:outline-none focus:border-2"
                    placeholder="Short description of combat style and biomechanical augmentations..."
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-[#0A0A0B] mb-2 font-bold">
                    AVATAR GENOTYPE
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedAvatar(preset.imageUrl)}
                        className={`relative aspect-square border overflow-hidden transition-all ${
                          selectedAvatar === preset.imageUrl
                            ? 'border-2 border-[#DC2626] ring-2 ring-[#DC2626]'
                            : 'border-[#0A0A0B] opacity-70 hover:opacity-100'
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
            <div className="border border-[#0A0A0B] p-6 bg-[#FAFAF8] space-y-6">
              <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-3">
                <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
                  2. ATTRIBUTE MATRIX ALLOCATION
                </h2>
                <div className="font-mono text-xs">
                  <span>POINTS REMAINING: </span>
                  <span className={`font-bold px-2 py-0.5 ${remainingPoints === 0 ? 'bg-[#0A0A0B] text-[#FAFAF8]' : 'bg-[#F59E0B] text-[#0A0A0B]'}`}>
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
                    <div key={statKey} className="border border-[#E5E5E1] p-4 bg-[#F4F4F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <div className="font-headline font-bold text-lg uppercase tracking-wider text-[#0A0A0B]">
                          {labels[statKey].title}
                        </div>
                        <p className="font-sans text-xs text-[#5D5F5D]">
                          {labels[statKey].desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleStatChange(statKey, -1)}
                          disabled={val <= STAT_BUDGET.MIN_PER_STAT}
                          className="w-9 h-9 bg-[#0A0A0B] text-[#FAFAF8] font-mono font-bold text-base flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#DC2626] transition-colors"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold text-xl w-8 text-center text-[#0A0A0B]">
                          {val}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStatChange(statKey, 1)}
                          disabled={val >= STAT_BUDGET.MAX_PER_STAT || remainingPoints <= 0}
                          className="w-9 h-9 bg-[#0A0A0B] text-[#FAFAF8] font-mono font-bold text-base flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#DC2626] transition-colors"
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
            <div className="border border-[#0A0A0B] p-6 bg-[#FAFAF8] space-y-6">
              <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-3">
                <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
                  3. TACTICAL PERKS (SELECT UP TO 2)
                </h2>
                <span className="font-mono text-xs text-[#5D5F5D]">
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
                          ? 'border-2 border-[#0A0A0B] bg-[#0A0A0B] text-[#FAFAF8]'
                          : 'border-[#E5E5E1] bg-[#F4F4F0] hover:border-[#0A0A0B]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-headline font-bold text-base uppercase tracking-tight">
                          {perk.name}
                        </div>
                        <div className={`w-5 h-5 border flex items-center justify-center ${isSelected ? 'border-white bg-[#DC2626]' : 'border-[#0A0A0B]'}`}>
                          {isSelected && <FiCheck className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                      <p className={`font-sans text-xs ${isSelected ? 'text-[#FAFAF8]/80' : 'text-[#5D5F5D]'}`}>
                        {perk.description}
                      </p>
                      <div className={`font-mono text-[11px] font-bold ${isSelected ? 'text-[#F59E0B]' : 'text-[#0A0A0B]'}`}>
                        {perk.effectSummary}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Market Binding */}
            <div className="border border-[#0A0A0B] p-6 bg-[#FAFAF8] space-y-6">
              <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-3">
                <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
                  4. DREAMDEX MARKET BINDING
                </h2>
                <span className="font-mono text-xs text-[#DC2626] font-bold">EVENT CONTRACT DATA</span>
              </div>

              <p className="font-sans text-xs text-[#5D5F5D] leading-relaxed">
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
                          ? 'border-2 border-[#0A0A0B] bg-[#0A0A0B] text-[#FAFAF8]'
                          : 'border-[#E5E5E1] bg-[#F4F4F0] hover:border-[#0A0A0B]'
                      }`}
                    >
                      <div className="font-headline font-bold text-lg uppercase tracking-tight">
                        {option.label}
                      </div>
                      <div className={`font-mono text-[11px] ${isSelected ? 'text-[#FAFAF8]/70' : 'text-[#5D5F5D]'}`}>
                        {option.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right / Live Preview Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="border-2 border-[#0A0A0B] p-6 bg-[#FAFAF8] sticky top-24 space-y-6">
              <div className="flex items-center justify-between border-b border-[#0A0A0B] pb-3">
                <span className="font-headline font-bold text-xl uppercase tracking-wider">
                  BEAST HUD PREVIEW
                </span>
                <span className="font-mono text-xs text-[#DC2626] font-bold">READY TO FORGE</span>
              </div>

              <div className="relative aspect-square w-full border border-[#0A0A0B] overflow-hidden bg-zinc-900">
                <Image
                  src={selectedAvatar}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                />
                {boundAsset && (
                  <div className="absolute top-3 right-3 bg-[#0A0A0B] text-[#FAFAF8] font-mono text-xs font-bold px-3 py-1 border border-[#FAFAF8]/30">
                    {boundAsset} BOUND
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-headline font-extrabold text-3xl uppercase tracking-tight truncate">
                  {name || 'UNTITLED BEAST'}
                </h3>
                <p className="font-sans text-xs text-[#5D5F5D] line-clamp-2 mt-1">
                  {description || 'No tactical lore entered.'}
                </p>
              </div>

              {/* Stat breakdown */}
              <div className="space-y-2 border-t border-b border-[#0A0A0B] py-4 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#5D5F5D]">POWER:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-[#E5E5E1] overflow-hidden">
                      <div className="h-full bg-[#0A0A0B]" style={{ width: `${(stats.power / 10) * 100}%` }} />
                    </div>
                    <span className="font-bold w-4 text-right">{stats.power}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#5D5F5D]">DEFENSE:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-[#E5E5E1] overflow-hidden">
                      <div className="h-full bg-[#0A0A0B]" style={{ width: `${(stats.defense / 10) * 100}%` }} />
                    </div>
                    <span className="font-bold w-4 text-right">{stats.defense}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#5D5F5D]">SPEED:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-[#E5E5E1] overflow-hidden">
                      <div className="h-full bg-[#0A0A0B]" style={{ width: `${(stats.speed / 10) * 100}%` }} />
                    </div>
                    <span className="font-bold w-4 text-right">{stats.speed}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#5D5F5D]">SPECIAL:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-[#E5E5E1] overflow-hidden">
                      <div className="h-full bg-[#0A0A0B]" style={{ width: `${(stats.special / 10) * 100}%` }} />
                    </div>
                    <span className="font-bold w-4 text-right">{stats.special}</span>
                  </div>
                </div>
              </div>

              {/* Equipped Perks */}
              <div className="space-y-1.5 font-mono text-xs">
                <div className="text-[#5D5F5D] uppercase">EQUIPPED PERKS:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedPerks.length === 0 ? (
                    <span className="text-[#5D5F5D]">None selected</span>
                  ) : (
                    selectedPerks.map((pId) => {
                      const p = AVAILABLE_PERKS.find((item) => item.id === pId);
                      return (
                        <span key={pId} className="bg-[#0A0A0B] text-[#FAFAF8] px-2 py-1 text-[11px] font-bold uppercase">
                          {p?.name}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={remainingPoints < 0 || isSubmitting}
                className="w-full py-4 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-extrabold text-xl uppercase tracking-wider hover:bg-[#DC2626] transition-colors border border-[#0A0A0B] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
