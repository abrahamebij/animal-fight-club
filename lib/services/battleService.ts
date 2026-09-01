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
import { MOCK_BATTLES } from '@/lib/mockData';
import { lockMarketPulseForBattle } from '@/lib/services/marketPulseService';

const LOCAL_STORAGE_BATTLES = 'afc_custom_battles';
const LOCAL_STORAGE_BETS = 'afc_custom_bets';

function getLocalBattles(): Battle[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BATTLES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalBattle(battle: Battle): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalBattles();
    const updated = [battle, ...current.filter((b) => b.id !== battle.id)];
    localStorage.setItem(LOCAL_STORAGE_BATTLES, JSON.stringify(updated));
  } catch {
    // Ignore storage quota error
  }
}

function getLocalBets(): Bet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BETS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalBet(bet: Bet): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalBets();
    const updated = [bet, ...current.filter((b) => b.id !== bet.id)];
    localStorage.setItem(LOCAL_STORAGE_BETS, JSON.stringify(updated));
  } catch {
    // Ignore storage quota error
  }
}

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
    totalPoolA: 0,
    totalPoolB: 0,
    combatLog: [],
  };

  // Lock in live DreamDEX market pulse modifiers
  const newBattle = await lockMarketPulseForBattle(baseBattle);

  saveLocalBattle(newBattle);

  try {
    const battleDocRef = doc(db, 'battles', id);
    await setDoc(battleDocRef, newBattle);
  } catch (error) {
    console.warn('Firestore write failed, falling back to local cache:', error);
  }

  return newBattle;
}

/**
 * Fetches a single battle by ID
 */
export async function getBattleById(id: string): Promise<Battle | null> {
  const localList = getLocalBattles();
  const localMatch = localList.find((b) => b.id === id);
  if (localMatch) return localMatch;

  const mockMatch = MOCK_BATTLES.find((b) => b.id === id);
  if (mockMatch) return mockMatch;

  try {
    const docRef = doc(db, 'battles', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Battle;
    }
  } catch (error) {
    console.warn('Error fetching battle from Firestore:', error);
  }

  return null;
}

/**
 * Fetches all battles across all statuses (pending, live, completed)
 */
export async function getAllBattles(): Promise<Battle[]> {
  const results: Battle[] = [...getLocalBattles()];

  // Add default mock battles
  for (const m of MOCK_BATTLES) {
    if (!results.some((r) => r.id === m.id)) {
      results.push(m);
    }
  }

  try {
    const q = query(collection(db, 'battles'), orderBy('challengeAcceptedAt', 'desc'));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const b = d.data() as Battle;
      if (!results.some((r) => r.id === b.id)) {
        results.push(b);
      }
    });
  } catch (error) {
    console.warn('Error fetching all battles from Firestore:', error);
  }

  return results;
}

/**
 * Places a spectator wager on a pending battle
 */
export async function placeBet(
  battleId: string,
  bettorAddress: string,
  beastPicked: 'beastA' | 'beastB',
  amount: number
): Promise<Bet> {
  const betId = `bet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newBet: Bet = {
    id: betId,
    battleId,
    bettorAddress,
    beastPicked,
    amount,
    status: 'active',
    placedAt: Date.now(),
  };

  saveLocalBet(newBet);

  // Update local battle pool
  const localBattles = getLocalBattles();
  const targetBattle = localBattles.find((b) => b.id === battleId);
  if (targetBattle) {
    if (beastPicked === 'beastA') {
      targetBattle.totalPoolA = (targetBattle.totalPoolA || 0) + amount;
    } else {
      targetBattle.totalPoolB = (targetBattle.totalPoolB || 0) + amount;
    }
    saveLocalBattle(targetBattle);
  }

  try {
    // 1. Write bet doc
    const betDocRef = doc(db, 'bets', betId);
    await setDoc(betDocRef, newBet);

    // 2. Increment battle pool in Firestore
    const battleDocRef = doc(db, 'battles', battleId);
    await updateDoc(battleDocRef, {
      [beastPicked === 'beastA' ? 'totalPoolA' : 'totalPoolB']: increment(amount),
    });
  } catch (error) {
    console.warn('Firestore bet placement fallback:', error);
  }

  return newBet;
}

/**
 * Fetches all bets placed by a specific wallet address
 */
export async function getBetsByBettor(bettorAddress: string): Promise<Bet[]> {
  const normalized = bettorAddress.toLowerCase();
  const results: Bet[] = getLocalBets().filter(
    (b) => b.bettorAddress.toLowerCase() === normalized
  );

  try {
    const q = query(
      collection(db, 'bets'),
      where('bettorAddress', '==', bettorAddress),
      orderBy('placedAt', 'desc')
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const b = d.data() as Bet;
      if (!results.some((r) => r.id === b.id)) {
        results.push(b);
      }
    });
  } catch (error) {
    console.warn('Error fetching bets from Firestore:', error);
  }

  return results;
}
