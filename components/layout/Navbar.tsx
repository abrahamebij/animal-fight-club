'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiCrosshair, 
  FiPlusSquare, 
  FiAward, 
  FiGrid, 
  FiUser
} from 'react-icons/fi';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import Img from '@/components/ui/Img';

const NAV_ITEMS = [
  { label: 'ARENA', href: '/arena', icon: FiCrosshair },
  { label: 'CREATE BEAST', href: '/create', icon: FiPlusSquare },
  { label: 'LEADERBOARD', href: '/leaderboard', icon: FiAward },
  { label: 'DASHBOARD', href: '/dashboard', icon: FiGrid },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-divider divider-ash">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-16 flex items-center justify-between">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-10">
          <Link 
            href="/" 
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 relative flex items-center justify-center overflow-hidden flex-shrink-0">
              <Img 
                src="/logo.png" 
                alt="Animal Fight Club Logo" 
                className="w-8 h-8 object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <span className="font-headline font-extrabold text-2xl tracking-tighter uppercase text-primary">
              ANIMAL FIGHT CLUB
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors border ${
                    isActive 
                      ? 'bg-primary text-background border-primary' 
                      : 'text-secondary border-transparent hover:text-primary hover:border-divider'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action / Wallet Status Area */}
        <div className="flex items-center gap-3">
          {/* <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 border border-neutral bg-surface-container-low text-[11px] font-mono text-secondary">
            <div className="w-2 h-2 bg-secondary" />
            <span>SOMNIA 50312</span>
          </div> */}

          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
