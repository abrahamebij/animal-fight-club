'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { somniaShannon } from '@/lib/config/wagmi';
import { WalletModal } from './WalletModal';

interface WalletGateContextType {
  requireAuth: (options: { actionTitle: string; onSuccess: () => void }) => void;
}

const WalletGateContext = createContext<WalletGateContextType | null>(null);

export function WalletGateProvider({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  const [modalOpen, setModalOpen] = useState(false);
  const [intentMessage, setIntentMessage] = useState<string>('');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  // Automatically execute pending gated action callback upon successful connection to Somnia Shannon
  useEffect(() => {
    if (isConnected && chainId === somniaShannon.id && pendingCallback) {
      const cb = pendingCallback;
      setPendingCallback(null);
      setModalOpen(false);
      setIntentMessage('');
      cb();
    }
  }, [isConnected, chainId, pendingCallback]);

  const requireAuth = useCallback(
    ({ actionTitle, onSuccess }: { actionTitle: string; onSuccess: () => void }) => {
      if (!isConnected || chainId !== somniaShannon.id) {
        setIntentMessage(`Connect your Web3 wallet on Somnia Shannon to ${actionTitle}.`);
        setPendingCallback(() => onSuccess);
        setModalOpen(true);
      } else {
        onSuccess();
      }
    },
    [isConnected, chainId]
  );

  const handleClose = () => {
    setModalOpen(false);
    setIntentMessage('');
    setPendingCallback(null);
  };

  return (
    <WalletGateContext.Provider value={{ requireAuth }}>
      {children}
      <WalletModal
        isOpen={modalOpen}
        onClose={handleClose}
        actionIntentMessage={intentMessage}
      />
    </WalletGateContext.Provider>
  );
}

export function useWalletGate() {
  const context = useContext(WalletGateContext);
  if (!context) {
    throw new Error('useWalletGate must be used within a WalletGateProvider');
  }
  return context;
}
