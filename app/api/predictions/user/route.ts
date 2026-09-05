import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { EventPrediction } from '@/lib/types';
import { 
  SomniaMarkets, 
  SOMNIA_TESTNET_ADDRESSES 
} from '@somnia-chain/markets-sdk';
import { somniaShannon } from '@somnia-chain/markets-sdk/chains';

let marketsClient: SomniaMarkets | null = null;

function getMarketsClient(): SomniaMarkets {
  if (!marketsClient) {
    marketsClient = new SomniaMarkets({
      indexerUrl: process.env.DREAMDEX_INDEXER_URL || process.env.NEXT_PUBLIC_DREAMDEX_INDEXER_URL || 'https://indexer.testnet.somnia.network/v1/graphql',
      chain: somniaShannon,
      wsRpcUrl: 'wss://dream-rpc.somnia.network/ws',
      addresses: SOMNIA_TESTNET_ADDRESSES,
    });
  }
  return marketsClient;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userAddress = searchParams.get('address');

  if (!userAddress) {
    return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
  }

  const normalized = userAddress.toLowerCase();

  try {
    const q = query(
      collection(db, 'predictions'),
      where('userAddress', '==', normalized)
    );
    const snap = await getDocs(q);
    const predictions: EventPrediction[] = [];
    snap.forEach((d) => {
      predictions.push(d.data() as EventPrediction);
    });

    // Sort newest first
    predictions.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich with live on-chain status
    const client = getMarketsClient();
    const enriched = await Promise.all(
      predictions.map(async (pred) => {
        if (!pred.marketId || !pred.marketId.startsWith('0x')) return pred;

        try {
          const onchain = await client.client.getMarketOnchain(pred.marketId as `0x${string}`);
          if (!onchain) return pred;

          const marketStatus = onchain.status;
          const isResolved = onchain.isResolved || marketStatus === 4;
          const winningOutcome = onchain.winningOutcome; // 0 = YES/UP, 1 = NO/DOWN

          let isCorrect: boolean | undefined;
          if (isResolved) {
            if (pred.side === 'UP') {
              isCorrect = winningOutcome === 0;
            } else {
              isCorrect = winningOutcome === 1;
            }
          }

          return {
            ...pred,
            marketStatus,
            isResolved,
            winningOutcome,
            isCorrect,
          };
        } catch {
          return pred;
        }
      })
    );

    return NextResponse.json({ success: true, predictions: enriched });
  } catch (error) {
    console.error('Error fetching user predictions:', error);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}
