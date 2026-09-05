import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Battle, Beast, Bet, BattleStatus } from '@/lib/types';
import { lockMarketPulseForBattle } from '@/lib/services/marketPulseService';

/**
 * Creates a new pending battle in Firestore with a 1-hour betting countdown window
 */
export async function createBattle(beastA: Beast, beastB: Beast): Promise<Battle> {
  const id = `battle_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = Date.now();
  const ONE_HOUR_MS = 60 * 60 * 1000;

  const baseBattle: Battle = {
    id,
    beastA,
    beastB,
    status: 'pending',
    challengeAcceptedAt: now,
    bettingWindowClosesAt: now + ONE_HOUR_MS,
    marketPulseA: null,
    marketPulseB: null,
    winner: null,
    totalPoolA: 0,
    totalPoolB: 0,
    combatLog: [],
    createdAt: now,
  };

  // Lock in live DreamDEX market pulse modifiers
  const newBattle = await lockMarketPulseForBattle(baseBattle);

  try {
    const battleDocRef = doc(db, 'battles', id);
    await setDoc(battleDocRef, newBattle);

    // Register on-chain with escrow contract
    if (typeof window !== 'undefined' && beastA.ownerAddress && beastB.ownerAddress) {
      fetch('/api/battle/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battleId: id,
          ownerA: beastA.ownerAddress,
          ownerB: beastB.ownerAddress,
          bettingClosesAt: newBattle.bettingWindowClosesAt,
        }),
      }).catch((err) => {
        console.warn('Escrow contract registerBattle call failed:', err);
      });
    }
  } catch (error) {
    console.warn('Firestore write failed:', error);
  }

  return newBattle;
}

/**
 * Fetches a single battle by ID from Firestore, dynamically hydrating live career records & bet pools
 */
export async function getBattleById(id: string): Promise<Battle | null> {
  try {
    const docRef = doc(db, 'battles', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const battleData = snap.data() as Battle;

      // Hydrate live career records directly from beasts collection
      if (battleData.beastA?.id && battleData.beastB?.id) {
        try {
          const [snapA, snapB] = await Promise.all([
            getDoc(doc(db, 'beasts', battleData.beastA.id)),
            getDoc(doc(db, 'beasts', battleData.beastB.id)),
          ]);
          if (snapA.exists()) {
            const liveA = snapA.data() as Beast;
            battleData.beastA = {
              ...battleData.beastA,
              record: liveA.record || { wins: 0, losses: 0 },
            };
          }
          if (snapB.exists()) {
            const liveB = snapB.data() as Beast;
            battleData.beastB = {
              ...battleData.beastB,
              record: liveB.record || { wins: 0, losses: 0 },
            };
          }
        } catch (beastErr) {
          console.warn('Error hydrating live beast records:', beastErr);
        }
      }

      // Query real existing bets in Firestore to dynamically calculate accurate pools
      try {
        const betsQuery = query(collection(db, 'bets'), where('battleId', '==', id));
        const betsSnap = await getDocs(betsQuery);
        let calcPoolA = 0;
        let calcPoolB = 0;
        betsSnap.forEach((d) => {
          const bet = d.data() as Bet;
          if (bet.beastPicked === 'beastA') calcPoolA += bet.amount;
          else if (bet.beastPicked === 'beastB') calcPoolB += bet.amount;
        });
        battleData.totalPoolA = calcPoolA;
        battleData.totalPoolB = calcPoolB;
      } catch (err) {
        console.warn('Error computing live bet pools:', err);
      }

      return battleData;
    }
  } catch (error) {
    console.warn('Error fetching battle from Firestore:', error);
  }

  return null;
}

/**
 * Fetches all battles across all statuses directly from Firestore
 */
export async function getAllBattles(): Promise<Battle[]> {
  try {
    const q = query(collection(db, 'battles'), orderBy('challengeAcceptedAt', 'desc'));
    const snap = await getDocs(q);
    const results: Battle[] = [];
    snap.forEach((d) => {
      results.push(d.data() as Battle);
    });
    return results;
  } catch (error) {
    console.warn('Error fetching all battles from Firestore:', error);
    return [];
  }
}

/**
 * Places a spectator wager on a pending battle directly in Firestore
 */
export async function placeBet(
  battleId: string,
  bettorAddress: string,
  beastPicked: 'beastA' | 'beastB',
  amount: number
): Promise<Bet> {
  const normalized = bettorAddress.toLowerCase();

  // Check if a bet already exists for this bettor on this battle
  let existingBet: Bet | null = null;
  try {
    const betsQuery = query(
      collection(db, 'bets'),
      where('battleId', '==', battleId),
      where('bettorAddress', '==', normalized)
    );
    const snap = await getDocs(betsQuery);
    if (!snap.empty) {
      existingBet = snap.docs[0].data() as Bet;
    }
  } catch (err) {
    console.warn('Firestore existing bet check error:', err);
  }

  if (existingBet && existingBet.beastPicked !== beastPicked) {
    throw new Error('Cannot wager on both combatants in the same battle.');
  }

  const betId = existingBet ? existingBet.id : `bet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const totalAmount = existingBet ? existingBet.amount + amount : amount;

  const newBet: Bet = {
    id: betId,
    battleId,
    bettorAddress: normalized,
    beastPicked,
    amount: totalAmount,
    status: 'active',
    placedAt: existingBet ? existingBet.placedAt : Date.now(),
  };

  try {
    const betDocRef = doc(db, 'bets', betId);
    await setDoc(betDocRef, newBet);

    const battleDocRef = doc(db, 'battles', battleId);
    await updateDoc(battleDocRef, {
      [beastPicked === 'beastA' ? 'totalPoolA' : 'totalPoolB']: increment(amount),
    });
  } catch (error) {
    console.warn('Firestore bet placement error:', error);
  }

  return newBet;
}

/**
 * Fetches all bets placed by a specific wallet address directly from Firestore
 */
export async function getBetsByBettor(bettorAddress: string): Promise<Bet[]> {
  if (!bettorAddress) return [];
  const normalized = bettorAddress.toLowerCase();

  try {
    const q = query(
      collection(db, 'bets'),
      where('bettorAddress', '==', normalized)
    );
    const snap = await getDocs(q);
    const results: Bet[] = [];
    snap.forEach((d) => {
      results.push(d.data() as Bet);
    });

    // Check if any bets were stored under non-normalized address
    if (results.length === 0 && bettorAddress !== normalized) {
      const qAlt = query(
        collection(db, 'bets'),
        where('bettorAddress', '==', bettorAddress)
      );
      const snapAlt = await getDocs(qAlt);
      snapAlt.forEach((d) => {
        results.push(d.data() as Bet);
      });
    }

    return results.sort((a, b) => b.placedAt - a.placedAt);
  } catch (error) {
    console.warn('Error fetching bets from Firestore:', error);
    return [];
  }
}

/**
 * Fetches all bets across all users directly from Firestore
 */
export async function getAllBets(): Promise<Bet[]> {
  try {
    const q = query(collection(db, 'bets'), orderBy('placedAt', 'desc'));
    const snap = await getDocs(q);
    const results: Bet[] = [];
    snap.forEach((d) => {
      results.push(d.data() as Bet);
    });
    return results;
  } catch (error) {
    console.warn('Error fetching all bets from Firestore:', error);
    return [];
  }
}

/**
 * Marks a bet as claimed and saves the payout amount in Firestore
 */
export async function claimBetPayout(
  betId: string,
  payoutAmount: number
): Promise<void> {
  try {
    const betDocRef = doc(db, 'bets', betId);
    await updateDoc(betDocRef, {
      status: 'claimed',
      payoutAmount,
    });
  } catch (error) {
    console.warn('Error updating claimed bet in Firestore:', error);
  }
}

