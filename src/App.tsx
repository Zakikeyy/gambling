/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * THE HOUSE WINS • VEGAS CASINO SIMULATION
 * Visi & Misi Edukasi: Menyadarkan bahwa dalam perjudian, bandar selalu menang (The House Always Wins).
 * Tidak ada kemenangan jangka panjang di dunia judi. #StopJudi
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  User,
  Volume2,
  VolumeX,
  Coins,
  Gift,
  Clock,
  ArrowLeft,
  ChevronRight,
  Flame,
  Search,
  RotateCcw,
  BarChart3,
  X,
  AlertCircle,
  ShieldAlert,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';

import { GameTab, GameInfo, GameOutcome } from './types/game';
import { sounds } from './utils/audio';
import {
  loadCasinoData,
  saveCasinoData,
  getTodayDateStr,
  getTimeUntilMidnight,
  checkIsClaimableToday,
  CasinoSaveData,
  getDefaultCasinoData,
  loadAccountsRegistry,
  saveAccountsRegistry,
} from './utils/storage';

import MinesGame from './components/MinesGame';
import SlotMachineGame from './components/SlotMachineGame';
import BlackjackGame from './components/BlackjackGame';
import RouletteGame from './components/RouletteGame';
import BaccaratGame from './components/BaccaratGame';
import CrapsGame from './components/CrapsGame';
import ScratchCardGame from './components/ScratchCardGame';
import HorseRacingGame from './components/HorseRacingGame';
import WheelOfFortuneGame from './components/WheelOfFortuneGame';
import PlinkoGame from './components/PlinkoGame';
import CrashGame from './components/CrashGame';
import KenoGame from './components/KenoGame';
import LeaderboardModal from './components/LeaderboardModal';
import ResearchArchivePage from './components/ResearchArchivePage';
import GameScientificHeader from './components/GameScientificHeader';
import ScientificFeedbackModal, { ScientificFeedbackEvent } from './components/ScientificFeedbackModal';
import TokenAuthModal from './components/TokenAuthModal';
import AntiGamblingWelcomeModal from './components/AntiGamblingWelcomeModal';
import {
  SCIENTIFIC_WIN_EXPLANATIONS,
  SCIENTIFIC_LOSS_EXPLANATIONS,
} from './data/researchData';
import { initFirebaseAuth, testConnection } from './firebase';
import {
  subscribeToLeaderboard,
  syncPlayerScore,
  SyncedPlayer,
} from './services/leaderboardService';

const ALL_GAMES: GameInfo[] = [
  {
    id: 'mines',
    title: 'Mines (Diamond & Bom)',
    category: 'Tebak Grid',
    icon: '💎',
    badge: 'High Risk',
    description: 'Buka diamond dan hindari bom dalam grid 4x4. Ilusi keberuntungan sebelum akhirnya meledak!',
  },
  {
    id: 'slots',
    title: 'Mesin Slot (777 Vegas)',
    category: 'Kasino',
    icon: '🎰',
    badge: 'RNG Murni',
    description: 'Putar 3 gulungan penuh kilauan lampu Vegas yang dirancang menguras koin sedikit demi sedikit.',
  },
  {
    id: 'blackjack',
    title: 'Blackjack 21',
    category: 'Kartu',
    icon: '🃏',
    badge: 'Dealer Edge',
    description: 'Lawan dealer dengan kartu 21. Dealer selalu bertindak terakhir dan memiliki keuntungan matematis.',
  },
  {
    id: 'roulette',
    title: 'Rolet Eropa (0-36)',
    category: 'Meja',
    icon: '🎡',
    badge: 'Angka 0 Hijau',
    description: 'Tebak angka atau warna. Angka 0 hijau menjamin keuntungan matematis bandar 2.7%.',
  },
  {
    id: 'baccarat',
    title: 'Baccarat (Punto Banco)',
    category: 'Kartu',
    icon: '🎴',
    badge: 'Komisi Bandar',
    description: 'Taruhan Player atau Banker. Menang di Banker selalu dipotong komisi oleh kasino.',
  },
  {
    id: 'craps',
    title: 'Craps Dadu Kasino',
    category: 'Dadu',
    icon: '🎲',
    badge: 'Seven Out',
    description: 'Lempar sepasang dadu. Angka 7 yang paling sering muncul secara statistik akan menghabisi taruhan Anda.',
  },
  {
    id: 'scratch',
    title: 'Kartu Gosok (Scratchcards)',
    category: 'Instan',
    icon: '🎫',
    badge: 'Ilusi Instan',
    description: 'Gosok panel digital instan. Algoritma selalu menjaga rasio kemenangan jauh di bawah total pembelian tiket.',
  },
  {
    id: 'horses',
    title: 'Pacuan Kuda (Derby Racing)',
    category: 'Balapan',
    icon: '🏇',
    badge: 'Bandar Potong',
    description: 'Taruhan pacuan kuda. Kasino selalu mengambil potongan (takeout) di setiap putaran taruhan.',
  },
  {
    id: 'wheel',
    title: 'Wheel of Fortune (Big Six)',
    category: 'Roda',
    icon: '🎪',
    badge: 'House Edge 15%+',
    description: 'Roda vertikal raksasa dengan house edge tertinggi di kasino Vegas, sangat sulit untuk menang konsisten.',
  },
  {
    id: 'plinko',
    title: 'Plinko Drop',
    category: 'Arkade',
    icon: '🪙',
    badge: 'Distribusi Normal',
    description: 'Jatuhkan bola melewati labirin pasak. Sebagian besar bola akan mendarat di lubang pengali rendah.',
  },
  {
    id: 'crash',
    title: 'Crash Vegas (Rocket Multiplier)',
    category: 'Arkade & Instan',
    icon: '🚀',
    badge: 'Random Crash',
    description: 'Grafik pengali roket naik eksponensial. Amankan profit sebelum algoritma memicu crash mendadak.',
  },
  {
    id: 'keno',
    title: 'Keno Vegas (Lotere 80 Angka)',
    category: 'Instan',
    icon: '🎱',
    badge: 'House Edge 25%',
    description: 'Pilih hingga 10 angka dari 80 bola. Perangkap matematis dengan house edge tertinggi di kasino.',
  },
];

export default function App() {
  const initialLoad = loadCasinoData();
  const [casinoData, setCasinoData] = useState<CasinoSaveData>(initialLoad.data);
  const [tokenAuthOpen, setTokenAuthOpen] = useState<boolean>(initialLoad.isNewAccount);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState<boolean>(initialLoad.isNewAccount);
  const [selectedGameId, setSelectedGameId] = useState<GameTab | null>(null);
  const [inputNickname, setInputNickname] = useState<string>('');
  const [isEditingNickname, setIsEditingNickname] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showMissionModal, setShowMissionModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Admin Top-up Other Token State
  const [adminTargetToken, setAdminTargetToken] = useState<string>('');

  const handleAdminTopupOtherToken = (token: string, amount: number) => {
    if (!token.trim()) {
      alert('Masukkan atau pilih token akun tujuan terlebih dahulu!');
      return;
    }
    const registry = loadAccountsRegistry();
    if (!registry[token]) {
      alert(`Token akun "${token}" tidak ditemukan di registry!`);
      return;
    }
    registry[token].balance += amount;
    saveAccountsRegistry(registry);

    // If target token is current active player, update current state too
    if (token === casinoData.token) {
      const updated = saveCasinoData({ balance: registry[token].balance });
      setCasinoData(updated);
    }

    sounds.playJackpot();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    alert(`Berhasil menambahkan +${amount.toLocaleString()} koin ke akun token ${token} (${registry[token].nickname})!`);
    setAdminTargetToken('');
  };

  // Dedicated Academic Research Page State
  const [showResearchPage, setShowResearchPage] = useState<boolean>(false);

  // Real-time Scientific Feedback for Win & Loss based on 7 Journals
  const [scientificFeedbackModalEvent, setScientificFeedbackModalEvent] = useState<ScientificFeedbackEvent | null>(null);
  const [lastResultFeedback, setLastResultFeedback] = useState<{
    type: 'win' | 'loss';
    amount: number;
    title: string;
    quote: string;
    source: string;
    explanation: string;
  } | null>(null);

  // Real-time Firebase Leaderboard
  const [livePlayers, setLivePlayers] = useState<SyncedPlayer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Filter and search
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');

  // Live countdown to midnight 00:00
  const [countdown, setCountdown] = useState<string>(getTimeUntilMidnight().formatted);

  // Initialize Firebase Auth & Real-time Leaderboard subscription
  useEffect(() => {
    testConnection();
    initFirebaseAuth().then((user) => {
      if (user) {
        setCurrentUserId(user.uid);
        syncPlayerScore(
          casinoData.nickname,
          casinoData.balance,
          casinoData.stats.totalWins,
          casinoData.stats.totalLosses,
          casinoData.stats.gameWins
        );
      }
    });

    const unsubscribe = subscribeToLeaderboard((players) => {
      setLivePlayers(players);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    sounds.enabled = casinoData.soundEnabled;
    const interval = setInterval(() => {
      setCountdown(getTimeUntilMidnight().formatted);
    }, 1000);
    return () => clearInterval(interval);
  }, [casinoData.soundEnabled]);

  const canClaimDaily = checkIsClaimableToday(casinoData.lastClaimDate);

  const toggleSound = () => {
    const newState = !casinoData.soundEnabled;
    sounds.enabled = newState;
    const updated = saveCasinoData({ soundEnabled: newState });
    setCasinoData(updated);
  };

  // Deduct stake or add payout to player balance
  const handleUpdateBalance = (amount: number) => {
    // Note: Negative amounts represent placing a bet at the start of a round.
    // They are NOT losses yet! Full scientific win/loss modals and academic feedback
    // are strictly evaluated in handleGameEnd when the round finishes.
    setCasinoData((prev) => {
      const newBal = Math.max(0, prev.balance + amount);
      const isWin = amount > 0;
      const gameWins = { ...prev.stats.gameWins };
      if (isWin && selectedGameId) {
        gameWins[selectedGameId] = (gameWins[selectedGameId] || 0) + amount;
      }

      const updatedStats = {
        totalBets: prev.stats.totalBets + (amount < 0 ? Math.abs(amount) : 0),
        totalWins: prev.stats.totalWins + (isWin ? amount : 0),
        totalLosses: prev.stats.totalLosses,
        biggestWin: Math.max(prev.stats.biggestWin, isWin ? amount : 0),
        gameWins,
      };

      const updated = saveCasinoData({
        balance: newBal,
        stats: updatedStats,
      });

      // Synchronize with global Firebase leaderboard
      syncPlayerScore(
        prev.nickname,
        newBal,
        updatedStats.totalWins,
        updatedStats.totalLosses,
        updatedStats.gameWins
      );

      return updated;
    });
  };

  // Called strictly when a game round concludes and outcome is finalized
  const handleGameEnd = (outcome: GameOutcome) => {
    const isWin = outcome.type === 'win';
    const isLoss = outcome.type === 'loss';
    const netAmount = isWin
      ? (outcome.netProfit ?? (outcome.payout ? outcome.payout - outcome.betAmount : outcome.betAmount))
      : (outcome.netProfit ? Math.abs(outcome.netProfit) : outcome.betAmount);

    if (isWin || isLoss) {
      const list = isWin ? SCIENTIFIC_WIN_EXPLANATIONS : SCIENTIFIC_LOSS_EXPLANATIONS;
      const picked = list[Math.abs(netAmount) % list.length];

      setLastResultFeedback({
        type: isWin ? 'win' : 'loss',
        amount: isWin ? netAmount : -netAmount,
        title: picked.title,
        quote: picked.quote,
        source: picked.source,
        explanation: picked.explanation,
      });

      // Show scientific modal popup on completion of round
      setScientificFeedbackModalEvent({
        type: isWin ? 'win' : 'loss',
        amount: isWin ? netAmount : -netAmount,
        gameTitle: selectedGameId ? ALL_GAMES.find((g) => g.id === selectedGameId)?.title : undefined,
      });

      // Record losses in stats
      if (isLoss) {
        setCasinoData((prev) => {
          const updatedStats = {
            ...prev.stats,
            totalLosses: prev.stats.totalLosses + netAmount,
          };
          const updated = saveCasinoData({ stats: updatedStats });
          syncPlayerScore(
            prev.nickname,
            prev.balance,
            updatedStats.totalWins,
            updatedStats.totalLosses,
            updatedStats.gameWins
          );
          return updated;
        });
      }
    }
  };

  const handleClaimDailyCoins = () => {
    if (!canClaimDaily) {
      setClaimToast(`Login harian sudah diklaim hari ini! Reset pada pukul 00:00 (${countdown} lagi).`);
      setTimeout(() => setClaimToast(null), 3000);
      return;
    }

    sounds.playJackpot();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    const newBalance = casinoData.balance + 200;
    const updated = saveCasinoData({
      balance: newBalance,
      lastClaimDate: getTodayDateStr(),
    });

    setCasinoData(updated);
    setClaimToast('🎁 Selamat! Anda mendapatkan jatah harian +200 koin!');
    setTimeout(() => setClaimToast(null), 4000);

    // Synchronize balance update to Firestore
    syncPlayerScore(
      casinoData.nickname,
      newBalance,
      casinoData.stats.totalWins,
      casinoData.stats.totalLosses,
      casinoData.stats.gameWins
    );
  };

  const handleResetData = () => {
    if (window.confirm('Mereset saldo kembali ke 1.000 koin dan mengulang simulasi?')) {
      const reset = getDefaultCasinoData();
      saveCasinoData(reset);
      setCasinoData(reset);
      setSelectedGameId(null);
      sounds.playChip();

      // Synchronize reset to Firestore
      syncPlayerScore(
        reset.nickname,
        reset.balance,
        reset.stats.totalWins,
        reset.stats.totalLosses,
        reset.stats.gameWins
      );
    }
  };

  const currentGame = ALL_GAMES.find((g) => g.id === selectedGameId);

  // Filtered games in lobby
  const filteredGames = ALL_GAMES.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      g.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      g.category.toLowerCase().includes(searchFilter.toLowerCase());

    if (categoryFilter === 'Semua') return matchesSearch;
    if (categoryFilter === 'Kartu') return matchesSearch && (g.id === 'blackjack' || g.id === 'baccarat');
    if (categoryFilter === 'Kasino & Meja') return matchesSearch && (g.id === 'slots' || g.id === 'roulette' || g.id === 'craps');
    if (categoryFilter === 'Arkade & Instan') return matchesSearch && (g.id === 'plinko' || g.id === 'scratch' || g.id === 'wheel' || g.id === 'horses');
    if (categoryFilter === 'Tebak Grid') return matchesSearch && g.id === 'mines';
    return matchesSearch;
  });

  if (showResearchPage) {
    return <ResearchArchivePage onBack={() => setShowResearchPage(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white selection:bg-rose-500 selection:text-white">
      {/* Top Navbar Header */}
      <header className="w-full bg-[#121212] border-b border-[#242424] px-4 py-3 sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo / Brand or Back Button */}
          <div className="flex items-center gap-3">
            {selectedGameId !== null ? (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  sounds.playChip();
                  setSelectedGameId(null);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:brightness-110 text-white font-black text-xs shadow-md transition-all cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>KEMBALI KE LOBI</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 flex items-center justify-center text-xl shadow-lg shadow-rose-950/50">
                  🎰
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-black tracking-wider text-white">THE HOUSE WINS</h1>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      🛑 #StopJudi
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Vegas Simulation • Bandar Always Win</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* User Nickname, Bankroll, Daily Claim & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Scientific Research Page Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowResearchPage(true)}
              title="Pusat Kajian Riset & Bukti Ilmiah #StopJudi (8 Jurnal & Prosiding Penelitian)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/60 to-amber-950/60 border border-rose-500/50 text-white text-xs font-bold hover:brightness-125 transition-all cursor-pointer shadow-sm"
            >
              <BookOpen size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Kajian Riset (8 Jurnal)</span>
            </motion.button>

            {/* Leaderboard Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLeaderboardModal(true)}
              title="Papan Peringkat Koin & Win per Game"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              <Trophy size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </motion.button>

            {/* Mission / Visi Misi Button */}
            <button
              onClick={() => setShowMissionModal(true)}
              title="Visi & Misi Edukasi #StopJudi"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-900/40 transition-colors cursor-pointer"
            >
              <HeartHandshake size={14} className="text-rose-400" />
              <span className="hidden sm:inline">Visi Misi</span>
            </button>

            {/* Player Nickname */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#1a1a1a] px-3 py-1.5 rounded-xl border border-[#333] text-xs">
              <User size={14} className="text-amber-400" />
              {isEditingNickname ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputNickname.trim()) {
                      const trimmed = inputNickname.trim();
                      const updated = saveCasinoData({ nickname: trimmed });
                      setCasinoData(updated);
                      syncPlayerScore(
                        trimmed,
                        casinoData.balance,
                        casinoData.stats.totalWins,
                        casinoData.stats.totalLosses,
                        casinoData.stats.gameWins
                      );
                    }
                    setIsEditingNickname(false);
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="text"
                    value={inputNickname}
                    onChange={(e) => setInputNickname(e.target.value)}
                    className="w-24 bg-black px-1.5 py-0.5 rounded text-white text-xs border border-amber-500 outline-none"
                    autoFocus
                  />
                  <button type="submit" className="text-[10px] text-amber-400 font-bold">
                    OK
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => {
                    setInputNickname(casinoData.nickname);
                    setIsEditingNickname(true);
                  }}
                  className="text-neutral-200 hover:text-white font-medium"
                >
                  {casinoData.nickname} ✎
                </button>
              )}
            </div>

            {/* Chip Balance Display */}
            <div className="flex items-center gap-2 bg-[#1a1710] border border-amber-500/30 px-3.5 py-1.5 rounded-xl shadow-inner">
              <Coins size={16} className="text-amber-400" />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] uppercase tracking-wider text-amber-400/80 font-bold">SALDO KOIN</span>
                <span className="text-sm font-black text-amber-300 font-mono">
                  {casinoData.balance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Daily Login Claim Button (Only show if claimable) */}
            {canClaimDaily && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClaimDailyCoins}
                title="Klaim Login Harian +200 Koin!"
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 cursor-pointer animate-pulse"
              >
                <Gift size={14} />
                <span>Klaim +200 🪙</span>
              </motion.button>
            )}

            {/* Stats Button */}
            <button
              onClick={() => setShowStatsModal(true)}
              title="Statistik Taruhan"
              className="p-2 rounded-xl bg-[#222] hover:bg-[#2c2c2c] border border-[#383838] text-neutral-300 transition-colors cursor-pointer"
            >
              <BarChart3 size={16} />
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={casinoData.soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
              className="p-2 rounded-xl bg-[#222] hover:bg-[#2c2c2c] border border-[#383838] text-neutral-300 transition-colors cursor-pointer"
            >
              {casinoData.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {claimToast && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-md mx-auto mt-2 bg-gradient-to-r from-amber-500 to-rose-500 text-black text-center text-xs font-bold py-2 px-4 rounded-xl shadow-lg"
            >
              {claimToast}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Zero Balance Warning Banner (Awareness) */}
      {casinoData.balance <= 0 && (
        <div className="w-full bg-rose-950/80 border-b border-rose-500/50 px-4 py-2.5 text-center text-xs text-rose-200 flex flex-wrap items-center justify-center gap-2">
          <ShieldAlert size={16} className="text-rose-400" />
          <span className="font-semibold">
            Saldo Anda habis menjadi 0! Inilah kenyataan judi: Semakin lama Anda bermain, bandar yang akan meraup segalanya. <strong>#StopJudi</strong>
          </span>
          <button
            onClick={handleResetData}
            className="underline font-bold text-amber-300 hover:text-white ml-2 cursor-pointer"
          >
            Ulang Simulasi (1.000 Koin)
          </button>
        </div>
      )}

      {/* Main View Transition with Framer Motion */}
      <AnimatePresence mode="wait">
        {selectedGameId === null ? (
          /* VIEW 1: LOBBY */
          <motion.div
            key="lobby-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 flex flex-col"
          >
            {/* Hero Welcome Banner with High-Energy Playzelo Vibe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#201016] via-[#1a0f24] to-[#121620] border border-rose-500/40 p-6 sm:p-8 mb-8 shadow-2xl shadow-rose-950/30"
            >
              {/* Floating Neon Decorative Icons */}
              <div className="absolute right-4 top-4 text-4xl sm:text-6xl opacity-30 select-none pointer-events-none animate-pulse">
                🎰
              </div>
              <div className="absolute right-24 bottom-2 text-2xl sm:text-4xl opacity-20 select-none pointer-events-none">
                🪙
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold mb-3 shadow-sm">
                  <Flame size={14} className="text-rose-400 animate-bounce" />
                  <span>The House Always Wins • Vegas High-Energy Simulation</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md">
                  THE HOUSE WINS <span className="text-amber-400">VEGAS</span>
                </h2>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-4">
                  Selamat datang di simulasi kasino Vegas. Mainkan 10 game kasino populer dan buktikan secara empiris: <strong>tidak ada yang bisa menang melawan sistem kasino dalam jangka panjang</strong>. Bandar selalu menang! <strong>#StopJudi</strong>
                </p>

                {/* Action Buttons & Daily Bonus inside Hero */}
                <div className="flex flex-wrap items-center gap-3 pt-3 text-xs">
                  {canClaimDaily && (
                    <button
                      onClick={handleClaimDailyCoins}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-black font-extrabold flex items-center gap-2 shadow-lg shadow-amber-950/65 active:scale-95 cursor-pointer animate-pulse"
                    >
                      <Gift size={16} />
                      <span>Klaim Jatah Harian (+200 Koin)</span>
                    </button>
                  )}
                  <div className="bg-black/50 border border-amber-500/30 px-3 py-1.5 rounded-xl text-amber-300 font-bold font-mono">
                    Saldo: {casinoData.balance.toLocaleString()} Koin
                  </div>
                  <button
                    onClick={() => setShowLeaderboardModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trophy size={13} className="text-amber-400" />
                    <span>Leaderboard</span>
                  </button>
                  <button
                    onClick={() => setShowResearchPage(true)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600/50 via-amber-600/50 to-yellow-600/50 hover:bg-rose-600/70 border border-rose-500/40 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
                  >
                    <BookOpen size={13} className="text-amber-400" />
                    <span>Bedah 8 Jurnal Riset ➔</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Playzelo Style Tournament Promo Banner */}
            <div className="mb-8">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/80 via-rose-950/60 to-black border border-purple-500/40 p-4 shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                    🏆 VEGAS TOURNAMENT
                  </span>
                  <h4 className="font-extrabold text-sm sm:text-base text-white mt-1.5">
                    Earn 100 Free Spins & Test Probability
                  </h4>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    Simulasikan strategi taruhan dan lihat batas matematis bandar.
                  </p>
                </div>
                <div className="text-3xl sm:text-4xl pl-2">🎟️</div>
              </div>
            </div>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {['Semua', 'Kasino & Meja', 'Kartu', 'Arkade & Instan', 'Tebak Grid'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-rose-600 text-white shadow-md font-bold'
                        : 'bg-[#181818] text-neutral-400 hover:text-white border border-[#2b2b2b]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Cari game kasino..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-[#181818] border border-[#303030] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Grid of 10 Casino Game Cards */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  whileHover={{ scale: 1.025, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    sounds.playChip();
                    setSelectedGameId(game.id);
                  }}
                  className="group relative bg-gradient-to-b from-[#181818] to-[#121212] border border-[#282828] hover:border-rose-500/50 rounded-2xl p-5 shadow-lg hover:shadow-rose-950/40 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#222222] border border-[#333] group-hover:border-rose-500/30 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                        {game.icon}
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        {game.badge || game.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5">
                      {game.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      {game.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#222222] flex items-center justify-between text-xs font-bold text-rose-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>Mulai Simulasi</span>
                    <ChevronRight size={16} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          /* VIEW 2: INSIDE CHOSEN GAME */
          <motion.div
            key={`game-view-${selectedGameId}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 flex flex-col items-center"
          >
            {/* Clean In-Game Title Bar with Back Button */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-2xl flex items-center justify-between bg-[#161616] border border-[#262626] rounded-2xl px-4 py-2.5 mb-4 text-xs"
            >
              <button
                onClick={() => {
                  sounds.playChip();
                  setSelectedGameId(null);
                }}
                className="flex items-center gap-1.5 text-neutral-300 hover:text-white font-bold bg-[#222] hover:bg-[#2c2c2c] px-3 py-1.5 rounded-xl border border-[#333] transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Pilih Game Lain</span>
              </button>

              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <span className="text-lg">{currentGame?.icon}</span>
                <span>{currentGame?.title}</span>
              </div>

              <div className="text-rose-400 font-bold text-[11px] hidden sm:block">
                #StopJudi
              </div>
            </motion.div>

            {/* Scientific Probability Header for Active Game */}
            <div className="w-full max-w-2xl mb-2">
              <GameScientificHeader
                gameId={selectedGameId}
                onOpenResearchPage={() => setShowResearchPage(true)}
              />
            </div>

            {/* Render Active Game */}
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              {selectedGameId === 'mines' && (
                <MinesGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  nickname={casinoData.nickname}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'slots' && (
                <SlotMachineGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'blackjack' && (
                <BlackjackGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'roulette' && (
                <RouletteGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'baccarat' && (
                <BaccaratGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'craps' && (
                <CrapsGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'scratch' && (
                <ScratchCardGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'horses' && (
                <HorseRacingGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'wheel' && (
                <WheelOfFortuneGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'plinko' && (
                <PlinkoGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'crash' && (
                <CrashGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}

              {selectedGameId === 'keno' && (
                <KenoGame
                  balance={casinoData.balance}
                  onUpdateBalance={handleUpdateBalance}
                  onGameEnd={handleGameEnd}
                />
              )}
            </div>

            {/* Live Scientific Result Card */}
            {lastResultFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-2xl mt-4 p-4 rounded-2xl border text-xs shadow-lg ${
                  lastResultFeedback.type === 'win'
                    ? 'bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-black border-amber-500/40 text-amber-200'
                    : 'bg-gradient-to-r from-rose-950/40 via-red-950/20 to-black border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span>
                      {lastResultFeedback.type === 'win'
                        ? '⚠️ Kemenangan Semu (False Win)'
                        : '🛑 Realita Sistem: Bandar Selalu Menang'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono font-bold">
                      {lastResultFeedback.type === 'win'
                        ? `+${lastResultFeedback.amount.toLocaleString()} Koin`
                        : `${lastResultFeedback.amount.toLocaleString()} Koin`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setScientificFeedbackModalEvent({
                          type: lastResultFeedback.type,
                          amount: lastResultFeedback.amount,
                          gameTitle: currentGame?.title,
                        })
                      }
                      className="text-[11px] px-2 py-1 rounded bg-[#252525] hover:bg-[#333] text-white font-semibold cursor-pointer border border-[#444]"
                    >
                      Buka Modal
                    </button>
                    <button
                      onClick={() => setShowResearchPage(true)}
                      className="text-[11px] underline font-bold text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen size={12} />
                      <span>Bedah 8 Jurnal</span>
                    </button>
                  </div>
                </div>
                <p className="text-neutral-300 text-xs mt-1.5 leading-relaxed">
                  {lastResultFeedback.explanation}
                </p>
                <div className="mt-2 text-[11px] bg-black/50 p-2.5 rounded-xl border border-white/10 italic text-neutral-300">
                  {lastResultFeedback.quote}
                  <span className="block not-italic font-bold text-amber-400 mt-1 text-right">
                    — {lastResultFeedback.source}
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visi Misi Modal */}
      <AnimatePresence>
        {showMissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMissionModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              className="relative z-10 w-full max-w-md bg-[#161616] border border-rose-500/40 rounded-2xl p-6 text-left text-white shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#333]">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛑</span>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Visi & Misi #StopJudi</h3>
                    <p className="text-[11px] text-rose-400 font-semibold">The House Always Wins</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMissionModal(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
                <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3.5 text-rose-200">
                  <strong className="text-white block mb-1">Kenyataan Pahit Perjudian:</strong>
                  Tidak ada satu pun pemain di dunia yang bisa mengalahkan sistem matematika kasino secara konsisten. Kasino tidak dibangun dari kemenangan pemain, melainkan dari kekalahan jutaan orang.
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-amber-300">Fakta Ilmiah (House Edge):</h4>
                  <p>• <strong>Matematika Pasti:</strong> Setiap game kasino memiliki keunggulan matematis untuk bandar (*house edge*). Semakin banyak putaran yang Anda mainkan, kemungkinan Anda rugi mendekati 100%.</p>
                  <p>• <strong>Kemenangan Sesaat:</strong> Menang di awal hanyalah umpan psikologis agar Anda terus bertaruh hingga semua uang Anda habis.</p>
                  <p>• <strong>Tujuan Aplikasi Ini:</strong> Sebagai simulasi virtual murni untuk menyadarkan kita semua bahwa perjudian hanyalah ilusi. Jangan pernah mempertaruhkan uang nyata dan masa depan Anda.</p>
                </div>

                <div className="p-3 bg-black/50 rounded-xl border border-neutral-800 text-center font-bold text-rose-400">
                  Keluarga & masa depan Anda jauh lebih berharga. #StopJudi
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#262626] flex justify-end">
                <button
                  onClick={() => setShowMissionModal(false)}
                  className="py-2 px-5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Saya Paham & Sepakat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

              {/* Stats & Economy Info Modal (Profile) */}
      <AnimatePresence>
        {showStatsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatsModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-md bg-[#181818] border border-[#333] rounded-2xl p-5 text-left text-white shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#333]">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-amber-400" />
                  <h3 className="font-bold text-white text-base">Profil & Akun Pemain</h3>
                </div>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Daily Claim Box inside Profile (disappears completely if already claimed today) */}
              {canClaimDaily && (
                <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 rounded-xl p-4 mb-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Gift size={16} className="text-amber-400 animate-bounce" />
                      <span>Bonus Harian Belum Diklaim!</span>
                    </div>
                    <span className="text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-black">
                      +200 KOIN
                    </span>
                  </div>
                  <p className="text-neutral-300">
                    Ambil jatah koin harian Anda hari ini sebelum reset tengah malam.
                  </p>
                  <button
                    onClick={() => {
                      handleClaimDailyCoins();
                      setShowStatsModal(false);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black rounded-xl text-xs shadow-md cursor-pointer transition-all"
                  >
                    KLAIM +200 KOIN SEKARANG 🪙
                  </button>
                </div>
              )}

              {/* GM / Admin Panel for R&D & Other Player Token Top-Up */}
              {casinoData.isAdmin && (
                <div className="bg-gradient-to-r from-rose-950/70 via-purple-950/70 to-black border border-rose-500/50 rounded-xl p-4 mb-4 text-xs space-y-3 shadow-lg">
                  <div className="flex items-center justify-between text-rose-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      🛡️ PANEL GM / ADMIN (TOP UP TOKEN LAIN)
                    </span>
                    <span className="text-[10px] bg-rose-500 text-black px-2 py-0.5 rounded-full font-black">
                      SUPERUSER
                    </span>
                  </div>
                  <p className="text-neutral-300">
                    Anda menggunakan Seed Key GM/Admin (<code className="text-amber-300 font-mono">ZK-W69L-D8XN-SRBK-B5SX</code>). Anda dapat menambahkan koin untuk akun Anda sendiri atau akun pemain lain:
                  </p>

                  {/* Top up own account */}
                  <div className="space-y-1.5">
                    <span className="text-amber-300 font-bold block">1. Top Up Akun Anda Sendiri:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          handleUpdateBalance(10000);
                          sounds.playJackpot();
                          alert('Berhasil menambahkan +10,000 Koin ke akun Anda!');
                        }}
                        className="py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow"
                      >
                        +10K Koin
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateBalance(50000);
                          sounds.playJackpot();
                          alert('Berhasil menambahkan +50,000 Koin ke akun Anda!');
                        }}
                        className="py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow"
                      >
                        +50K Koin
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateBalance(100000);
                          sounds.playJackpot();
                          alert('Berhasil menambahkan +100,000 Koin ke akun Anda!');
                        }}
                        className="py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs cursor-pointer shadow"
                      >
                        +100K Koin
                      </button>
                    </div>
                  </div>

                  {/* Top up other player token */}
                  <div className="space-y-2 pt-2 border-t border-rose-500/30">
                    <span className="text-amber-300 font-bold block">2. Top Up Token Pemain Lain:</span>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Masukkan Token / Seed Key Pemain (Cth: ZK-...)"
                        value={adminTargetToken}
                        onChange={(e) => setAdminTargetToken(e.target.value)}
                        className="w-full bg-black px-3 py-2 rounded-xl text-xs font-mono text-white border border-rose-500/40 outline-none focus:border-amber-400"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleAdminTopupOtherToken(adminTargetToken, 10000)}
                          className="py-1.5 bg-[#222] hover:bg-[#2c2c2c] border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs cursor-pointer"
                        >
                          +10K ke Token
                        </button>
                        <button
                          onClick={() => handleAdminTopupOtherToken(adminTargetToken, 50000)}
                          className="py-1.5 bg-[#222] hover:bg-[#2c2c2c] border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs cursor-pointer"
                        >
                          +50K ke Token
                        </button>
                        <button
                          onClick={() => handleAdminTopupOtherToken(adminTargetToken, 100000)}
                          className="py-1.5 bg-[#222] hover:bg-[#2c2c2c] border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs cursor-pointer"
                        >
                          +100K ke Token
                        </button>
                      </div>
                    </div>

                    {/* List registered local accounts */}
                    <div className="mt-2 pt-2 border-t border-neutral-800 max-h-36 overflow-y-auto space-y-1.5">
                      <span className="text-[11px] text-neutral-400 font-bold block">Akun Terdaftar di Perangkat Ini:</span>
                      {Object.entries(loadAccountsRegistry()).map(([tok, acc]) => (
                        <div key={tok} className="flex items-center justify-between bg-black/60 p-2 rounded-xl border border-neutral-800 text-[11px]">
                          <div>
                            <strong className="text-white">{acc.nickname}</strong>
                            <div className="font-mono text-[10px] text-neutral-400 truncate max-w-[140px]">{tok}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-amber-300 font-bold">{acc.balance.toLocaleString()} 🪙</span>
                            <button
                              onClick={() => handleAdminTopupOtherToken(tok, 50000)}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-black font-black rounded text-[10px] cursor-pointer"
                            >
                              +50K
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Economy Rules Info Box */}
              <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3.5 mb-4 text-xs space-y-2 text-neutral-300">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                  <Coins size={15} /> Aturan Ekonomi Koin:
                </div>
                <p>• <strong>Modal Awal:</strong> Setiap pemain mendapat tepat <strong>5.000 koin</strong> di awal permainan.</p>
                <p>• <strong>Bebas Curang:</strong> Pemain tidak bisa menambah koin sesuka hati (kecuali GM/Admin).</p>
                <p>• <strong>Reset Countdown:</strong> Reset harian berikutnya dalam <span className="font-mono text-amber-400 font-bold">{countdown}</span>.</p>
              </div>

              {/* Token & Seed Key Section */}
              <div className="bg-[#121212] border border-amber-500/30 rounded-xl p-3.5 mb-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span>🔑 Token Akun (Seed Key):</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(casinoData.token);
                      alert('Token akun berhasil disalin ke clipboard!');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold cursor-pointer"
                  >
                    Salin Token
                  </button>
                </div>
                <div className="font-mono text-xs text-amber-200 bg-black p-2.5 rounded-xl border border-[#333] select-all">
                  {casinoData.token} {casinoData.isAdmin && <span className="text-rose-400 font-bold ml-1">[GM/ADMIN]</span>}
                </div>
                <button
                  onClick={() => {
                    setShowStatsModal(false);
                    setTokenAuthOpen(true);
                  }}
                  className="w-full py-2 bg-[#222] hover:bg-[#2c2c2c] text-neutral-200 text-xs font-bold rounded-xl border border-[#333] cursor-pointer transition-colors"
                >
                  🔑 Ganti / Masukkan Token Lain (Login)
                </button>
              </div>

              {/* Player Stats */}
              <div className="space-y-2.5 mb-4 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#262626]">
                  <span className="text-neutral-400">Nama Pemain:</span>
                  <span className="font-bold text-white">{casinoData.nickname}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#262626]">
                  <span className="text-neutral-400">Saldo Saat Ini:</span>
                  <span className="font-mono font-bold text-amber-300">{casinoData.balance.toLocaleString()} Koin</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#262626]">
                  <span className="text-neutral-400">Total Taruhan:</span>
                  <span className="font-mono text-white">{casinoData.stats.totalBets.toLocaleString()} Koin</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#262626]">
                  <span className="text-neutral-400">Total Kemenangan:</span>
                  <span className="font-mono text-emerald-400 font-bold">+{casinoData.stats.totalWins.toLocaleString()} Koin</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#262626]">
                  <span className="text-neutral-400">Total Kerugian (Total Loss):</span>
                  <span className="font-mono text-rose-400 font-bold">-{casinoData.stats.totalLosses.toLocaleString()} Koin</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#262626]">
                  <span className="text-neutral-400">Kemenangan Terbesar (1x):</span>
                  <span className="font-mono text-amber-400 font-bold">+{casinoData.stats.biggestWin.toLocaleString()} Koin</span>
                </div>
              </div>

              {/* Reset Option */}
              <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                <button
                  onClick={handleResetData}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> Reset Awal (5.000 Koin)
                </button>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="py-1.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboardModal && (
          <LeaderboardModal
            isOpen={showLeaderboardModal}
            onClose={() => setShowLeaderboardModal(false)}
            currentNickname={casinoData.nickname}
            currentBalance={casinoData.balance}
            currentTotalLosses={casinoData.stats.totalLosses}
            gameWins={casinoData.stats.gameWins}
            livePlayers={livePlayers}
            currentUserId={currentUserId}
          />
        )}
      </AnimatePresence>

      {/* Scientific Win / Loss Awareness Modal based on 7 Journals */}
      <ScientificFeedbackModal
        event={scientificFeedbackModalEvent}
        onClose={() => setScientificFeedbackModalEvent(null)}
        onOpenResearchPage={() => {
          setScientificFeedbackModalEvent(null);
          setShowResearchPage(true);
        }}
      />

      {/* Token Auth Modal */}
      <TokenAuthModal
        isOpen={tokenAuthOpen}
        onLoginSuccess={(data, isFirst) => {
          setCasinoData(data);
          setTokenAuthOpen(false);
          if (isFirst) {
            setWelcomeModalOpen(true);
          }
        }}
      />

      {/* Anti Gambling Warning & Visi Misi Modal */}
      <AntiGamblingWelcomeModal
        isOpen={welcomeModalOpen}
        onClose={() => setWelcomeModalOpen(false)}
      />

      {/* Educational Footer */}
      <footer className="w-full py-5 text-center text-xs text-[#888888] border-t border-[#1e1e1e] bg-[#0c0c0c] mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <span>🛑 #StopJudi</span>
            <span>•</span>
            <span className="text-neutral-300">THE HOUSE ALWAYS WINS</span>
          </div>
          <p className="max-w-xl text-[11px] text-neutral-400 leading-normal">
            Aplikasi ini adalah simulasi edukasi. Seluruh game kasino secara matematis dirancang agar bandar selalu menang dalam jangka panjang. Sayangi masa depan dan keluarga Anda.
          </p>
        </div>
      </footer>
    </div>
  );
}
