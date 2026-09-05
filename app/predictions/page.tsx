'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FiTrendingUp, 
  FiClock, 
  FiExternalLink, 
  FiDollarSign, 
  FiRefreshCw, 
  FiCheck, 
  FiAlertCircle, 
  FiArrowUpRight, 
  FiArrowDownRight,
  FiX,
  FiCopy
} from 'react-icons/fi';
import { useAccount } from 'wagmi';
import { 
  useLivePredictionMarkets, 
  useUserPredictions, 
  useTUsdcBalance, 
  useClaimFaucetMutation, 
  usePlacePredictionMutation 
} from '@/hooks/usePredictions';
import { LiveEventMarket, EventPrediction } from '@/lib/types';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { toast } from 'sonner';

export default function PredictionsPage() {
  const { address, isConnected } = useAccount();

  const { data: markets = [], isLoading: loadingMarkets, refetch: refetchMarkets } = useLivePredictionMarkets();
  const { data: userPredictions = [], isLoading: loadingHistory } = useUserPredictions(address);
  const { data: tUsdcBalance = '0.00' } = useTUsdcBalance(address);

  const claimFaucetMutation = useClaimFaucetMutation();
  const placePredictionMutation = usePlacePredictionMutation();

  const [selectedMarket, setSelectedMarket] = useState<LiveEventMarket | null>(null);
  const [selectedSide, setSelectedSide] = useState<'UP' | 'DOWN'>('UP');
  const [stakeAmount, setStakeAmount] = useState<string>('10');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<{
    txHash: string;
    orderId?: string;
    prediction: EventPrediction;
  } | null>(null);

  const handleOpenOrder = (market: LiveEventMarket, side: 'UP' | 'DOWN') => {
    setSelectedMarket(market);
    setSelectedSide(side);
    setOrderReceipt(null);
    setCopiedTx(false);
    setIsDrawerOpen(true);
  };

  const handleClaimFaucet = () => {
    if (!isConnected) {
      toast.error('Wallet Required', { description: 'Please connect your wallet first.' });
      return;
    }
    claimFaucetMutation.mutate(1000);
  };

  const handleCopyTx = (tx: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(tx);
      setCopiedTx(true);
      toast.success('Tx Hash Copied to Clipboard');
      setTimeout(() => setCopiedTx(false), 2000);
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMarket || !isConnected) return;

    const amount = Number(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid Stake Amount', { description: 'Please enter an amount greater than 0.' });
      return;
    }

    const currentBal = Number(tUsdcBalance);
    if (currentBal < amount) {
      toast.error('Insufficient tUSDC Balance', { 
        description: 'Use the "Claim 1,000 tUSDC Faucet" button above to get testnet funds.' 
      });
      return;
    }

    try {
      const result = await placePredictionMutation.mutateAsync({
        market: selectedMarket,
        side: selectedSide,
        stakeAmount: amount,
      });
      setOrderReceipt(result);
    } catch {
      // Error handled by mutation toast
    }
  };

  const btcMarkets = markets.filter((m) => m.asset === 'BTC');
  const ethMarkets = markets.filter((m) => m.asset === 'ETH');

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-28 px-4 lg:px-10">
      <div className="max-w-[1440px] mx-auto space-y-10">
        
        {/* Page Header */}
        <section className="border-b border-divider pb-8 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-surface-container-low border border-divider text-xs font-mono uppercase tracking-wider text-secondary">
              <FiTrendingUp className="w-3.5 h-3.5 text-primary" />
              <span>DREAMDEX PROTOCOL • WRITE-PATH PROOF FEATURE</span>
            </div>
            <h1 className="font-headline font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-primary">
              EVENT PREDICTIONS
            </h1>
            <p className="font-sans text-sm sm:text-base text-secondary max-w-2xl leading-relaxed">
              Place real Immediate-Or-Cancel (IOC) orders on live Somnia DreamDEX Up/Down event contract windows using testnet tUSDC collateral.
            </p>
          </div>

          {/* Faucet & Balance Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="border border-divider bg-surface-container-low px-4 py-2.5 font-mono text-xs">
              <span className="text-secondary block text-[10px] uppercase">YOUR tUSDC COLLATERAL</span>
              <span className="font-bold text-base text-primary">{tUsdcBalance} tUSDC</span>
            </div>

            <button
              type="button"
              onClick={handleClaimFaucet}
              disabled={claimFaucetMutation.isPending}
              className="px-4 py-3 bg-primary text-background font-headline font-bold text-xs uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {claimFaucetMutation.isPending ? (
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FiDollarSign className="w-3.5 h-3.5" />
              )}
              <span>{claimFaucetMutation.isPending ? 'MINTING...' : 'MINT 1,000 tUSDC'}</span>
            </button>
          </div>
        </section>

        {/* Live Windows Header Bar */}
        <div className="flex items-center justify-between border-b border-divider pb-3">
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4 text-primary" />
            <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
              LIVE EVENT CONTRACT WINDOWS
            </h2>
          </div>
          <button
            onClick={() => refetchMarkets()}
            className="font-mono text-xs text-secondary hover:text-primary flex items-center gap-1.5 cursor-pointer"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loadingMarkets ? 'animate-spin' : ''}`} />
            <span>REFRESH ODDS</span>
          </button>
        </div>

        {/* Markets Grid */}
        {loadingMarkets && markets.length === 0 ? (
          <div className="p-12 text-center border border-divider font-mono text-xs text-secondary animate-pulse">
            LOADING LIVE DREAMDEX EVENT CONTRACTS...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BTC Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-xs font-bold border-b border-divider pb-2 text-primary">
                <span>BITCOIN (BTC/USDso)</span>
                <span className="text-secondary">{btcMarkets.length} ACTIVE WINDOWS</span>
              </div>
              <div className="space-y-4">
                {btcMarkets.map((m) => (
                  <MarketCard key={m.marketId} market={m} onPredict={handleOpenOrder} />
                ))}
                {btcMarkets.length === 0 && (
                  <div className="p-6 border border-divider text-center font-mono text-xs text-secondary">
                    No active BTC windows available at this moment.
                  </div>
                )}
              </div>
            </div>

            {/* ETH Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-xs font-bold border-b border-divider pb-2 text-primary">
                <span>ETHEREUM (ETH/USDso)</span>
                <span className="text-secondary">{ethMarkets.length} ACTIVE WINDOWS</span>
              </div>
              <div className="space-y-4">
                {ethMarkets.map((m) => (
                  <MarketCard key={m.marketId} market={m} onPredict={handleOpenOrder} />
                ))}
                {ethMarkets.length === 0 && (
                  <div className="p-6 border border-divider text-center font-mono text-xs text-secondary">
                    No active ETH windows available at this moment.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Prediction History Section */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-headline font-bold text-xl uppercase tracking-tight">
                YOUR DREAMDEX PREDICTION ORDERS
              </h2>
            </div>
            <span className="font-mono text-xs text-secondary">REAL-TIME SETTLEMENT AUDIT</span>
          </div>

          {!isConnected ? (
            <div className="p-8 border border-divider bg-surface-container-low text-center space-y-3 font-mono text-xs text-secondary">
              <p>Connect your wallet to track your DreamDEX event contract predictions.</p>
              <div className="inline-block">
                <ConnectButton />
              </div>
            </div>
          ) : userPredictions.length === 0 ? (
            <div className="p-8 border border-divider bg-surface-container-low text-center font-mono text-xs text-secondary">
              You have not placed any prediction orders yet. Select a live window above to submit an IOC order.
            </div>
          ) : (
            <div className="border border-divider bg-background overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-divider bg-surface-container-low text-secondary uppercase">
                    <th className="p-4">ASSET / WINDOW</th>
                    <th className="p-4">SIDE</th>
                    <th className="p-4">STAKE</th>
                    <th className="p-4">PRICE</th>
                    <th className="p-4">ORDER STATUS</th>
                    <th className="p-4">WINDOW STATUS</th>
                    <th className="p-4">TX & MARKET</th>
                    <th className="p-4 text-right">OUTCOME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {userPredictions.map((pred) => (
                    <tr key={pred.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-primary">{pred.asset}/USDso</div>
                        <div className="text-[10px] text-secondary">{pred.cadence}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                            pred.side === 'UP'
                              ? 'bg-primary text-background'
                              : 'border border-primary text-primary'
                          }`}
                        >
                          {pred.side}
                        </span>
                      </td>
                      <td className="p-4 font-bold">{pred.stakeAmount} tUSDC</td>
                      <td className="p-4">{pred.price ? pred.price.toFixed(2) : '0.50'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 font-bold text-[10px] uppercase bg-surface-container-low border border-divider text-secondary">
                          {pred.status} (IOC)
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[11px] uppercase">
                          {pred.marketStatus === 1
                            ? 'Trading (Open)'
                            : pred.marketStatus === 2
                            ? 'Locked (Resolving)'
                            : pred.marketStatus === 4 || pred.isResolved
                            ? 'Resolved'
                            : 'Settling'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {pred.txHash ? (
                            <a
                              href={`https://shannon-explorer.somnia.network/tx/${pred.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 font-bold text-[11px]"
                              title="View Transaction on Shannon Explorer"
                            >
                              <span>Tx: {pred.txHash.slice(0, 6)}...{pred.txHash.slice(-4)}</span>
                              <FiExternalLink className="w-2.5 h-2.5 text-primary" />
                            </a>
                          ) : (
                            <span className="text-secondary text-[10px]">—</span>
                          )}
                          <div className="flex items-center gap-2 text-[10px]">
                            {pred.poolAddress && (
                              <a
                                href={`https://shannon-explorer.somnia.network/address/${pred.poolAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:text-primary flex items-center gap-0.5"
                                title="View Binary Pool Contract on Explorer"
                              >
                                <span>Pool</span>
                                <FiExternalLink className="w-2 h-2" />
                              </a>
                            )}
                            {pred.oracleQuestionId && (
                              <a
                                href={`https://prd.oracle.somnia.host/questions/${pred.oracleQuestionId}?view=graph`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:text-primary flex items-center gap-0.5"
                                title="View Oracle Settlement Graph"
                              >
                                <span>Oracle</span>
                                <FiExternalLink className="w-2 h-2" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {pred.isResolved ? (
                          pred.isCorrect ? (
                            <span className="px-2 py-1 bg-primary/10 border border-primary text-primary font-bold text-[10px] uppercase">
                              WON
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-surface-container-low text-secondary text-[10px] uppercase">
                              LOST
                            </span>
                          )
                        ) : (
                          <span className="text-secondary text-[10px] uppercase">PENDING</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>

      {/* Place Order Drawer / Modal */}
      {isDrawerOpen && selectedMarket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-background border border-divider p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-divider pb-3">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono text-secondary uppercase">
                  {orderReceipt ? 'PREDICTION ORDER RECEIPT' : 'CONFIRM EVENT PREDICTION ORDER'}
                </div>
                <h3 className="font-headline font-extrabold text-xl uppercase tracking-tight text-primary">
                  {selectedMarket.symbol}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrderReceipt(null);
                  setIsDrawerOpen(false);
                }}
                className="p-1.5 border border-divider hover:bg-surface-container-low transition-colors text-secondary hover:text-primary cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {orderReceipt ? (
              <div className="space-y-5 font-mono text-xs">
                <div className="p-4 bg-surface-container-low border border-divider space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary text-[10px] uppercase">ORDER STATUS</span>
                    <span className="px-2 py-0.5 bg-primary text-background font-bold text-[10px] uppercase flex items-center gap-1">
                      <FiCheck className="w-3 h-3" />
                      <span>CONFIRMED ON-CHAIN</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary text-[10px] uppercase">PREDICTION SIDE</span>
                    <span
                      className={`px-2 py-0.5 font-bold uppercase text-[11px] ${
                        orderReceipt.prediction.side === 'UP'
                          ? 'bg-primary text-background'
                          : 'border border-primary text-primary'
                      }`}
                    >
                      {orderReceipt.prediction.side} ({orderReceipt.prediction.symbol})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary text-[10px] uppercase">STAKE AMOUNT</span>
                    <span className="font-bold text-primary text-sm">{orderReceipt.prediction.stakeAmount} tUSDC</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary text-[10px] uppercase">EXECUTED PRICE</span>
                    <span className="font-bold text-primary">{orderReceipt.prediction.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* On-chain Verification Box */}
                <div className="p-4 border border-divider bg-background space-y-3">
                  <div className="text-[10px] text-secondary uppercase font-bold tracking-wider">
                    TRANSACTION & MARKET VERIFICATION
                  </div>

                  {orderReceipt.txHash && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-secondary uppercase">TRANSACTION HASH</span>
                        <button
                          type="button"
                          onClick={() => handleCopyTx(orderReceipt.txHash)}
                          className="text-[10px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FiCopy className="w-2.5 h-2.5" />
                          <span>{copiedTx ? 'COPIED' : 'COPY'}</span>
                        </button>
                      </div>
                      <a
                        href={`https://shannon-explorer.somnia.network/tx/${orderReceipt.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-primary hover:underline flex items-center gap-1.5 break-all text-[11px]"
                        title="View on Somnia Shannon Explorer"
                      >
                        <span>{orderReceipt.txHash}</span>
                        <FiExternalLink className="w-3.5 h-3.5 shrink-0 text-primary" />
                      </a>
                    </div>
                  )}

                  {orderReceipt.prediction.poolAddress && (
                    <div className="space-y-1 pt-2 border-t border-divider">
                      <span className="text-[10px] text-secondary uppercase block">DREAMDEX BINARY POOL CONTRACT</span>
                      <a
                        href={`https://shannon-explorer.somnia.network/address/${orderReceipt.prediction.poolAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:text-primary flex items-center gap-1.5 break-all text-[11px]"
                        title="View Contract on Explorer"
                      >
                        <span>{orderReceipt.prediction.poolAddress}</span>
                        <FiExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}

                  {selectedMarket.oracleQuestionId && (
                    <div className="space-y-1 pt-2 border-t border-divider">
                      <span className="text-[10px] text-secondary uppercase block">SOMNIA ORACLE RESOLUTION GRAPH</span>
                      <a
                        href={`https://prd.oracle.somnia.host/questions/${selectedMarket.oracleQuestionId}?view=graph`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:text-primary flex items-center gap-1.5 text-[11px]"
                        title="View Settlement Graph"
                      >
                        <span>Verify Oracle Resolution Graph</span>
                        <FiExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  {orderReceipt.txHash && (
                    <a
                      href={`https://shannon-explorer.somnia.network/tx/${orderReceipt.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-primary text-background font-headline font-bold text-xs uppercase tracking-wider hover:bg-secondary transition-colors border border-primary text-center flex items-center justify-center gap-1.5 cursor-pointer block"
                    >
                      <span>VIEW TRANSACTION ON EXPLORER</span>
                      <FiExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setOrderReceipt(null);
                      setIsDrawerOpen(false);
                    }}
                    className="w-full py-2.5 bg-surface-container-low text-primary font-headline font-bold text-xs uppercase tracking-wider hover:bg-surface-container transition-colors border border-divider text-center cursor-pointer block"
                  >
                    RETURN TO PREDICTION MARKETS
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmOrder} className="space-y-5 font-mono text-xs">
                {/* Side Selection */}
                <div>
                  <label className="block text-secondary text-[10px] uppercase mb-2">PREDICTED OUTCOME</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSide('UP')}
                      className={`p-3 border font-headline font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        selectedSide === 'UP'
                          ? 'bg-primary text-background border-primary'
                          : 'bg-surface-container-low text-primary border-divider hover:border-primary'
                      }`}
                    >
                      <FiArrowUpRight className="w-4 h-4" />
                      <span>UP ({Math.round(selectedMarket.upOdds * 100)}%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSide('DOWN')}
                      className={`p-3 border font-headline font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        selectedSide === 'DOWN'
                          ? 'bg-primary text-background border-primary'
                          : 'bg-surface-container-low text-primary border-divider hover:border-primary'
                      }`}
                    >
                      <FiArrowDownRight className="w-4 h-4" />
                      <span>DOWN ({Math.round(selectedMarket.downOdds * 100)}%)</span>
                    </button>
                  </div>
                </div>

                {/* Stake Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-secondary text-[10px] uppercase">STAKE AMOUNT (tUSDC)</label>
                    <span className="text-secondary text-[10px]">
                      BALANCE: <strong className="text-primary">{tUsdcBalance}</strong>
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full bg-surface-container-low border border-divider p-3 font-bold text-base text-primary focus:outline-none"
                    placeholder="10"
                  />
                  <div className="flex gap-2 pt-2">
                    {['10', '50', '100', '250'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setStakeAmount(preset)}
                        className="px-2.5 py-1 bg-surface-container-low border border-divider text-[10px] hover:border-primary transition-colors text-secondary hover:text-primary cursor-pointer"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Execution Details */}
                <div className="p-3 bg-surface-container-low border border-divider space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-secondary">ORDER TYPE</span>
                    <span className="font-bold text-primary">IMMEDIATE-OR-CANCEL (IOC)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">ESTIMATED PRICE</span>
                    <span className="font-bold text-primary">
                      {selectedSide === 'UP' ? selectedMarket.upOdds.toFixed(2) : selectedMarket.downOdds.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">COLLATERAL</span>
                    <span className="font-bold text-primary">tUSDC (6 Decimals)</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={placePredictionMutation.isPending}
                  className="w-full py-3.5 bg-primary text-background font-headline font-extrabold text-base uppercase tracking-wider hover:bg-secondary transition-colors border border-primary disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {placePredictionMutation.isPending ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiCheck className="w-4 h-4" />
                  )}
                  <span>
                    {placePredictionMutation.isPending
                      ? 'CONFIRMING ORDER...'
                      : `SUBMIT ${selectedSide} PREDICTION`}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MarketCard({
  market,
  onPredict,
}: {
  market: LiveEventMarket;
  onPredict: (market: LiveEventMarket, side: 'UP' | 'DOWN') => void;
}) {
  const upPercent = Math.round(market.upOdds * 100);
  const downPercent = 100 - upPercent;
  const minutesLeft = Math.max(0, Math.floor(market.secondsLeft / 60));
  const secondsMod = Math.max(0, market.secondsLeft % 60);

  return (
    <div className="border border-divider p-5 bg-surface-container-low space-y-4 font-mono text-xs">
      <div className="flex items-start justify-between border-b border-divider pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-headline font-extrabold text-lg uppercase text-primary">
              {market.symbol}
            </span>
            <span className="px-2 py-0.5 bg-primary text-background text-[10px] font-bold uppercase">
              {market.cadence}
            </span>
          </div>
          <div className="text-[10px] text-secondary flex items-center gap-1 mt-1">
            <FiClock className="w-3 h-3 text-primary" />
            <span>CLOSING IN {minutesLeft}M {secondsMod}S</span>
          </div>
        </div>

        {market.oracleQuestionId && (
          <a
            href={`https://prd.oracle.somnia.host/questions/${market.oracleQuestionId}?view=graph`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-secondary hover:text-primary flex items-center gap-1 border border-divider px-2 py-1 bg-background"
          >
            <span>VERIFY ORACLE</span>
            <FiExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>

      {/* Implied Odds Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-primary">UP: {upPercent}%</span>
          <span className="text-secondary">DOWN: {downPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-divider flex overflow-hidden">
          <div className="bg-primary h-full transition-all duration-300" style={{ width: `${upPercent}%` }} />
          <div className="bg-surface-container-low border-l border-divider h-full transition-all duration-300" style={{ width: `${downPercent}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-secondary">
          <span>BID: {market.bestBid || '0.50'}</span>
          <span>ASK: {market.bestAsk || '0.50'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={() => onPredict(market, 'UP')}
          className="py-2.5 bg-primary text-background font-headline font-bold text-xs uppercase tracking-wider hover:bg-secondary transition-colors border border-primary flex items-center justify-center gap-1 cursor-pointer"
        >
          <FiArrowUpRight className="w-3.5 h-3.5" />
          <span>PREDICT UP</span>
        </button>
        <button
          type="button"
          onClick={() => onPredict(market, 'DOWN')}
          className="py-2.5 bg-surface-container-low text-primary font-headline font-bold text-xs uppercase tracking-wider hover:bg-primary hover:text-background transition-colors border border-primary flex items-center justify-center gap-1 cursor-pointer"
        >
          <FiArrowDownRight className="w-3.5 h-3.5" />
          <span>PREDICT DOWN</span>
        </button>
      </div>
    </div>
  );
}
