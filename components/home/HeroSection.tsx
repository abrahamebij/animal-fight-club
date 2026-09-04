'use client';

import React, { useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import { FiPlusSquare, FiCrosshair } from 'react-icons/fi';
import gsap from 'gsap';

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-badge', { opacity: 0, y: -16, duration: 0.5 })
        .from('.hero-line', { opacity: 0, y: 48, duration: 0.7, stagger: 0.12 }, '-=0.2')
        .from('.hero-desc', { opacity: 0, y: 24, duration: 0.5 }, '-=0.3')
        .from('.hero-cta', { opacity: 0, y: 20, duration: 0.4, stagger: 0.1 }, '-=0.2')
        .from('.hero-panel', { opacity: 0, x: 60, duration: 0.7, ease: 'power2.out' }, '-=0.6');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 pt-16 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-divider p-6 lg:p-12 bg-background">
        <div className="lg:col-span-7 flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <div className="hero-badge inline-flex items-center gap-2 px-2.5 py-0.5 bg-primary text-background font-mono text-[11px] uppercase tracking-wider">
              <span className="w-2 h-2 bg-secondary" />
              <span>SOMNIA SHANNON TESTNET - AGENTIC COMBAT PROTOCOL</span>
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

        <div className="hero-panel lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full aspect-video overflow-hidden bg-zinc-900 border border-divider">
            <video
              src="/hero-animation.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
