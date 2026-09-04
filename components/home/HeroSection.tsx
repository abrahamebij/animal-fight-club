'use client';

import React from 'react';
import Link from 'next/link';
import { FiPlusSquare, FiCrosshair, FiActivity } from 'react-icons/fi';
import Img from '@/components/ui/Img';

export function HeroSection() {
  return (
    <section className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-16 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-divider p-6 lg:p-12 bg-background">
        <div className="lg:col-span-7 flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <div className="hero-badge inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider">
              <span className="w-2 h-2 bg-secondary" />
              <span>SOMNIA SHANNON TESTNET // AGENTIC DUEL PROTOCOL</span>
            </div>

            <h1 className="font-headline font-extrabold text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tighter uppercase text-primary">
              <span className="hero-line block">CREATE YOUR BEAST.</span>
              <span className="hero-line block">WATCH IT FIGHT.</span>
              <span className="hero-line block">BET ON THE WINNER.</span>
            </h1>

            <p className="hero-desc font-sans text-base lg:text-xl text-secondary max-w-xl leading-relaxed">
              Primal AI combat meets precision financial forecasting. Forge your agent from raw parameters, enter the pit, and let live DreamDEX Event Contract market odds power real-time combat modifiers.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href="/create"
              className="hero-cta px-8 py-4 bg-primary text-background font-headline font-bold text-lg uppercase tracking-wider hover:bg-background hover:text-primary border border-primary transition-colors inline-flex items-center gap-2"
            >
              <FiPlusSquare className="w-5 h-5" />
              <span>Create Your Beast</span>
            </Link>
            <Link 
              href="/arena"
              className="hero-cta px-8 py-4 bg-surface-container-low text-primary font-headline font-bold text-lg uppercase tracking-wider hover:bg-primary hover:text-background border border-primary transition-colors inline-flex items-center gap-2"
            >
              <FiCrosshair className="w-5 h-5" />
              <span>Enter Arena</span>
            </Link>
          </div>
        </div>

        <div className="hero-panel lg:col-span-5 flex flex-col justify-center items-center">
          <div className="w-full relative aspect-square border border-divider overflow-hidden bg-zinc-900">
            <Img
              src="/hero-beast.png"
              alt="Apex Combatant Hero"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
