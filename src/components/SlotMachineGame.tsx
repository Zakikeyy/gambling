import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCw, Trophy, Info, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface SlotMachineProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

interface SymbolInfo {
  id: string;
  emoji: string;
  name: string;
  multiplier: number; // 3 of a kind
}

const SYMBOLS: SymbolInfo[] = [
  { id: 'crown', emoji: '👑', name: 'Crown', multiplier: 50 },
  { id: 'seven', emoji: '7️⃣', name: 'Lucky 7', multiplier: 25 },
  { id: 'diamond', emoji: '💎', name: 'Diamond', multiplier: 15 },
  { id: 'bell', emoji: '🔔', name: 'Liberty Bell', multiplier: 10 },
  { id: 'grape', emoji: '🍇', name: 'Grape', multiplier: 6 },
  { id: 'lemon', emoji: '🍋', name: 'Lemon', multiplier: 4 },
  { id: 'cherry', emoji: '🍒', name: 'Cherry', multiplier: 3 },
];

export default function SlotMachineGame({ balance, onUpdateBalance, onGameEnd }: SlotMachineProps) {

  const [reels, setReels] = useState<string[]>(['7️⃣', '7️⃣', '7️⃣']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false]);
  const [bet, setBet] = useState<number>(25);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winMessage, setWinMessage] = useState<string>('');
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);

  const autoSpinRef = useRef<boolean>(autoSpin);
  autoSpinRef.current = autoSpin;

  const getRandomSymbol = (): string => {
    // Weighted RNG (cherries and lemons more frequent than crowns)
    const weights = [
      { sym: '👑', weight: 4 },
      { sym: '7️⃣', weight: 8 },
      { sym: '💎', weight: 12 },
      { sym: '🔔', weight: 16 },
      { sym: '🍇', weight: 20 },
      { sym: '🍋', weight: 24 },
      { sym: '🍒', weight: 28 },
    ];
    const totalWeight = weights.reduce((acc, cur) => acc + cur.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const item of weights) {
      if (rand < item.weight) return item.sym;
      rand -= item.weight;
    }
    return '🍒';
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (balance < bet) {
      setAutoSpin(false);
      alert('Saldo koin tidak mencukupi untuk memutar slot!');
      return;
    }

    onUpdateBalance(-bet);
    setIsSpinning(true);
    setLastWin(null);
    setWinMessage('');
    setSpinningReels([true, true, true]);

    // Fast ticker sound
    const soundInterval = setInterval(() => {
      sounds.playReelClick();
    }, 120);

    // Pick final symbols upfront
    const targetReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Stop reel 1
    setTimeout(() => {
      setReels((prev) => [targetReels[0], prev[1], prev[2]]);
      setSpinningReels([false, true, true]);
      sounds.playChip();
    }, 900);

    // Stop reel 2
    setTimeout(() => {
      setReels((prev) => [targetReels[0], targetReels[1], prev[2]]);
      setSpinningReels([false, false, true]);
      sounds.playChip();
    }, 1500);

    // Stop reel 3 and calculate payout
    setTimeout(() => {
      clearInterval(soundInterval);
      setReels(targetReels);
      setSpinningReels([false, false, false]);
      setIsSpinning(false);

      // Evaluate win
      const [r1, r2, r3] = targetReels;
      let wonAmount = 0;
      let msg = '';

      if (r1 === r2 && r2 === r3) {
        // 3 matching!
        const found = SYMBOLS.find((s) => s.emoji === r1);
        const mult = found ? found.multiplier : 5;
        wonAmount = bet * mult;
        msg = `JACKPOT 3x ${r1}! Menang ${wonAmount} Koin (${mult}x)`;
        if (mult >= 25) {
          sounds.playJackpot();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
        } else {
          sounds.playWin();
          confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        }
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        // 2 matching: near-miss psychological trap
        const matchingSym = r1 === r2 ? r1 : (r2 === r3 ? r2 : r1);
        if (matchingSym === '🍒') {
          wonAmount = Math.round(bet * 1.2);
          msg = `2x 🍒 Cherry Kembar! Payout ${wonAmount} Koin (1.2x)`;
        } else {
          // Near miss consolation (pays 0.6x, net loss 40% to demonstrate house edge)
          wonAmount = Math.round(bet * 0.6);
          msg = `Hampir Menang (Near Miss)! 2x ${matchingSym} Kembar (Kembali ${wonAmount} Koin)`;
        }
        sounds.playChip();
      } else if (targetReels.includes('🍒')) {
        // 1 Cherry gives psychological bait (0.25x)
        wonAmount = Math.round(bet * 0.25);
        msg = `Umpan 1x 🍒 Cherry (Kembali ${wonAmount} Koin)`;
        sounds.playChip();
      } else {
        msg = 'ZONK! Putaran ini diserap oleh house edge kasino.';
      }

      if (wonAmount > 0) {
        onUpdateBalance(wonAmount);
        setLastWin(wonAmount);
        if (wonAmount > bet) {
          onGameEnd?.({
            type: 'win',
            betAmount: bet,
            payout: wonAmount,
            netProfit: wonAmount - bet,
            message: msg,
            gameId: 'slots',
          });
        } else {
          // Losses Disguised as Wins (LDWs) - positive reinforcement trap
          onGameEnd?.({
            type: 'loss',
            betAmount: bet,
            payout: wonAmount,
            netProfit: wonAmount - bet,
            message: msg,
            gameId: 'slots',
          });
        }
      } else {
        onGameEnd?.({
          type: 'loss',
          betAmount: bet,
          payout: 0,
          netProfit: -bet,
          message: msg,
          gameId: 'slots',
        });
      }
      setWinMessage(msg);

      // Trigger next spin if autoSpin
      if (autoSpinRef.current) {
        setTimeout(() => {
          if (autoSpinRef.current) {
            handleSpin();
          }
        }, 1200);
      }
    }, 2100);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-lg mx-auto">
      {/* Machine Cabinet */}
      <div className="w-full bg-gradient-to-b from-[#241b12] via-[#1a1410] to-[#12100e] border-2 border-amber-600/40 rounded-3xl p-5 shadow-2xl shadow-amber-950/30 relative">
        {/* Slot Top Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🎰</span>
            <div>
              <h2 className="text-base font-bold text-amber-300 tracking-wider">ROYAL SLOTS</h2>
              <p className="text-[11px] text-amber-400/70">777 Lucky Vegas Edition</p>
            </div>
          </div>
          <button
            onClick={() => setShowPaytable(!showPaytable)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
          >
            <Info size={13} /> {showPaytable ? 'Tutup Info' : 'Tabel Bayaran'}
          </button>
        </div>

        {/* Paytable Modal / Dropdown */}
        {showPaytable && (
          <div className="mb-4 bg-[#110e0c] p-3 rounded-xl border border-amber-500/30 text-xs animate-fade-in">
            <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5">
              <Trophy size={14} /> Tabel Pembayaran (3x Simbol Cocok):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-neutral-300">
              {SYMBOLS.map((s) => (
                <div key={s.id} className="bg-[#1c1713] p-1.5 rounded-lg flex items-center justify-between border border-amber-500/15">
                  <span className="text-base">{s.emoji}</span>
                  <span className="text-amber-400 font-bold">{s.multiplier}x</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-neutral-400 mt-2">
              * 2 simbol kembar = 1.5x taruhan • Minimal 1 Cherry = 0.5x taruhan
            </p>
          </div>
        )}

        {/* The 3 Reels Display Window */}
        <div className="bg-[#0c0a08] border-4 border-amber-700/60 rounded-2xl p-4 my-2 shadow-inner">
          <div className="grid grid-cols-3 gap-3">
            {reels.map((sym, idx) => (
              <div
                key={idx}
                className="relative h-28 sm:h-32 rounded-xl bg-gradient-to-b from-[#1e1915] via-[#2d251f] to-[#1e1915] border border-amber-500/30 flex items-center justify-center overflow-hidden shadow-md"
              >
                {/* Visual Glass Reflection */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent pointer-events-none" />

                {/* Animated rolling text if spinning */}
                {spinningReels[idx] ? (
                  <div className="flex flex-col items-center justify-center gap-4 animate-bounce text-5xl">
                    <span>👑</span>
                    <span>7️⃣</span>
                    <span>💎</span>
                  </div>
                ) : (
                  <div className="text-5xl sm:text-6xl transition-transform duration-200 transform scale-100 hover:scale-105 select-none">
                    {sym}
                  </div>
                )}

                {/* Reel Index indicator */}
                <div className="absolute bottom-1 right-2 text-[9px] text-amber-500/40 font-mono">
                  R{idx + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Win Status Banner */}
          <div className="mt-3 py-2 px-3 rounded-lg bg-[#18130f] border border-amber-500/20 text-center min-h-[38px] flex items-center justify-center">
            {isSpinning ? (
              <span className="text-xs text-amber-400 flex items-center gap-2 animate-pulse">
                <RotateCw size={14} className="animate-spin" /> Memutar gulungan keberuntungan...
              </span>
            ) : winMessage ? (
              <span className={`text-xs font-semibold ${lastWin ? 'text-amber-300' : 'text-neutral-400'}`}>
                {winMessage}
              </span>
            ) : (
              <span className="text-xs text-neutral-500">Pilih taruhan dan klik SPIN untuk memutar</span>
            )}
          </div>
        </div>

        {/* Betting Controls & Action Button */}
        <div className="mt-4 flex flex-col gap-3">
          {/* Bet size buttons */}
          <div className="flex items-center justify-between gap-2 bg-[#120f0c] p-2 rounded-xl border border-amber-500/20">
            <span className="text-xs text-neutral-400 font-medium pl-1">Taruhan:</span>
            <div className="flex items-center gap-1.5">
              {[10, 25, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  disabled={isSpinning}
                  onClick={() => {
                    sounds.playChip();
                    setBet(amt);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                    bet === amt
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-[#221c17] text-neutral-300 hover:bg-[#30261f] border border-amber-500/10'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Action Spin & Auto Spin */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                setAutoSpin(!autoSpin);
                if (!autoSpin && !isSpinning) {
                  handleSpin();
                }
              }}
              className={`col-span-1 py-3.5 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 border ${
                autoSpin
                  ? 'bg-red-900/40 text-red-300 border-red-500/40'
                  : 'bg-[#221c17] text-neutral-300 border-amber-500/20 hover:bg-[#2d251f]'
              }`}
            >
              <RotateCw size={16} className={autoSpin ? 'animate-spin' : ''} />
              <span>{autoSpin ? 'STOP' : 'AUTO'}</span>
            </button>

            <button
              disabled={isSpinning}
              onClick={handleSpin}
              className="col-span-3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-base tracking-wider transition-all shadow-lg shadow-amber-950/60 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              <span>PUTAR (SPIN) - {bet} KOIN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
