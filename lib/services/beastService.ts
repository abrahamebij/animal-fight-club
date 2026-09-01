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
import { db } from '@/lib/firebase';
import { Beast } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'afc_custom_beasts';

function getLocalCustomBeasts(): Beast[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCustomBeast(beast: Beast): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCustomBeasts();
    const updated = [beast, ...current.filter((b) => b.id !== beast.id)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
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

  saveLocalCustomBeast(newBeast);

  try {
    const beastDocRef = doc(db, 'beasts', id);
    await setDoc(beastDocRef, newBeast);
  } catch (error) {
    console.warn('Firestore write error:', error);
  }

  return newBeast;
}

/**
 * Fetches a single beast by ID from Firestore (with local cache fallback)
 */
export async function getBeastById(id: string): Promise<Beast | null> {
  // Check local cache
  const localList = getLocalCustomBeasts();
  const localMatch = localList.find((b) => b.id === id);
  if (localMatch) return localMatch;

  // Check Firestore
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
 * Fetches all beasts belonging to a specific wallet address from Firestore
 */
export async function getBeastsByOwner(ownerAddress: string): Promise<Beast[]> {
  if (!ownerAddress) return [];
  const normalizedOwner = ownerAddress.toLowerCase();
  const results: Beast[] = [];

  // Local beasts
  const localList = getLocalCustomBeasts().filter(
    (b) => b.ownerAddress?.toLowerCase() === normalizedOwner
  );
  results.push(...localList);

  // Firestore query
  try {
    const q = query(
      collection(db, 'beasts'),
      where('ownerAddress', '==', ownerAddress)
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

  return results;
}

/**
 * Fetches all live beasts for the Arena and Leaderboards from Firestore
 */
export async function getAllBeasts(): Promise<Beast[]> {
  const results: Beast[] = [...getLocalCustomBeasts()];

  try {
    const q = query(collection(db, 'beasts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const b = d.data() as Beast;
      if (!results.some((r) => r.id === b.id)) {
        results.push(b);
      }
    });
  } catch (error) {
    console.warn('Error fetching all beasts from Firestore:', error);
  }

  return results;
}
