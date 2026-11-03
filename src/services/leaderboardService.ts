/**
 * Real-time Firebase Firestore Leaderboard Service
 * Synchronizes player balance and per-game winnings across all online players
 */

import { doc, setDoc, collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db, auth, initFirebaseAuth } from '../firebase';

export interface SyncedPlayer {
  id: string;
  userId: string;
  nickname: string;
  balance: number;
  totalWins: number;
  totalLosses: number;
  gameWins: Record<string, number>;
  updatedAt?: string;
}

/**
 * Sync current player's score to global Firestore leaderboard
 */
export async function syncPlayerScore(
  nickname: string,
  balance: number,
  totalWins: number,
  totalLosses: number,
  gameWins: Record<string, number>
): Promise<void> {
  try {
    let currentUser = auth.currentUser;
    if (!currentUser) {
      currentUser = await initFirebaseAuth();
    }
    if (!currentUser) return;

    const playerRef = doc(db, 'leaderboard', currentUser.uid);
    await setDoc(
      playerRef,
      {
        userId: currentUser.uid,
        nickname: nickname.trim() || 'Pemain Anonim',
        balance: Math.max(0, balance),
        totalWins: Math.max(0, totalWins),
        totalLosses: Math.max(0, totalLosses),
        gameWins: gameWins || {},
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Leaderboard sync warning:', err);
  }
}

/**
 * Subscribe to real-time leaderboard updates from Firestore
 */
export function subscribeToLeaderboard(
  onUpdate: (players: SyncedPlayer[]) => void
): () => void {
  try {
    const q = query(collection(db, 'leaderboard'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const players: SyncedPlayer[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          players.push({
            id: docSnap.id,
            userId: data.userId || docSnap.id,
            nickname: data.nickname || 'Pemain',
            balance: typeof data.balance === 'number' ? data.balance : 0,
            totalWins: typeof data.totalWins === 'number' ? data.totalWins : 0,
            totalLosses: typeof data.totalLosses === 'number' ? data.totalLosses : 0,
            gameWins: data.gameWins || {},
            updatedAt: data.updatedAt,
          });
        });
        onUpdate(players);
      },
      (error) => {
        console.warn('Leaderboard snapshot error:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to leaderboard:', err);
    return () => {};
  }
}
