'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiCrosshair, 
  FiPlusSquare, 
  FiAward, 
  FiGrid, 
  FiMenu,
  FiX
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-divider">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-16 flex items-center justify-between gap-2">
          {/* Brand & Wordmark */}
          <div className="flex items-center gap-6 lg:gap-10 min-w-0">
            <Link 
              href="/" 
              className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-8 h-8 relative flex items-center justify-center overflow-hidden flex-shrink-0">
                <Img 
                  src="/logo.png" 
                  alt="Animal Fight Club Logo" 
                  className="w-8 h-8 object-contain transition-transform"
                  priority
                />
              </div>
              <span className="font-headline font-extrabold text-lg sm:text-xl md:text-2xl tracking-tighter uppercase text-primary whitespace-nowrap">
                ANIMAL FIGHT CLUB
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
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

          {/* Action / Wallet Status Area + Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <ConnectButton />

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden flex items-center justify-center w-9 h-9 border border-divider bg-surface-container-low text-primary hover:bg-primary hover:text-background transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-divider bg-background px-4 py-4 space-y-3">
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-wider transition-colors border ${
                      isActive 
                        ? 'bg-primary text-background border-primary font-bold' 
                        : 'bg-surface-container-low text-primary border-divider hover:bg-neutral'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-divider flex items-center justify-between text-[11px] font-mono text-secondary">
              <span>NETWORK</span>
              <span className="tracking-wider">SOMNIA TESTNET • 50312</span>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
