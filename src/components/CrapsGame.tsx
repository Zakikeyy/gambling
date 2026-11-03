import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Dices, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface CrapsProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

export default function CrapsGame({ balance, onUpdateBalance, onGameEnd }: CrapsProps) {
  const [point, setPoint] = useState<number | null>(null);
  const [dice, setDice] = useState<[number, number]>([3, 4]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  
  // Bets
  const [passLineBet, setPassLineBet] = useState<number>(50);
  const [fieldBet, setFieldBet] = useState<number>(0);
  const [anySevenBet, setAnySevenBet] = useState<number>(0);
  const [snakeEyesBet, setSnakeEyesBet] = useState<number>(0);

  const [message, setMessage] = useState<string>('Pasang taruhan lalu lempar dadu (Come Out roll)!');
  const [lastWin, setLastWin] = useState<number | null>(null);

  const rollDice = () => {
    if (isRolling) return;
    const totalBet = (point === null ? passLineBet : 0) + fieldBet + anySevenBet + snakeEyesBet;
    if (point === null && passLineBet === 0) {
      alert('Silakan pasang taruhan Pass Line sebelum Come Out roll!');
      return;
    }
    if (balance < totalBet) {
      alert('Saldo koin tidak cukup untuk taruhan ini!');
      return;
    }

    if (totalBet > 0) {
      onUpdateBalance(-totalBet);
    }

    setIsRolling(true);
    setLastWin(null);
    setMessage('Dadu sedang dilempar ke meja...');
    sounds.playDice();

    // Dice roll animation ticks
    const interval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const sum = d1 + d2;
      setDice([d1, d2]);
      setIsRolling(false);

      let totalWon = 0;
      let msg = `Dadu keluar: ${d1} + ${d2} = ${sum}. `;
      let roundResolved = false;

      // Evaluate one-roll bets:
      // Field Bet
      if (fieldBet > 0) {
        if ([3, 4, 9, 10, 11].includes(sum)) {
          totalWon += fieldBet * 2;
          msg += `[Field Win 1:1] `;
        } else if (sum === 2 || sum === 12) {
          totalWon += fieldBet * 3; // 2x payout
          msg += `[Field Win Triple 2:1] `;
        } else {
          msg += `[Field Kalah] `;
        }
        setFieldBet(0);
      }

      // Any Seven
      if (anySevenBet > 0) {
        if (sum === 7) {
          totalWon += anySevenBet * 5; // 4:1 payout
          msg += `[Any 7 Win 4:1] `;
        } else {
          msg += `[Any 7 Kalah] `;
        }
        setAnySevenBet(0);
      }

      // Snake Eyes (total 2)
      if (snakeEyesBet > 0) {
        if (sum === 2) {
          totalWon += snakeEyesBet * 31; // 30:1 payout
          msg += `[Snake Eyes Win 30:1] 🎉 `;
        } else {
          msg += `[Snake Eyes Kalah] `;
        }
        setSnakeEyesBet(0);
      }

      // Evaluate Pass Line / Point logic
      if (point === null) {
        // Come Out Roll
        if (sum === 7 || sum === 11) {
          totalWon += passLineBet * 2;
          msg += `Natural 7/11! Pass Line Menang!`;
          sounds.playWin();
          confetti({ particleCount: 50, spread: 60 });
          roundResolved = true;
        } else if (sum === 2 || sum === 3 || sum === 12) {
          msg += `Craps ${sum}! Pass Line Kalah.`;
          sounds.playBomb();
          roundResolved = true;
        } else {
          // Point established
          setPoint(sum);
          msg += `Point ditetapkan pada angka ${sum}! Lempar lagi hingga dapat ${sum} (menang) atau 7 (kalah).`;
          sounds.playChip();
        }
      } else {
        // Point is ON
        if (sum === point) {
          totalWon += passLineBet * 2;
          msg += `Point ${point} berhasil kena! Pass Line Menang!`;
          setPoint(null);
          sounds.playWin();
          confetti({ particleCount: 60, spread: 60 });
          roundResolved = true;
        } else if (sum === 7) {
          msg += `Seven Out! Dadu 7 keluar sebelum Point. Pass Line Kalah.`;
          setPoint(null);
          sounds.playBomb();
          roundResolved = true;
        } else {
          msg += `Belum ada keputusan. Lempar lagi untuk mengincar ${point}!`;
        }
      }

      if (totalWon > 0) {
        onUpdateBalance(totalWon);
        setLastWin(totalWon);
        onGameEnd?.({
          type: 'win',
          betAmount: totalBet,
          payout: totalWon,
          netProfit: totalWon - totalBet,
          message: msg,
          gameId: 'craps',
        });
      } else if (roundResolved) {
        onGameEnd?.({
          type: 'loss',
          betAmount: totalBet,
          payout: 0,
          netProfit: -totalBet,
          message: msg,
          gameId: 'craps',
        });
      }
      setMessage(msg);
    }, 1200);
  };

  const diceFaceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto">
      {/* Craps Table Felt */}
      <div className="w-full bg-gradient-to-b from-[#113824] via-[#0b291a] to-[#071d12] border-4 border-[#1e5c3b] rounded-3xl p-5 shadow-2xl relative text-white">
        {/* Table Top Header & Puck */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/20">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-emerald-300">CASINO CRAPS</h2>
            <p className="text-[10px] text-emerald-400/60 uppercase">Vegas Dice Game • Pass Line • Field & Props</p>
          </div>

          {/* Point Puck ON / OFF */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Puck Status:</span>
            <div
              className={`px-3 py-1 rounded-full text-xs font-black shadow-md ${
                point !== null
                  ? 'bg-amber-400 text-black border border-white animate-pulse'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-600'
              }`}
            >
              {point !== null ? `POINT ON: ${point}` : 'POINT OFF'}
            </div>
          </div>
        </div>

        {/* Dice Arena */}
        <div className="flex flex-col items-center justify-center my-4 py-4 bg-black/30 rounded-2xl border border-emerald-500/15">
          <div className="flex items-center gap-4 text-7xl sm:text-8xl select-none">
            <div className={`p-2 rounded-2xl bg-white text-red-600 shadow-xl border-2 border-neutral-300 ${isRolling ? 'animate-spin' : ''}`}>
              {diceFaceIcons[dice[0] - 1]}
            </div>
            <div className={`p-2 rounded-2xl bg-white text-red-600 shadow-xl border-2 border-neutral-300 ${isRolling ? 'animate-spin' : ''}`}>
              {diceFaceIcons[dice[1] - 1]}
            </div>
          </div>
          <div className="mt-3 text-xs font-bold text-amber-300">
            Total Dadu: {dice[0] + dice[1]}
          </div>
        </div>

        {/* Status Message */}
        <div className="my-2 p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-center text-xs font-medium">
          {message}
        </div>

        {/* Betting Layout Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-xs">
          {/* Pass Line */}
          <div className="col-span-2 bg-[#122e1f] p-2.5 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-300">PASS LINE</span>
              <span className="text-[10px] text-emerald-400">1:1</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-neutral-300 font-mono">🪙 {passLineBet}</span>
              {point === null && (
                <div className="flex gap-1">
                  {[25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setPassLineBet(amt)}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        passLineBet === amt ? 'bg-emerald-500 text-white font-bold' : 'bg-black/40 text-neutral-300'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Field Bet */}
          <div
            onClick={() => setFieldBet((prev) => (prev > 0 ? 0 : 25))}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              fieldBet > 0 ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-black/30 border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="font-bold">FIELD (2,3,4,9,10,11,12)</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-neutral-400">1 Roll</span>
              <span className="font-bold font-mono text-amber-400">{fieldBet > 0 ? `🪙 ${fieldBet}` : '+ Pasang 25'}</span>
            </div>
          </div>

          {/* Any 7 */}
          <div
            onClick={() => setAnySevenBet((prev) => (prev > 0 ? 0 : 25))}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              anySevenBet > 0 ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-black/30 border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="font-bold">ANY SEVEN (7)</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-neutral-400">Bayar 4:1</span>
              <span className="font-bold font-mono text-amber-400">{anySevenBet > 0 ? `🪙 ${anySevenBet}` : '+ Pasang 25'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          disabled={isRolling}
          onClick={rollDice}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-extrabold text-sm tracking-wider shadow-lg shadow-emerald-950/60 active:scale-98 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Dices size={18} className={isRolling ? 'animate-spin' : ''} />
          <span>LEMPAR DADU (ROLL CRAPS)</span>
        </button>
      </div>
    </div>
  );
}
