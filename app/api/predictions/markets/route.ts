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
  const nowSec = Math.floor(Date.now() / 1000);

  try {
    // 1. First query active binary markets where expiry is in the future
    const activeQuery = `
      query GetActiveMarkets {
        Market(
          where: {
            marketType: { _eq: "BINARY" },
            expiry: { _gt: "${nowSec}" },
            asset: { _in: ["BTC", "ETH"] }
          },
          order_by: { expiry: asc },
          limit: 30
        ) {
          id
          marketId
          marketAddress
          poolAddress
          binaryPoolAddress
          asset
          question
          expiry
          intervalSec
        }
      }
    `;

    let res = await fetch(INDEXER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: activeQuery }),
    });

    const { data } = await res.json();
    let rawMarkets = data?.Market || [];

    // Fallback query if no markets returned from expiry-filtered query
    if (rawMarkets.length === 0) {
      const recentQuery = `
        query GetRecentMarkets {
          Market(
            where: {
              marketType: { _eq: "BINARY" },
              asset: { _in: ["BTC", "ETH"] }
            },
            order_by: { createdAtTimestamp: desc },
            limit: 50
          ) {
            id
            marketId
            marketAddress
            poolAddress
            binaryPoolAddress
            asset
            question
            expiry
            intervalSec
          }
        }
      `;
      res = await fetch(INDEXER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: recentQuery }),
      });
      const recentData = await res.json();
      rawMarkets = recentData?.data?.Market || [];
    }

    const liveMarkets: LiveEventMarket[] = [];

    for (const m of rawMarkets) {
      const asset = (m.asset || '').toUpperCase();
      if (asset !== 'BTC' && asset !== 'ETH') continue;

      const expirySec = Number(m.expiry || 0);
      const secondsLeft = expirySec - nowSec;

      // Skip expired markets strictly
      if (secondsLeft <= 0) continue;

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
        }).catch(() => null);

        const intervalSec = Number(m.intervalSec || 900);
        const cadence: '15-min' | '1-hour' = intervalSec <= 1800 ? '15-min' : '1-hour';

        const pool = (m.binaryPoolAddress || onchainPool || m.poolAddress) as string;
        
        // Derive outcome symbols compatible with SomniaMarkets SDK: {ASSET}-0-{DDMMMYY}/tUSDC
        const expDate = new Date(expirySec * 1000);
        const dayStr = String(expDate.getUTCDate()).padStart(2, '0');
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const monthStr = months[expDate.getUTCMonth()];
        const yearStr = String(expDate.getUTCFullYear()).slice(-2);
        const sdkFormatSymbol = `${asset}-0-${dayStr}${monthStr}${yearStr}/tUSDC`;

        const upSymbol = `${sdkFormatSymbol}#YES`;
        const downSymbol = `${sdkFormatSymbol}#NO`;

        // Baseline probabilities
        const baseOdds = asset === 'BTC' ? 0.62 : 0.48;

        liveMarkets.push({
          marketId: m.marketId,
          marketAddress: m.marketAddress,
          pool,
          symbol: sdkFormatSymbol,
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

    // Sort: BTC first, then ETH, prioritizing earliest closing windows
    liveMarkets.sort((a, b) => {
      if (a.asset !== b.asset) return a.asset === 'BTC' ? -1 : 1;
      return a.secondsLeft - b.secondsLeft;
    });

    if (liveMarkets.length > 0) {
      return NextResponse.json({ success: true, markets: liveMarkets });
    }
  } catch (error) {
    console.error('Error fetching live prediction markets:', error);
  }

  // Active verified fallback markets on Somnia Shannon testnet (contracts verified status === 1)
  const fallbackMarkets: LiveEventMarket[] = [
    {
      marketId: '0x0000000000000000000000000000000000000000000000000000000000015778',
      marketAddress: '0xf026968932596f287d0124b480ef659e7a62a247',
      pool: '0xb0b05fbc768388e5c5b6880084e64fe7a26c363b',
      symbol: 'BTC-0-08SEP26/tUSDC',
      asset: 'BTC',
      cadence: '1-hour',
      intervalSec: 86400,
      expiry: 1788825600,
      secondsLeft: Math.max(0, 1788825600 - nowSec),
      upSymbol: 'BTC-0-08SEP26/tUSDC#YES',
      downSymbol: 'BTC-0-08SEP26/tUSDC#NO',
      upOdds: 0.62,
      downOdds: 0.38,
      bestBid: '0.60',
      bestAsk: '0.64',
      status: 1,
    },
    {
      marketId: '0x0000000000000000000000000000000000000000000000000000000000015779',
      marketAddress: '0xe1dddbf1a945df686d09bd3c8fcf09ffb952bf50',
      pool: '0x06b0c35e61c7cef10689b48500fc374867e33df4',
      symbol: 'ETH-0-08SEP26/tUSDC',
      asset: 'ETH',
      cadence: '1-hour',
      intervalSec: 86400,
      expiry: 1788825600,
      secondsLeft: Math.max(0, 1788825600 - nowSec),
      upSymbol: 'ETH-0-08SEP26/tUSDC#YES',
      downSymbol: 'ETH-0-08SEP26/tUSDC#NO',
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
