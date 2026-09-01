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
import { MOCK_BEASTS } from '@/lib/mockData';

const LOCAL_STORAGE_KEY = 'afc_custom_beasts';

// Helper to get locally stored beasts
function getLocalCustomBeasts(): Beast[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save locally
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
 * Creates and persists a new Beast into Firestore (with local fallback cache)
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

  // Always save to local cache for instant zero-latency UI feedback
  saveLocalCustomBeast(newBeast);

  try {
    const beastDocRef = doc(db, 'beasts', id);
    await setDoc(beastDocRef, newBeast);
  } catch (error) {
    console.warn('Firestore write fallback to local storage:', error);
  }

  return newBeast;
}

/**
 * Fetches a single beast by ID from Firestore, local cache, or seed mocks
 */
export async function getBeastById(id: string): Promise<Beast | null> {
  // 1. Check local cache first
  const localList = getLocalCustomBeasts();
  const localMatch = localList.find((b) => b.id === id);
  if (localMatch) return localMatch;

  // 2. Check seed mock beasts
  const mockMatch = MOCK_BEASTS.find((b) => b.id === id);
  if (mockMatch) return mockMatch;

  // 3. Check Firestore
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
 * Fetches all beasts belonging to a specific wallet address
 */
export async function getBeastsByOwner(ownerAddress: string): Promise<Beast[]> {
  const normalizedOwner = ownerAddress.toLowerCase();
  const results: Beast[] = [];

  // 1. Local custom beasts
  const localList = getLocalCustomBeasts().filter(
    (b) => b.ownerAddress.toLowerCase() === normalizedOwner
  );
  results.push(...localList);

  // 2. Mock beasts if matching
  const mockMatches = MOCK_BEASTS.filter(
    (b) => b.ownerAddress.toLowerCase() === normalizedOwner || (normalizedOwner.startsWith('0x38f2') && b.ownerAddress.startsWith('0x38F2'))
  );
  for (const m of mockMatches) {
    if (!results.some((r) => r.id === m.id)) {
      results.push(m);
    }
  }

  // 3. Firestore query
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
 * Fetches all beasts for the Arena and Leaderboards
 */
export async function getAllBeasts(): Promise<Beast[]> {
  const results: Beast[] = [...getLocalCustomBeasts()];

  // Add default mock beasts
  for (const m of MOCK_BEASTS) {
    if (!results.some((r) => r.id === m.id)) {
      results.push(m);
    }
  }

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
