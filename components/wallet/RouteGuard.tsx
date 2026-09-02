'use client';

import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { FiLock, FiShield, FiArrowLeft } from 'react-icons/fi';
import { useWalletGate } from '@/components/wallet/useWalletGate';
import Img from '@/components/ui/Img';

interface RouteGuardProps {
  children: React.ReactNode;
  routeName?: string;
}

export function RouteGuard({ children, routeName = 'PROTECTED PROTOCOL ROUTE' }: RouteGuardProps) {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { requireAuth } = useWalletGate();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Loading state while wagmi hydrates connection
  if (!hasMounted || isConnecting || isReconnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-background text-foreground font-mono text-sm space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin" />
        <p className="uppercase tracking-widest text-secondary text-xs">
          VERIFYING SOMNIA WALLET AUTHENTICATION...
        </p>
      </div>
    );
  }

  // If not connected, render the inline connect-wallet view directly on this page without kicking the user away
  if (!isConnected) {
    return (
      <div className="max-w-[1440px] mx-auto w-full px-4 lg:px-10 py-24 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 relative flex items-center justify-center overflow-hidden flex-shrink-0 mb-2">
          <Img 
            src="/logo.png" 
            alt="Animal Fight Club Logo" 
            className="w-16 h-16 object-contain"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-background font-mono text-xs uppercase tracking-wider">
          <FiLock className="w-3.5 h-3.5" />
          <span>AUTHENTICATION REQUIRED</span>
        </div>

        <h1 className="font-headline font-extrabold text-4xl sm:text-5xl uppercase tracking-tight text-primary max-w-xl">
          CONNECT WALLET TO ACCESS {routeName}
        </h1>

        <p className="font-mono text-xs text-secondary max-w-md leading-relaxed">
          Connect your Web3 wallet on Somnia Shannon testnet to unlock this terminal. Your session will activate automatically once connected.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => {
              requireAuth({
                actionTitle: `access ${routeName}`,
                onSuccess: () => {},
              });
            }}
            className="px-8 py-4 bg-primary text-background font-headline font-bold text-sm uppercase tracking-wider hover:bg-neutral hover:text-primary transition-colors border-2 border-primary flex items-center gap-2"
          >
            <FiShield className="w-4 h-4" />
            <span>Connect Wallet on Somnia</span>
          </button>

          <Link
            href="/"
            className="px-8 py-4 bg-surface-container-low text-primary font-headline font-bold text-sm uppercase tracking-wider hover:bg-primary hover:text-background transition-colors border border-primary flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Return to Landing</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
