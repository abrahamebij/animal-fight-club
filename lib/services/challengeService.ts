import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc 
} from 'firebase/firestore';
import { getAddress, isAddress } from 'viem';
import { db } from '@/lib/firebase';
import { Challenge, Beast, Battle } from '@/lib/types';
import { createBattle } from '@/lib/services/battleService';

function getAddressVariants(address: string): string[] {
  if (!address) return [];
  const lower = address.toLowerCase();
  const variants = [address, lower];
  try {
    if (isAddress(address)) {
      variants.push(getAddress(address));
    }
  } catch {
    // Ignore invalid address error
  }
  return Array.from(new Set(variants));
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

  const challengeDocRef = doc(db, 'challenges', id);
  await setDoc(challengeDocRef, newChallenge);

  return newChallenge;
}

/**
 * Fetches all incoming challenges for a specific wallet address directly from Firestore database
 */
export async function getIncomingChallenges(walletAddress: string): Promise<Challenge[]> {
  if (!walletAddress) return [];
  const variants = getAddressVariants(walletAddress);

  try {
    const q = query(
      collection(db, 'challenges'),
      where('challengedAddress', 'in', variants)
    );
    const snap = await getDocs(q);
    const results: Challenge[] = [];
    snap.forEach((d) => {
      results.push(d.data() as Challenge);
    });

    return results.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.warn('Error querying incoming challenges from Firestore:', error);
    return [];
  }
}

/**
 * Fetches all outgoing challenges sent by a specific wallet address directly from Firestore database
 */
export async function getOutgoingChallenges(walletAddress: string): Promise<Challenge[]> {
  if (!walletAddress) return [];
  const variants = getAddressVariants(walletAddress);

  try {
    const q = query(
      collection(db, 'challenges'),
      where('challengerAddress', 'in', variants)
    );
    const snap = await getDocs(q);
    const results: Challenge[] = [];
    snap.forEach((d) => {
      results.push(d.data() as Challenge);
    });

    return results.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.warn('Error querying outgoing challenges from Firestore:', error);
    return [];
  }
}

/**
 * Fetches all challenges associated with a user address
 */
export async function getChallengesForUser(walletAddress: string): Promise<Challenge[]> {
  const [incoming, outgoing] = await Promise.all([
    getIncomingChallenges(walletAddress),
    getOutgoingChallenges(walletAddress),
  ]);
  const map = new Map<string, Challenge>();
  incoming.forEach((c) => map.set(c.id, c));
  outgoing.forEach((c) => map.set(c.id, c));
  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Fetches all open challenges awaiting response directly from Firestore database
 */
export async function getOpenChallenges(): Promise<Challenge[]> {
  try {
    const q = query(
      collection(db, 'challenges'),
      where('status', '==', 'awaiting_response')
    );
    const snap = await getDocs(q);
    const results: Challenge[] = [];
    snap.forEach((d) => {
      results.push(d.data() as Challenge);
    });
    return results.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.warn('Error querying open challenges from Firestore:', error);
    return [];
  }
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
  // Retrieve challenge from Firestore database
  const snap = await getDoc(doc(db, 'challenges', challengeId));
  if (!snap.exists()) {
    throw new Error('Challenge not found');
  }

  const targetChallenge = snap.data() as Challenge;

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

  // 2. Update challenge document state in Firestore database
  const updatedChallenge: Challenge = {
    ...targetChallenge,
    status: 'accepted',
    respondedAt: Date.now(),
    battleId: battle.id,
  };

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
  // Retrieve challenge from Firestore database
  const snap = await getDoc(doc(db, 'challenges', challengeId));
  if (!snap.exists()) {
    throw new Error('Challenge not found');
  }

  const targetChallenge = snap.data() as Challenge;

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
