import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Coins, RotateCcw, ShieldAlert, Dice5 } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface KenoGameProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

export default function KenoGame({ balance, onUpdateBalance, onGameEnd }: KenoGameProps) {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string>('');

  const toggleNumber = (num: number) => {
    if (isPlaying) return;
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 10) {
        alert('Maksimal memilih 10 angka dalam satu tiket Keno!');
        return;
      }
      sounds.playChip();
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleQuickPick = () => {
    if (isPlaying) return;
    sounds.playChip();
    const count = 5;
    const picks: number[] = [];
    while (picks.length < count) {
      const r = Math.floor(Math.random() * 80) + 1;
      if (!picks.includes(r)) picks.push(r);
    }
    setSelectedNumbers(picks.sort((a, b) => a - b));
  };

  const playKeno = () => {
    if (selectedNumbers.length === 0) {
      alert('Pilih setidaknya 1 angka terlebih dahulu!');
      return;
    }
    if (balance < betAmount) {
      alert('Saldo koin tidak cukup!');
      return;
    }

    sounds.playChip();
    onUpdateBalance(-betAmount);
    setIsPlaying(true);
    setDrawnNumbers([]);
    setResultMessage('');

    // Draw 20 numbers out of 80 randomly
    const allNums = Array.from({ length: 80 }, (_, i) => i + 1);
    const drawn: number[] = [];
    while (drawn.length < 20) {
      const idx = Math.floor(Math.random() * allNums.length);
      drawn.push(allNums.splice(idx, 1)[0]);
    }

    setDrawnNumbers(drawn);

    // Count matches
    const matches = selectedNumbers.filter((n) => drawn.includes(n)).length;

    // Payout multiplier table based on picks & matches (25% house edge)
    // Simplified payout table for matches
    let multiplier = 0;
    const picksCount = selectedNumbers.length;

    if (picksCount === 5) {
      if (matches === 5) multiplier = 35;
      else if (matches === 4) multiplier = 5;
      else if (matches === 3) multiplier = 2;
    } else if (picksCount === 3) {
      if (matches === 3) multiplier = 25;
      else if (matches === 2) multiplier = 3;
    } else if (picksCount === 1) {
      if (matches === 1) multiplier = 3.5;
    } else {
      // General formula for other counts
      if (matches >= Math.floor(picksCount * 0.7)) multiplier = picksCount * 4;
      else if (matches >= Math.floor(picksCount * 0.5)) multiplier = 1.5;
    }

    setTimeout(() => {
      setIsPlaying(false);
      const payout = Math.floor(betAmount * multiplier);
      const profit = payout - betAmount;
      const isWin = payout > 0;

      if (isWin) {
        sounds.playJackpot();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        onUpdateBalance(payout);
        setResultMessage(`Mantap! Cocok ${matches} dari ${picksCount} angka. Menang ${payout.toLocaleString()} Koin! (${multiplier}x)`);
        if (onGameEnd) {
          onGameEnd({
            type: 'win',
            betAmount,
            payout,
            netProfit: profit,
            message: `Keno Win: ${matches} hits (${multiplier}x)`,
            gameId: 'keno',
          });
        }
      } else {
        sounds.playLoss();
        setResultMessage(`Hanya cocok ${matches} angka. Tiket hangus! Keno memiliki House Edge hingga 25%.`);
        if (onGameEnd) {
          onGameEnd({
            type: 'loss',
            betAmount,
            netProfit: -betAmount,
            message: `Keno Loss: ${matches} hits`,
            gameId: 'keno',
          });
        }
      }
    }, 1200);
  };

  return (
    <div className="w-full max-w-3xl bg-[#141414] border border-[#262626] rounded-3xl p-6 shadow-2xl text-white">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#222]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-xl shadow-lg">
            🎱
          </div>
          <div>
            <h3 className="font-black text-base text-white">Keno Vegas (Lotere 80 Angka)</h3>
            <p className="text-[11px] text-neutral-400">Pilih angka dan uji keberuntungan melawan house edge tertinggi (25%)!</p>
          </div>
        </div>
        <div className="text-xs bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold px-3 py-1.5 rounded-xl">
          House Edge: 25.0%
        </div>
      </div>

      {/* Grid of 80 Numbers */}
      <div className="grid grid-cols-10 gap-1.5 bg-[#0f0f0f] p-4 rounded-2xl border border-[#222] mb-6">
        {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const isDrawn = drawnNumbers.includes(num);
          const isMatch = isSelected && isDrawn;

          let bgClass = 'bg-[#1c1c1c] text-neutral-300 hover:bg-[#282828] border-[#333]';
          if (isMatch) bgClass = 'bg-emerald-600 text-white font-black border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
          else if (isDrawn) bgClass = 'bg-amber-600/80 text-white font-bold border-amber-400';
          else if (isSelected) bgClass = 'bg-rose-600 text-white font-black border-rose-400 shadow-[0_0_10px_rgba(225,29,72,0.5)]';

          return (
            <button
              key={num}
              disabled={isPlaying}
              onClick={() => toggleNumber(num)}
              className={`h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-mono border transition-all cursor-pointer flex items-center justify-center ${bgClass}`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {resultMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-black/60 border border-amber-500/30 text-amber-300 text-xs text-center font-bold"
        >
          {resultMessage}
        </motion.div>
      )}

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181818] p-4 rounded-2xl border border-[#282828]">
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Taruhan Tiket Keno</label>
            <div className="flex items-center gap-2">
              {[20, 50, 100, 250].map((val) => (
                <button
                  key={val}
                  disabled={isPlaying}
                  onClick={() => setBetAmount(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    betAmount === val
                      ? 'bg-rose-600 text-white shadow'
                      : 'bg-[#222] text-neutral-300 hover:bg-[#2c2c2c] border border-[#333]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isPlaying}
              onClick={handleQuickPick}
              className="px-3 py-2 rounded-xl bg-[#222] hover:bg-[#2c2c2c] border border-[#333] text-xs font-bold text-neutral-300 cursor-pointer"
            >
              Pilih Cepat (5)
            </button>
            <button
              disabled={isPlaying}
              onClick={() => setSelectedNumbers([])}
              className="px-3 py-2 rounded-xl bg-[#222] hover:bg-[#2c2c2c] border border-[#333] text-xs font-bold text-rose-400 cursor-pointer"
            >
              Reset Pilihan
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isPlaying || selectedNumbers.length === 0}
          onClick={playKeno}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-yellow-500 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-rose-950/50 cursor-pointer disabled:opacity-50"
        >
          {isPlaying ? 'MENGUNDI 20 BOLA KENO...' : `MULAI UNDIAN KENO (${selectedNumbers.length} Angka dipilih • ${betAmount} Koin)`}
        </motion.button>
      </div>
    </div>
  );
}
