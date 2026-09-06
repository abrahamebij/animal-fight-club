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
import { WalletIconRenderer, getWalletDetails } from './walletRegistry';
import Img from '@/components/ui/Img';
import gsap from 'gsap';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionIntentMessage?: string;
}

export function WalletModal({ isOpen, onClose, actionIntentMessage }: WalletModalProps) {
  const { address, isConnected, connector: activeConnector } = useAccount();
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

            {/* Connected Wallet & Network Info */}
            <div className="border border-divider p-3 bg-surface-container-low flex items-center justify-between text-[11px] text-secondary">
              <div className="flex items-center gap-2">
                <WalletIconRenderer name={activeConnector?.name} id={activeConnector?.id} size={16} />
                <span className="font-bold uppercase text-primary">
                  {activeConnector?.name || 'CONNECTED WALLET'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 ${isWrongNetwork ? 'bg-warning' : 'bg-secondary'}`} />
                <span className="font-bold uppercase text-primary">
                  {isWrongNetwork ? 'Wrong Network' : 'Somnia Shannon (50312)'}
                </span>
              </div>
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
            <div className="font-mono text-xs text-secondary flex items-center justify-between">
              <span>SELECT COMPATIBLE WEB3 PROVIDER:</span>
              <span className="text-[10px] uppercase font-bold text-primary">
                {connectors.length} DETECTED
              </span>
            </div>

            <div className="space-y-2">
              {connectors.map((connector) => {
                const wallet = getWalletDetails(connector.name, connector.id);

                return (
                  <div key={connector.uid} className="flex items-center gap-2 group">
                    <button
                      type="button"
                      onClick={() => {
                        connect({ connector });
                      }}
                      disabled={isPending}
                      className="flex-1 p-3.5 border border-divider bg-surface-container-low hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between font-headline font-bold text-base uppercase tracking-wider disabled:opacity-50 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border border-divider bg-background flex items-center justify-center p-1 group-hover:border-primary transition-colors flex-shrink-0">
                          <WalletIconRenderer
                            name={connector.name}
                            id={connector.id}
                            iconUrl={(connector as any).icon}
                            size={20}
                          />
                        </div>
                        <span className="text-primary font-bold">{connector.name}</span>
                      </div>
                      <span className="font-mono text-xs text-secondary group-hover:text-primary transition-colors">
                        {isPending ? 'CONNECTING...' : 'INITIALIZE'}
                      </span>
                    </button>

                    {wallet.link && (
                      <a
                        href={wallet.link}
                        target="_blank"
                        rel="noreferrer"
                        title={`Visit ${wallet.name} official website`}
                        className="p-3.5 border border-divider bg-surface-container-low hover:border-primary hover:text-primary text-secondary transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
                      >
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="border border-warning bg-warning/10 p-3 font-mono text-xs text-primary">
                {error.message}
              </div>
            )}

            {/* Quick links to popular Web3 wallets */}
            <div className="border-t border-divider pt-3 space-y-2">
              <div className="font-mono text-[10px] text-secondary uppercase tracking-wider">
                GET A COMPATIBLE WEB3 WALLET:
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'MetaMask', key: 'metamask' },
                  { name: 'Brave', key: 'brave' },
                  { name: 'Coinbase', key: 'coinbase' },
                  { name: 'Rabby', key: 'rabby' },
                ].map((item) => {
                  const info = getWalletDetails(item.key);
                  return (
                    <a
                      key={item.key}
                      href={info.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border border-divider bg-surface-container-low hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1.5 text-center font-mono text-[10px] text-secondary hover:text-primary"
                    >
                      <WalletIconRenderer name={item.key} size={20} />
                      <span className="truncate w-full font-bold uppercase">{item.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="font-mono text-[11px] text-secondary border-t border-divider pt-3 leading-relaxed">
              By connecting, you agree to access Somnia Shannon testnet contract environments. Open spectator features do not require connection.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
