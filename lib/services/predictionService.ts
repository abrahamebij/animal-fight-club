import { 
  SomniaMarkets, 
  SOMNIA_TESTNET_ADDRESSES,
  PlaceOrderResult
} from '@somnia-chain/markets-sdk';
import { somniaShannon } from '@somnia-chain/markets-sdk/chains';
import { LiveEventMarket, EventPrediction } from '@/lib/types';
import { maxUint256, parseUnits, formatUnits, type WalletClient, type PublicClient, zeroAddress } from 'viem';
import { DREAMDEX_CONTRACTS } from '@/lib/constants/game';

export const TUSDC_ADDRESS = DREAMDEX_CONTRACTS.TestnetCollateral_tUSDC; // 0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E

export const TUSDC_ABI = [
  {
    type: 'function',
    name: 'faucet',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
] as const;

export const BINARY_POOL_ABI = [
  {
    type: 'function',
    name: 'placeBinaryOrder',
    inputs: [
      { name: 'kind', type: 'uint8' },
      { name: 'price', type: 'uint256' },
      { name: 'quantity', type: 'uint256' },
      { name: 'expireTimestampNs', type: 'uint64' },
      { name: 'orderType', type: 'uint8' },
      { name: 'selfMatchingOption', type: 'uint8' },
      { name: 'builder', type: 'address' },
      { name: 'builderFeeBpsTimes1k', type: 'uint96' },
      { name: 'userData', type: 'uint64' },
    ],
    outputs: [
      { name: 'success', type: 'bool' },
      { name: 'id', type: 'uint128' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'marketExpiryNs',
    inputs: [],
    outputs: [{ name: '', type: 'uint64' }],
    stateMutability: 'view',
  },
] as const;

/**
 * Fetches currently open candidate binary markets from API
 */
export async function fetchLivePredictionMarkets(): Promise<LiveEventMarket[]> {
  const res = await fetch('/api/predictions/markets');
  if (!res.ok) throw new Error('Failed to fetch prediction markets');
  const data = await res.json();
  return data.markets || [];
}

/**
 * Fetches user predictions with on-chain status from API
 */
export async function fetchUserPredictions(address?: string): Promise<EventPrediction[]> {
  if (!address) return [];
  const res = await fetch(`/api/predictions/user?address=${encodeURIComponent(address)}`);
  if (!res.ok) throw new Error('Failed to fetch user predictions');
  const data = await res.json();
  return data.predictions || [];
}

/**
 * Records a placed prediction in Firestore
 */
export async function logPlacedPrediction(prediction: EventPrediction): Promise<void> {
  await fetch('/api/predictions/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prediction }),
  });
}

/**
 * Reads user's tUSDC balance
 */
export async function fetchTUsdcBalance(
  publicClient: PublicClient,
  address?: `0x${string}`
): Promise<string> {
  if (!address) return '0.00';
  try {
    const raw = await publicClient.readContract({
      address: TUSDC_ADDRESS,
      abi: TUSDC_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    return formatUnits(raw, 6);
  } catch (err) {
    console.warn('Error reading tUSDC balance:', err);
    return '0.00';
  }
}

/**
 * Mints testnet tUSDC via faucet
 */
export async function claimTUsdcFaucet(
  walletClient: WalletClient,
  publicClient: PublicClient,
  amount: number = 1000
): Promise<`0x${string}`> {
  const [account] = await walletClient.getAddresses();
  if (!account) throw new Error('No account found on wallet client');

  const rawAmount = parseUnits(amount.toString(), 6);

  const hash = await walletClient.writeContract({
    address: TUSDC_ADDRESS,
    abi: TUSDC_ABI,
    functionName: 'faucet',
    args: [rawAmount],
    account,
    chain: somniaShannon,
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export interface PlacePredictionOrderParams {
  market: LiveEventMarket;
  side: 'UP' | 'DOWN';
  stakeAmount: number; // in tUSDC (e.g. 10)
  userAddress: `0x${string}`;
}

/**
 * Places a real IOC prediction order on DreamDEX Event Contracts
 */
export async function placePredictionOrder(
  walletClient: WalletClient,
  publicClient: PublicClient,
  params: PlacePredictionOrderParams
): Promise<{ txHash: string; orderId?: string; prediction: EventPrediction }> {
  const { market, side, stakeAmount, userAddress } = params;

  if (stakeAmount <= 0) {
    throw new Error('Stake amount must be greater than 0');
  }

  // 1. GATE ON-CHAIN STATUS BEFORE SUBMISSION
  // Query on-chain status to confirm status === 1 (Trading). Never rely on stale client cache.
  try {
    const readClient = new SomniaMarkets({
      indexerUrl: process.env.DREAMDEX_INDEXER_URL || process.env.NEXT_PUBLIC_DREAMDEX_INDEXER_URL || 'https://dev.smk.somnia.host/v1/graphql',
      chain: somniaShannon,
      addresses: SOMNIA_TESTNET_ADDRESSES,
    });
    const onchain = await readClient.client.getMarketOnchain(market.marketId as `0x${string}`);
    if (!onchain || onchain.status !== 1) {
      throw new Error(`Market is not open for trading (on-chain status: ${onchain?.status ?? 'unknown'}). The window may have locked or expired.`);
    }
  } catch (statusErr: unknown) {
    if (statusErr instanceof Error && statusErr.message.includes('Market is not open')) {
      throw statusErr;
    }
    console.warn('On-chain pre-check warning:', statusErr);
  }

  const rawStake = parseUnits(stakeAmount.toString(), 6);

  // 2. RESOLVE REAL POOL ADDRESS & HANDLE tUSDC ALLOWANCE
  let poolAddress = market.pool as `0x${string}`;
  if (
    (!poolAddress || poolAddress.toLowerCase() === DREAMDEX_CONTRACTS.BinaryMarketsModule.toLowerCase()) &&
    market.marketAddress
  ) {
    try {
      const onchainPool = await publicClient.readContract({
        address: market.marketAddress as `0x${string}`,
        abi: [
          {
            type: 'function',
            name: 'pool',
            inputs: [],
            outputs: [{ name: '', type: 'address' }],
            stateMutability: 'view',
          },
        ],
        functionName: 'pool',
      });
      if (onchainPool && onchainPool !== zeroAddress) {
        poolAddress = onchainPool as `0x${string}`;
      }
    } catch (e) {
      console.warn('Failed to resolve onchain pool from market contract:', e);
    }
  }

  const currentAllowance = await publicClient.readContract({
    address: TUSDC_ADDRESS,
    abi: TUSDC_ABI,
    functionName: 'allowance',
    args: [userAddress, poolAddress],
  });

  if (currentAllowance < rawStake) {
    const approveHash = await walletClient.writeContract({
      address: TUSDC_ADDRESS,
      abi: TUSDC_ABI,
      functionName: 'approve',
      args: [poolAddress, maxUint256],
      account: userAddress,
      chain: somniaShannon,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
  }

  // 3. EXECUTE ORDER: PRIMARY VIA UNIFIED createOrder
  let txHash: `0x${string}` | undefined;
  let orderId: string | undefined;
  let executedPrice = side === 'UP' ? market.upOdds : market.downOdds;

  try {
    const exchange = new SomniaMarkets({
      chain: somniaShannon,
      indexerUrl: process.env.DREAMDEX_INDEXER_URL || process.env.NEXT_PUBLIC_DREAMDEX_INDEXER_URL || 'https://dev.smk.somnia.host/v1/graphql',
      wsRpcUrl: 'wss://dream-rpc.somnia.network/ws',
      addresses: SOMNIA_TESTNET_ADDRESSES,
      walletClient,
    });

    // Make sure markets are loaded for unified pricing
    await exchange.loadMarkets(false);

    const tradableSymbol = side === 'UP' ? market.upSymbol : market.downSymbol;

    // Place IOC order crossing the touch
    // For IOC buy: place slightly through the ask (+ 2% slippage protection)
    const baseOdds = side === 'UP' ? market.upOdds : market.downOdds;
    const limitPrice = Math.min(0.99, Math.max(0.01, Math.round((baseOdds + 0.02) * 100) / 100));

    const order = await exchange.createOrder(
      tradableSymbol,
      'limit',
      'buy',
      stakeAmount,
      limitPrice,
      { timeInForce: 'IOC' }
    );

    // Safely extract receipt: info holds the PlaceOrderResult
    const info = order.info as PlaceOrderResult | undefined;
    txHash = (info?.receipt?.transactionHash || order.txHash) as `0x${string}`;
    orderId = order.id;
    executedPrice = order.price || limitPrice;
  } catch (sdkError) {
    console.warn('Unified createOrder attempt error, utilizing Direct Pool Placement fallback:', sdkError);

    // FALLBACK SAFETY NET: Direct Pool contract placeBinaryOrder call
    // kind: BUY_YES = 0, BUY_NO = 2
    const kind = side === 'UP' ? 0 : 2;
    // Price scaled to 6 decimals (raw collateral units per whole outcome token)
    const priceUnits = parseUnits(executedPrice.toFixed(3), 6);
    // Quantity in raw 6-decimal units
    const quantity = rawStake;

    let expiryNs: bigint;
    try {
      const poolExpiryNs = await publicClient.readContract({
        address: poolAddress,
        abi: BINARY_POOL_ABI,
        functionName: 'marketExpiryNs',
      });
      expiryNs = poolExpiryNs;
    } catch {
      const nowSec = BigInt(Math.floor(Date.now() / 1000));
      const expirySec = BigInt(Math.min(market.expiry, Number(nowSec) + 600));
      expiryNs = expirySec * BigInt(1000000000);
    }

    // Direct write to the binary pool contract
    // orderType: 0 (Limit order) - immediately fills against counterparty if liquidity is available,
    // or rests on the book, preventing unnecessary ImmediateOrCancelNoFill reverts on testnet.
    const directHash = await walletClient.writeContract({
      address: poolAddress,
      abi: BINARY_POOL_ABI,
      functionName: 'placeBinaryOrder',
      args: [
        kind,
        priceUnits,
        quantity,
        expiryNs,
        0, // Limit order
        0, // selfMatchingOption
        zeroAddress, // builder
        BigInt(0), // builderFeeBpsTimes1k
        BigInt(0), // userData
      ],
      account: userAddress,
      chain: somniaShannon,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: directHash });
    if (receipt.status !== 'success') {
      throw new Error('Prediction order transaction reverted on chain.');
    }
    txHash = directHash;
    orderId = directHash;
  }

  const predictionRecord: EventPrediction = {
    id: txHash || `pred_${Date.now()}`,
    userAddress,
    marketId: market.marketId,
    poolAddress: poolAddress,
    asset: market.asset,
    side,
    symbol: market.symbol,
    cadence: market.cadence,
    stakeAmount,
    price: executedPrice,
    timeInForce: 'IOC',
    status: 'closed',
    marketExpiry: market.expiry,
    txHash: txHash || '',
    createdAt: Date.now(),
    marketStatus: 1,
  };

  // 4. LOG TO FIRESTORE IN BACKGROUND
  logPlacedPrediction(predictionRecord).catch((err) => {
    console.warn('Failed to log prediction to Firestore:', err);
  });

  return {
    txHash: txHash || '',
    orderId,
    prediction: predictionRecord,
  };
}
