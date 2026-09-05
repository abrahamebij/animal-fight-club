'use client';

import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain, useBalance } from 'wagmi';
import { 
  FiX, 
  FiCopy, 
  FiCheck, 
  FiLogOut, 
  FiShield, 
  FiAlertTriangle, 
  FiExternalLink,
  FiActivity
} from 'react-icons/fi';
import { somniaShannon } from '@/lib/config/wagmi';
import { formatBalance } from '@/lib/utils/format';
import Img from '@/components/ui/Img';
import gsap from 'gsap';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionIntentMessage?: string;
}

export function WalletModal({ isOpen, onClose, actionIntentMessage }: WalletModalProps) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ 
    address, 
    chainId: somniaShannon.id 
  });

  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Animate in on open
  useLayoutEffect(() => {
    if (!isOpen || !panelRef.current) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, scale: 0.94, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power3.out' }
    );
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isWrongNetwork = isConnected && chainId !== somniaShannon.id;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div 
        ref={panelRef}
        className="w-full max-w-md bg-background border border-divider shadow-2xl p-6 relative flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-divider pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 relative flex items-center justify-center overflow-hidden flex-shrink-0">
              <Img 
                src="/logo.png" 
                alt="Animal Fight Club Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-headline font-extrabold text-xl uppercase tracking-wider text-primary">
              {isConnected ? 'TERMINAL WALLET - AUTHENTICATED' : 'CONNECT WALLET TO ACCESS'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-divider hover:bg-primary hover:text-background transition-colors text-primary"
            aria-label="Close modal"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Action Gate Prompt if triggered by gated action */}
        {actionIntentMessage && (
          <div className="border border-divider bg-surface-container-low p-3 font-mono text-xs text-secondary space-y-1">
            <div className="flex items-center gap-1.5 font-bold uppercase text-primary">
              <FiActivity className="w-3.5 h-3.5" />
              <span>AUTHENTICATION REQUIRED</span>
            </div>
            <p className="font-sans text-xs">
              {actionIntentMessage}
            </p>
          </div>
        )}

        {/* Wrong Network Warning */}
        {isWrongNetwork && (
          <div className="border border-warning bg-warning/10 p-4 font-mono text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-primary">
              <FiAlertTriangle className="w-4 h-4 text-warning" />
              <span>UNSUPPORTED NETWORK DETECTED</span>
            </div>
            <p className="text-secondary font-sans text-xs">
              Please switch to Somnia Shannon Testnet (Chain ID 50312) to execute on-chain actions.
            </p>
            <button
              onClick={() => switchChain({ chainId: somniaShannon.id })}
              className="w-full py-2.5 bg-primary text-background font-headline font-bold text-xs uppercase tracking-wider hover:bg-secondary transition-colors"
            >
              Switch to Somnia Shannon (50312)
            </button>
          </div>
        )}

        {/* Connected State View */}
        {isConnected && address ? (
          <div className="space-y-4 font-mono text-xs">
            {/* Account Card */}
            <div className="border border-divider bg-surface-container-low p-4 space-y-3">
              <div className="flex justify-between items-center text-secondary">
                <span>AUTHENTICATED ADDRESS</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-primary hover:underline font-bold"
                >
                  {copied ? (
                    <>
                      <FiCheck className="w-3.5 h-3.5" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-3.5 h-3.5" />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>

              <div className="font-headline font-bold text-lg text-primary tracking-wider break-all">
                {address}
              </div>

              <div className="flex justify-between items-center border-t border-divider pt-2">
                <span className="text-secondary">NATIVE BALANCE</span>
                <span className="font-bold text-primary">
                  {formatBalance(balance, 4)}
                </span>
              </div>
            </div>

            {/* Network Info */}
            <div className="border border-divider p-3 bg-surface-container-low flex items-center justify-between text-[11px] text-secondary">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 ${isWrongNetwork ? 'bg-warning' : 'bg-secondary'}`} />
                <span className="font-bold uppercase text-primary">
                  {isWrongNetwork ? 'Wrong Network' : 'Somnia Shannon Testnet'}
                </span>
              </div>
              <a
                href={`https://shannon-explorer.somnia.network/address/${address}`}
                target="_blank"
                rel="noreferrer"
                className="underline inline-flex items-center gap-1 hover:text-primary"
              >
                <span>Explorer</span>
                <FiExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Disconnect CTA */}
            <button
              onClick={() => {
                disconnect();
                onClose();
              }}
              className="w-full py-3 bg-surface-container-low border border-primary text-primary font-headline font-bold text-sm uppercase tracking-wider hover:bg-primary hover:text-background transition-colors flex items-center justify-center gap-2"
            >
              <FiLogOut className="w-4 h-4" />
              <span>DISCONNECT TERMINAL</span>
            </button>
          </div>
        ) : (
          /* Disconnected Connector List */
          <div className="space-y-4">
            <div className="font-mono text-xs text-secondary">
              SELECT COMPATIBLE WEB3 PROVIDER:
            </div>

            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector });
                  }}
                  disabled={isPending}
                  className="w-full p-4 border border-divider bg-surface-container-low hover:bg-primary hover:text-background transition-colors flex items-center justify-between font-headline font-bold text-base uppercase tracking-wider disabled:opacity-50 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <FiShield className="w-5 h-5 text-primary group-hover:text-background transition-colors" />
                    <span>{connector.name}</span>
                  </div>
                  <span className="font-mono text-xs opacity-70 group-hover:opacity-100">
                    {isPending ? 'CONNECTING...' : 'INITIALIZE'}
                  </span>
                </button>
              ))}
            </div>

            {error && (
              <div className="border border-warning bg-warning/10 p-3 font-mono text-xs text-primary">
                {error.message}
              </div>
            )}

            <div className="font-mono text-[11px] text-secondary border-t border-divider pt-3 leading-relaxed">
              By connecting, you agree to access Somnia Shannon testnet contract environments. Open spectator features do not require connection.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
