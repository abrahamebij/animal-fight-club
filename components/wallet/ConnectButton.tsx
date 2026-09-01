'use client';

import React, { useState } from 'react';
import { useAccount, useChainId, useBalance } from 'wagmi';
import { FiUser, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { somniaShannon } from '@/lib/config/wagmi';
import { WalletModal } from './WalletModal';

import { formatBalance, truncateAddress } from '@/lib/utils/format';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ 
    address, 
    chainId: somniaShannon.id 
  });
  const [modalOpen, setModalOpen] = useState(false);

  const isWrongNetwork = isConnected && chainId !== somniaShannon.id;

  return (
    <>
      <div className="flex items-center gap-2">
        {isConnected && address ? (
          <button
            onClick={() => setModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 border transition-colors font-mono text-xs ${
              isWrongNetwork
                ? 'bg-warning text-primary border-warning font-bold'
                : 'bg-surface-container-low text-primary border-primary hover:bg-primary hover:text-background'
            }`}
          >
            {isWrongNetwork ? (
              <>
                <FiAlertTriangle className="w-3.5 h-3.5 text-primary" />
                <span className="font-headline font-bold text-xs uppercase">WRONG NETWORK</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-secondary" />
                <span className="font-headline font-bold text-sm tracking-wider uppercase">
                  {truncateAddress(address)}
                </span>
                <span className="hidden md:inline font-mono text-[11px] opacity-70">
                  ({formatBalance(balance, 2)})
                </span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-background font-headline font-bold text-sm uppercase tracking-wider hover:bg-background hover:text-primary border border-primary transition-colors"
          >
            <FiUser className="w-3.5 h-3.5" />
            <span>CONNECT WALLET</span>
          </button>
        )}
      </div>

      <WalletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
