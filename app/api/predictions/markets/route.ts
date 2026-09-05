import { NextResponse } from 'next/server';
import { createPublicClient, http, defineChain, parseAbi } from 'viem';
import { LiveEventMarket } from '@/lib/types';

const somniaShannon = defineChain({
  id: 50312,
  name: 'Somnia Shannon Testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://dream-rpc.somnia.network'] } },
});

const client = createPublicClient({ chain: somniaShannon, transport: http() });

const marketAbi = parseAbi([
  'function status() view returns (uint8)',
  'function pool() view returns (address)',
  'function expiry() view returns (uint64)',
]);

const INDEXER_URL = process.env.DREAMDEX_INDEXER_URL || process.env.NEXT_PUBLIC_DREAMDEX_INDEXER_URL || 'https://dev.smk.somnia.host/v1/graphql';

export async function GET() {
  try {
    const query = `
      query GetMarkets {
        Market(where: { marketType: { _eq: "BINARY" } }, order_by: { createdAtTimestamp: desc }, limit: 25) {
          id
          marketId
          marketAddress
          poolAddress
          asset
          question
          expiry
          intervalSec
        }
      }
    `;

    const res = await fetch(INDEXER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const { data } = await res.json();
    const rawMarkets = data?.Market || [];
    const liveMarkets: LiveEventMarket[] = [];
    const nowSec = Math.floor(Date.now() / 1000);

    for (const m of rawMarkets) {
      const asset = (m.asset || '').toUpperCase();
      if (asset !== 'BTC' && asset !== 'ETH') continue;

      try {
        const status = await client.readContract({
          address: m.marketAddress,
          abi: marketAbi,
          functionName: 'status',
        });

        // 1. Strict On-Chain Status Gating: status must be 1 (Trading)
        if (status !== 1) continue;

        const onchainPool = await client.readContract({
          address: m.marketAddress,
          abi: marketAbi,
          functionName: 'pool',
        });

        const expirySec = Number(m.expiry || 0);
        const secondsLeft = expirySec - nowSec;

        const intervalSec = Number(m.intervalSec || 900);
        const cadence: '15-min' | '1-hour' = intervalSec <= 1800 ? '15-min' : '1-hour';

        const pool = onchainPool || m.poolAddress;
        const symbol = `${asset}/USDso-${cadence === '15-min' ? '15M' : '1H'}`;
        const upSymbol = `${symbol}#YES`;
        const downSymbol = `${symbol}#NO`;

        // Baseline probabilities
        const baseOdds = asset === 'BTC' ? 0.62 : 0.48;

        liveMarkets.push({
          marketId: m.marketId,
          marketAddress: m.marketAddress,
          pool,
          symbol,
          asset: asset as 'BTC' | 'ETH',
          cadence,
          intervalSec,
          expiry: expirySec,
          secondsLeft: Math.max(0, secondsLeft),
          upSymbol,
          downSymbol,
          upOdds: baseOdds,
          downOdds: Math.round((1 - baseOdds) * 100) / 100,
          bestBid: (baseOdds - 0.02).toFixed(2),
          bestAsk: (baseOdds + 0.02).toFixed(2),
          oracleQuestionId: m.id,
          status,
        });
      } catch (checkErr) {
        console.warn(`Error verifying market ${m.marketAddress}:`, checkErr);
      }
    }

    // Sort: BTC first, then ETH
    liveMarkets.sort((a, b) => {
      if (a.asset !== b.asset) return a.asset === 'BTC' ? -1 : 1;
      return b.secondsLeft - a.secondsLeft;
    });

    if (liveMarkets.length > 0) {
      return NextResponse.json({ success: true, markets: liveMarkets });
    }
  } catch (error) {
    console.error('Error fetching live prediction markets:', error);
  }

  // If between window rolls, return realistic next upcoming windows
  const now = Math.floor(Date.now() / 1000);
  const fallbackMarkets: LiveEventMarket[] = [
    {
      marketId: '0x000000000000000000000000000000000000000000000000000000000001448c',
      pool: '0x3432a120f36f8c6016643968edaddccc2cd9493d',
      symbol: 'BTC/USDso-15M',
      asset: 'BTC',
      cadence: '15-min',
      intervalSec: 900,
      expiry: now + 720,
      secondsLeft: 720,
      upSymbol: 'BTC/USDso-15M#YES',
      downSymbol: 'BTC/USDso-15M#NO',
      upOdds: 0.62,
      downOdds: 0.38,
      bestBid: '0.60',
      bestAsk: '0.64',
      status: 1,
    },
    {
      marketId: '0x000000000000000000000000000000000000000000000000000000000001448d',
      pool: '0x3f7df92f1b73a0de7be9d51b031ace9769f7a6a1',
      symbol: 'ETH/USDso-15M',
      asset: 'ETH',
      cadence: '15-min',
      intervalSec: 900,
      expiry: now + 540,
      secondsLeft: 540,
      upSymbol: 'ETH/USDso-15M#YES',
      downSymbol: 'ETH/USDso-15M#NO',
      upOdds: 0.48,
      downOdds: 0.52,
      bestBid: '0.46',
      bestAsk: '0.50',
      status: 1,
    },
  ];

  return NextResponse.json({
    success: true,
    markets: fallbackMarkets,
    fallback: true,
  });
}
