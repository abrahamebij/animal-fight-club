'use client';

import React from 'react';
import { useLiveBattle } from '@/hooks/useBattles';
import { useBeasts } from '@/hooks/useBeasts';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedLiveDuel } from '@/components/home/FeaturedLiveDuel';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TopCombatantsSection } from '@/components/home/TopCombatantsSection';

export default function HomePage() {
  const { data: liveBattle } = useLiveBattle();
  const { data: beasts = [] } = useBeasts();

  return (
    <div className="flex flex-col w-full bg-background min-h-screen text-foreground">
      <HeroSection />
      {liveBattle && <FeaturedLiveDuel battle={liveBattle} />}
      <FeaturesSection />
      {beasts.length > 0 && <TopCombatantsSection beasts={beasts} />}
    </div>
  );
}
