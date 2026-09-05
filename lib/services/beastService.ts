import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { getAddress, isAddress } from 'viem';
import { db } from '@/lib/firebase';
import { Beast } from '@/lib/types';

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
 * Creates and persists a new Beast into Firestore
 */
export async function createBeast(
  beastData: Omit<Beast, 'id' | 'createdAt' | 'record'>
): Promise<Beast> {
  const id = `beast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newBeast: Beast = {
    ...beastData,
    id,
    createdAt: Date.now(),
    record: {
      wins: 0,
      losses: 0,
    },
  };

  const beastDocRef = doc(db, 'beasts', id);
  await setDoc(beastDocRef, newBeast);

  return newBeast;
}

/**
 * Persists an existing or constructed Beast into Firestore
 */
export async function saveBeast(beast: Beast): Promise<Beast> {
  const beastDocRef = doc(db, 'beasts', beast.id);
  await setDoc(beastDocRef, beast);
  return beast;
}

/**
 * Fetches a single beast by ID directly from Firestore
 */
export async function getBeastById(id: string): Promise<Beast | null> {
  try {
    const docRef = doc(db, 'beasts', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Beast;
    }
  } catch (error) {
    console.warn('Error fetching beast from Firestore:', error);
  }

  return null;
}

/**
 * Fetches all beasts belonging to a specific wallet address directly from Firestore
 */
export async function getBeastsByOwner(ownerAddress: string): Promise<Beast[]> {
  if (!ownerAddress) return [];
  const variants = getAddressVariants(ownerAddress);
  const results: Beast[] = [];

  try {
    const q = query(
      collection(db, 'beasts'),
      where('ownerAddress', 'in', variants)
    );
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const b = d.data() as Beast;
      if (!results.some((r) => r.id === b.id)) {
        results.push(b);
      }
    });
  } catch (error) {
    console.warn('Error querying beasts from Firestore:', error);
  }

  return results.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Fetches all live beasts for the Arena and Leaderboards directly from Firestore
 */
export async function getAllBeasts(): Promise<Beast[]> {
  const results: Beast[] = [];

  try {
    const q = query(collection(db, 'beasts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      results.push(d.data() as Beast);
    });
  } catch (error) {
    console.warn('Error fetching all beasts from Firestore:', error);
  }

  return results;
}
