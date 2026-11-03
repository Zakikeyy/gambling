import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, Crown, X, Flame, Sparkles, Filter, ChevronDown, User, Radio, TrendingDown, AlertTriangle, ShieldAlert } from 'lucide-react';
import { SyncedPlayer } from '../services/leaderboardService';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNickname: string;
  currentBalance: number;
  currentTotalLosses: number;
  gameWins: Record<string, number>;
  livePlayers: SyncedPlayer[];
  currentUserId?: string;
}

interface DisplayPlayer {
  id: string;
  name: string;
  balance: number;
  score: number;
  totalLosses: number;
  isCurrentUser?: boolean;
  avatar: string;
}

const DEFAULT_AVATARS = ['👑', '💎', '🎰', '🐋', '🛡️', '🎲', '🪙', '🏇', '🎪', '⭐', '🔥', '💀', '📉'];

const GAME_OPTIONS: { id: string; label: string; icon: string }[] = [
  { id: 'mines', label: 'Mines (Diamond)', icon: '💎' },
  { id: 'slots', label: 'Mesin Slot (777)', icon: '🎰' },
  { id: 'blackjack', label: 'Blackjack 21', icon: '🃏' },
  { id: 'roulette', label: 'Rolet Eropa', icon: '🎡' },
  { id: 'baccarat', label: 'Baccarat', icon: '🎴' },
  { id: 'craps', label: 'Craps Dadu', icon: '🎲' },
  { id: 'scratch', label: 'Kartu Gosok', icon: '🎫' },
  { id: 'horses', label: 'Pacuan Kuda', icon: '🏇' },
  { id: 'wheel', label: 'Wheel of Fortune', icon: '🎪' },
  { id: 'plinko', label: 'Plinko Drop', icon: '🪙' },
];

export default function LeaderboardModal({
  isOpen,
  onClose,
  currentNickname,
  currentBalance,
  currentTotalLosses = 0,
  gameWins,
  livePlayers = [],
  currentUserId,
}: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<'balance' | 'loss' | 'game'>('balance');
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('slots');

  if (!isOpen) return null;

  // 1. Current user
  const userBalancePlayer: DisplayPlayer = {
    id: currentUserId || 'current-user',
    name: `${currentNickname} (Anda)`,
    balance: currentBalance,
    score: currentBalance,
    totalLosses: currentTotalLosses,
    isCurrentUser: true,
    avatar: '😎',
  };

  // 2. Map other live players from Firebase Firestore (NO dummy baseline players)
  const otherLivePlayers: DisplayPlayer[] = livePlayers
    .filter((p) => p.userId !== currentUserId)
    .map((p, idx) => ({
      id: p.userId || `live-${idx}`,
      name: p.nickname,
      balance: p.balance,
      score: p.balance,
      totalLosses: p.totalLosses || 0,
      avatar: DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length],
    }));

  const combinedBalancePlayers = [userBalancePlayer, ...otherLivePlayers];

  // Deduplicate by name
  const uniqueBalanceMap = new Map<string, DisplayPlayer>();
  combinedBalancePlayers.forEach((p) => {
    if (!uniqueBalanceMap.has(p.name)) {
      uniqueBalanceMap.set(p.name, p);
    }
  });

  const allBalancePlayers = Array.from(uniqueBalanceMap.values());

  // Balance Leaderboard
  const balanceLeaderboard = [...allBalancePlayers].sort((a, b) => b.balance - a.balance);
  const currentUserBalanceRank = balanceLeaderboard.findIndex((p) => p.isCurrentUser) + 1;

  // Loss Leaderboard
  const lossLeaderboard = [...allBalancePlayers].sort((a, b) => b.totalLosses - a.totalLosses);
  const currentUserLossRank = lossLeaderboard.findIndex((p) => p.isCurrentUser) + 1;

  // Per-Game Win List
  const userGameWinScore = gameWins[selectedGameFilter] || 0;
  const userGamePlayer: DisplayPlayer = {
    id: currentUserId ? `game-${currentUserId}` : 'current-user-game',
    name: `${currentNickname} (Anda)`,
    balance: currentBalance,
    score: userGameWinScore,
    totalLosses: currentTotalLosses,
    isCurrentUser: true,
    avatar: '😎',
  };

  const otherLiveGamePlayers: DisplayPlayer[] = livePlayers
    .filter((p) => p.userId !== currentUserId)
    .map((p, idx) => ({
      id: `live-g-${p.userId}`,
      name: p.nickname,
      balance: p.balance,
      score: p.gameWins?.[selectedGameFilter] || 0,
      totalLosses: p.totalLosses || 0,
      avatar: DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length],
    }))
    .filter((p) => p.score > 0);

  const combinedGamePlayers = [userGamePlayer, ...otherLiveGamePlayers];

  const uniqueGameMap = new Map<string, DisplayPlayer>();
  combinedGamePlayers.forEach((p) => {
    if (!uniqueGameMap.has(p.name)) {
      uniqueGameMap.set(p.name, p);
    }
  });

  const gameLeaderboard = Array.from(uniqueGameMap.values()).sort((a, b) => b.score - a.score);
  const currentUserGameRank = gameLeaderboard.findIndex((p) => p.isCurrentUser) + 1;

  let currentList = balanceLeaderboard;
  let currentUserRank = currentUserBalanceRank;

  if (activeTab === 'loss') {
    currentList = lossLeaderboard;
    currentUserRank = currentUserLossRank;
  } else if (activeTab === 'game') {
    currentList = gameLeaderboard;
    currentUserRank = currentUserGameRank;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl bg-gradient-to-b from-[#1c1c1c] via-[#141414] to-[#101010] border border-amber-500/30 rounded-3xl p-5 sm:p-6 text-white shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl shadow-lg shadow-amber-950/40 text-black font-black">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wider text-white">
                  PAPAN PERINGKAT GLOBAL
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Firebase Live (Organic)
                </span>
              </div>
              <p className="text-[11px] text-amber-400 font-medium">
                Tersinkronisasi Real-Time Pemain Organik di Database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-[#252525] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3-Tab Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#111111] rounded-2xl border border-[#2b2b2b] mb-3">
          <button
            onClick={() => setActiveTab('balance')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'balance'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Crown size={14} />
            <span>Koin Terbanyak</span>
          </button>

          <button
            onClick={() => setActiveTab('loss')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'loss'
                ? 'bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-md'
                : 'text-neutral-400 hover:text-rose-300'
            }`}
          >
            <TrendingDown size={14} />
            <span>Total Kerugian</span>
          </button>

          <button
            onClick={() => setActiveTab('game')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'game'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Flame size={14} />
            <span>Win per Game</span>
          </button>
        </div>

        {activeTab === 'game' && (
          <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] text-neutral-400 font-semibold whitespace-nowrap pl-1">
              Pilih Game:
            </span>
            {GAME_OPTIONS.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGameFilter(g.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                  selectedGameFilter === g.id
                    ? 'bg-purple-600 text-white shadow-sm font-bold'
                    : 'bg-[#1b1b1b] text-neutral-400 hover:text-white border border-[#2d2d2d]'
                }`}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Leaderboard List or Empty State */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mb-3 max-h-72">
          {currentList.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 space-y-2">
              <div className="text-3xl">🏆</div>
              <p className="text-xs">Belum ada pemain lain yang aktif di leaderboard.</p>
              <p className="text-[11px] text-neutral-500">Papan peringkat akan terisi otomatis saat pemain organik terhubung ke Firebase.</p>
            </div>
          ) : (
            currentList.map((player, idx) => {
              const rank = idx + 1;
              const isYou = player.isCurrentUser;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                    isYou
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white font-bold'
                      : 'bg-[#161616] border-[#292929] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 text-center font-mono font-bold text-amber-400 text-[11px]">
                      #{rank}
                    </span>
                    <span className="text-base">{player.avatar}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${isYou ? 'text-emerald-300' : 'text-white'}`}>
                          {player.name}
                        </span>
                        {isYou && (
                          <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/40">
                            Anda
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {activeTab === 'loss'
                          ? `Sisa Saldo: 🪙 ${player.balance.toLocaleString()} Koin`
                          : `Total Rugi ke Bandar: 🛑 -${player.totalLosses.toLocaleString()} Koin`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {activeTab === 'loss' ? (
                      <div className="font-mono font-bold text-rose-400">
                        🛑 -{player.totalLosses.toLocaleString()} Koin
                      </div>
                    ) : activeTab === 'balance' ? (
                      <div className="font-mono font-bold text-amber-300">
                        🪙 {player.balance.toLocaleString()} Koin
                      </div>
                    ) : (
                      <div className="font-mono font-bold text-purple-300">
                        🏆 +{player.score.toLocaleString()} Koin
                      </div>
                    )}
                    <span className="text-[9px] text-neutral-500">
                      {activeTab === 'loss' ? 'Koin Hangus' : activeTab === 'balance' ? 'Saldo Aktif' : 'Kemenangan Game'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky User Position Card at Bottom */}
        <div className="p-3 rounded-2xl bg-[#19241c] border border-emerald-500/40 flex flex-wrap items-center justify-between text-xs gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">😎</span>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Peringkat Anda:</span>
                <span className="text-emerald-400 font-extrabold font-mono text-sm">
                  #{currentUserRank > 0 ? currentUserRank : 1}
                </span>
                <span className="text-neutral-400 font-normal">
                  dari {currentList.length} Pemain
                </span>
              </div>
              <div className="text-[10px] text-neutral-300">
                {activeTab === 'loss'
                  ? 'Urutan Berdasarkan Total Kerugian'
                  : activeTab === 'balance'
                  ? 'Urutan Berdasarkan Total Saldo Koin'
                  : `Total Kemenangan di Game ${GAME_OPTIONS.find((g) => g.id === selectedGameFilter)?.label}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[10px] text-neutral-400 uppercase">Saldo Anda</div>
              <div className="text-sm font-black text-amber-300 font-mono">
                🪙 {currentBalance.toLocaleString()}
              </div>
            </div>

            <div className="pl-3 border-l border-emerald-500/30">
              <div className="text-[10px] text-rose-400 uppercase font-bold">Total Kerugian</div>
              <div className="text-sm font-black text-rose-400 font-mono">
                🛑 -{currentTotalLosses.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-neutral-500 pt-2 border-t border-[#262626]">
          🛑 Papan peringkat organik murni dari database Firebase player online. #StopJudi
        </div>
      </motion.div>
    </div>
  );
}
