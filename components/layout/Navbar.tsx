'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiCrosshair, 
  FiPlusSquare, 
  FiAward, 
  FiGrid, 
  FiUser, 
  FiActivity,
  FiShield
} from 'react-icons/fi';

const NAV_ITEMS = [
  { label: 'ARENA', href: '/arena', icon: FiCrosshair },
  { label: 'CREATE BEAST', href: '/create', icon: FiPlusSquare },
  { label: 'LEADERBOARD', href: '/leaderboard', icon: FiAward },
  { label: 'DASHBOARD', href: '/dashboard', icon: FiGrid },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8] border-b border-[#0A0A0B]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-16 flex items-center justify-between">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-10">
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-[#0A0A0B] flex items-center justify-center text-[#FAFAF8] font-headline font-bold text-lg group-hover:bg-[#DC2626] transition-colors">
              <FiShield className="w-4 h-4" />
            </div>
            <span className="font-headline font-extrabold text-2xl tracking-tighter uppercase text-[#0A0A0B]">
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
                      ? 'bg-[#0A0A0B] text-[#FAFAF8] border-[#0A0A0B]' 
                      : 'text-[#5D5F5D] border-transparent hover:text-[#0A0A0B] hover:border-[#0A0A0B]'
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
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 border border-[#E5E5E1] bg-[#F4F4F0] text-[11px] font-mono text-[#5D5F5D]">
            <div className="w-2 h-2 bg-[#F59E0B]" />
            <span>SOMNIA 50312</span>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0B] text-[#FAFAF8] font-headline font-bold text-sm uppercase tracking-wider hover:bg-[#FAFAF8] hover:text-[#0A0A0B] border border-[#0A0A0B] transition-colors"
          >
            <FiUser className="w-3.5 h-3.5" />
            <span>TERMINAL</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
