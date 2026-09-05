import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { EventPrediction } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prediction: EventPrediction = body.prediction;

    if (!prediction || !prediction.id || !prediction.userAddress) {
      return NextResponse.json({ error: 'Missing required prediction fields' }, { status: 400 });
    }

    const normalizedUser = prediction.userAddress.toLowerCase();
    const docToSave = {
      ...prediction,
      userAddress: normalizedUser,
      createdAt: prediction.createdAt || Date.now(),
    };

    const docRef = doc(db, 'predictions', prediction.id);
    await setDoc(docRef, docToSave);

    return NextResponse.json({ success: true, prediction: docToSave });
  } catch (error) {
    console.error('Error logging prediction:', error);
    return NextResponse.json({ error: 'Failed to record prediction' }, { status: 500 });
  }
}
