import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Challenge, Beast, Battle } from '@/lib/types';
import { createBattle } from '@/lib/services/battleService';

const LOCAL_STORAGE_CHALLENGES = 'afc_custom_challenges';

function getLocalChallenges(): Challenge[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHALLENGES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalChallenge(challenge: Challenge): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalChallenges();
    const updated = [challenge, ...current.filter((c) => c.id !== challenge.id)];
    localStorage.setItem(LOCAL_STORAGE_CHALLENGES, JSON.stringify(updated));
  } catch {
    // Ignore storage quota error
  }
}

/**
 * Creates a new formal challenge in Firestore (status: awaiting_response)
 * Note: Does NOT open a battle or betting window until accepted.
 */
export async function createChallenge(
  challengerBeast: Beast,
  challengedBeast: Beast
): Promise<Challenge> {
  if (challengerBeast.id === challengedBeast.id) {
    throw new Error("A combatant cannot challenge itself.");
  }
  if (
    challengerBeast.ownerAddress &&
    challengedBeast.ownerAddress &&
    challengerBeast.ownerAddress.toLowerCase() === challengedBeast.ownerAddress.toLowerCase()
  ) {
    throw new Error("Cannot challenge another combatant owned by the same address.");
  }

  const id = `challenge_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = Date.now();

  const newChallenge: Challenge = {
    id,
    challengerBeast,
    challengedBeast,
    challengerAddress: challengerBeast.ownerAddress,
    challengedAddress: challengedBeast.ownerAddress,
    status: 'awaiting_response',
    createdAt: now,
  };

  saveLocalChallenge(newChallenge);

  try {
    const challengeDocRef = doc(db, 'challenges', id);
    await setDoc(challengeDocRef, newChallenge);
  } catch (error) {
    console.warn('Firestore challenge write error, saved locally:', error);
  }

  return newChallenge;
}

/**
 * Fetches all incoming challenges for a specific wallet address
 */
export async function getIncomingChallenges(walletAddress: string): Promise<Challenge[]> {
  if (!walletAddress) return [];
  const normalized = walletAddress.toLowerCase();
  const results: Challenge[] = getLocalChallenges().filter(
    (c) => c.challengedAddress.toLowerCase() === normalized
  );

  try {
    const q = query(
      collection(db, 'challenges'),
      where('challengedAddress', '==', walletAddress),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const c = d.data() as Challenge;
      if (!results.some((r) => r.id === c.id)) {
        results.push(c);
      }
    });
  } catch (error) {
    console.warn('Error querying incoming challenges from Firestore:', error);
  }

  return results.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Fetches all outgoing challenges sent by a specific wallet address
 */
export async function getOutgoingChallenges(walletAddress: string): Promise<Challenge[]> {
  if (!walletAddress) return [];
  const normalized = walletAddress.toLowerCase();
  const results: Challenge[] = getLocalChallenges().filter(
    (c) => c.challengerAddress.toLowerCase() === normalized
  );

  try {
    const q = query(
      collection(db, 'challenges'),
      where('challengerAddress', '==', walletAddress),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const c = d.data() as Challenge;
      if (!results.some((r) => r.id === c.id)) {
        results.push(c);
      }
    });
  } catch (error) {
    console.warn('Error querying outgoing challenges from Firestore:', error);
  }

  return results.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Accepts a challenge:
 * 1. Strictly verifies the caller is the challenged beast owner.
 * 2. Creates the official pending battle document and opens the 1-hour betting window.
 * 3. Updates challenge status to 'accepted' with battleId.
 */
export async function acceptChallenge(
  challengeId: string,
  defenderAddress: string
): Promise<{ challenge: Challenge; battle: Battle }> {
  // Retrieve challenge from local or firestore
  let targetChallenge = getLocalChallenges().find((c) => c.id === challengeId);

  if (!targetChallenge) {
    try {
      const snap = await getDoc(doc(db, 'challenges', challengeId));
      if (snap.exists()) {
        targetChallenge = snap.data() as Challenge;
      }
    } catch (err) {
      console.warn('Error fetching challenge for acceptance:', err);
    }
  }

  if (!targetChallenge) {
    throw new Error('Challenge not found');
  }

  // Security check: Only the challenged beast's owner can accept
  if (targetChallenge.challengedAddress.toLowerCase() !== defenderAddress.toLowerCase()) {
    throw new Error('Unauthorized: Only the defender beast owner can accept this challenge');
  }

  if (targetChallenge.status !== 'awaiting_response') {
    throw new Error(`Challenge is already ${targetChallenge.status}`);
  }

  // 1. Create the pending battle (opens the 1-hour spectator betting window)
  const battle = await createBattle(
    targetChallenge.challengerBeast,
    targetChallenge.challengedBeast
  );

  // 2. Update challenge document state
  const updatedChallenge: Challenge = {
    ...targetChallenge,
    status: 'accepted',
    respondedAt: Date.now(),
    battleId: battle.id,
  };

  saveLocalChallenge(updatedChallenge);

  try {
    const docRef = doc(db, 'challenges', challengeId);
    await updateDoc(docRef, {
      status: 'accepted',
      respondedAt: updatedChallenge.respondedAt,
      battleId: battle.id,
    });
  } catch (error) {
    console.warn('Error updating accepted challenge in Firestore:', error);
  }

  return { challenge: updatedChallenge, battle };
}

/**
 * Declines a challenge:
 * 1. Strictly verifies the caller is the challenged beast owner.
 * 2. Updates challenge status to 'declined'.
 * 3. No battle document is created.
 */
export async function declineChallenge(
  challengeId: string,
  defenderAddress: string
): Promise<Challenge> {
  let targetChallenge = getLocalChallenges().find((c) => c.id === challengeId);

  if (!targetChallenge) {
    try {
      const snap = await getDoc(doc(db, 'challenges', challengeId));
      if (snap.exists()) {
        targetChallenge = snap.data() as Challenge;
      }
    } catch (err) {
      console.warn('Error fetching challenge for declining:', err);
    }
  }

  if (!targetChallenge) {
    throw new Error('Challenge not found');
  }

  // Security check: Only the challenged beast's owner can decline
  if (targetChallenge.challengedAddress.toLowerCase() !== defenderAddress.toLowerCase()) {
    throw new Error('Unauthorized: Only the defender beast owner can decline this challenge');
  }

  if (targetChallenge.status !== 'awaiting_response') {
    throw new Error(`Challenge is already ${targetChallenge.status}`);
  }

  const updatedChallenge: Challenge = {
    ...targetChallenge,
    status: 'declined',
    respondedAt: Date.now(),
  };

  saveLocalChallenge(updatedChallenge);

  try {
    const docRef = doc(db, 'challenges', challengeId);
    await updateDoc(docRef, {
      status: 'declined',
      respondedAt: updatedChallenge.respondedAt,
    });
  } catch (error) {
    console.warn('Error updating declined challenge in Firestore:', error);
  }

  return updatedChallenge;
}
