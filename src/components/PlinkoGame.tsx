import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { CircleDot, Play, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface PlinkoProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

interface ActiveBall {

  id: number;
  x: number; // percentage
  y: number; // percentage
  currentRow: number;
  colIndex: number;
  finished: boolean;
  bet: number;
}

const MULTIPLIERS = [10, 3.5, 1.5, 0.6, 0.2, 0.6, 1.5, 3.5, 10];
const MULT_COLORS = [
  '#ef4444', // 10x Red
  '#f97316', // 3.5x Orange
  '#eab308', // 1.5x Yellow
  '#3b82f6', // 0.6x Blue
  '#6b7280', // 0.2x Gray
  '#3b82f6', // 0.6x Blue
  '#eab308', // 1.5x Yellow
  '#f97316', // 3.5x Orange
  '#ef4444', // 10x Red
];

const NUM_ROWS = 8;

export default function PlinkoGame({ balance, onUpdateBalance, onGameEnd }: PlinkoProps) {
  const [betAmount, setBetAmount] = useState<number>(25);
  const [balls, setBalls] = useState<ActiveBall[]>([]);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [activeSlotHighlight, setActiveSlotHighlight] = useState<number | null>(null);

  const ballIdCounter = useRef<number>(0);

  const dropBall = () => {
    if (balance < betAmount) {
      alert('Saldo koin tidak cukup untuk menjatuhkan bola Plinko!');
      return;
    }

    onUpdateBalance(-betAmount);
    sounds.playChip();
    setLastWin(null);

    const newBallId = ++ballIdCounter.current;
    const initialBall: ActiveBall = {
      id: newBallId,
      x: 50,
      y: 8,
      currentRow: 0,
      colIndex: 0,
      finished: false,
      bet: betAmount,
    };

    setBalls((prev) => [...prev, initialBall]);
    simulateBallDrop(newBallId, betAmount);
  };

  const simulateBallDrop = (ballId: number, betVal: number) => {
    let row = 0;
    let col = 0; // sum of right steps (0 to NUM_ROWS)

    const interval = setInterval(() => {
      row++;
      // Random decision: bounce left (0) or right (1)
      const goRight = Math.random() >= 0.5;
      if (goRight) col++;

      sounds.playRouletteTick();

      // Calculate new x coordinate based on row and col
      // At row r, there are (r + 1) pegs. Center is 50%.
      // spacing spread widens as row increases
      const spreadWidth = 10 + row * 8.5; // percent width
      const step = spreadWidth / (row + 1);
      const newX = 50 - spreadWidth / 2 + col * step;
      const newY = 8 + (row / NUM_ROWS) * 78;

      setBalls((prev) =>
        prev.map((b) => (b.id === ballId ? { ...b, x: newX, y: newY, currentRow: row, colIndex: col } : b))
      );

      if (row >= NUM_ROWS) {
        clearInterval(interval);
        // Landing slot is col (0 to 8)
        const slotIdx = Math.min(MULTIPLIERS.length - 1, Math.max(0, col));
        const mult = MULTIPLIERS[slotIdx];
        const won = Math.round(betVal * mult);

        setActiveSlotHighlight(slotIdx);
        setTimeout(() => setActiveSlotHighlight(null), 800);

        if (mult >= 3.5) {
          sounds.playWin();
          confetti({ particleCount: 60, spread: 60 });
        } else if (mult >= 1) {
          sounds.playChip();
        } else {
          sounds.playBomb();
        }

        onUpdateBalance(won);
        setLastWin(won);

        if (won > betVal) {
          onGameEnd?.({
            type: 'win',
            betAmount: betVal,
            payout: won,
            netProfit: won - betVal,
            message: `Plinko mendarat di slot ${mult}x (+${won - betVal} Koin)!`,
            gameId: 'plinko',
          });
        } else {
          onGameEnd?.({
            type: 'loss',
            betAmount: betVal,
            payout: won,
            netProfit: won - betVal,
            message: `Plinko mendarat di slot ${mult}x. House edge menyerap koin Anda.`,
            gameId: 'plinko',
          });
        }

        // Remove ball after landing animation
        setTimeout(() => {
          setBalls((prev) => prev.filter((b) => b.id !== ballId));
        }, 600);
      }
    }, 160);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-lg mx-auto">
      {/* Plinko Pyramid Cabinet */}
      <div className="w-full bg-gradient-to-b from-[#141b2d] via-[#0d1220] to-[#070a13] border-4 border-[#1f2d4d] rounded-3xl p-5 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-500/20">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🪙</span>
            <div>
              <h2 className="text-sm font-bold tracking-widest text-blue-300">PLINKO DROP</h2>
              <p className="text-[10px] text-blue-400/60 uppercase">Labirin Pasak • Multiplier Hingga 10x</p>
            </div>
          </div>
          <span className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full font-semibold">
            {balls.length > 0 ? `${balls.length} Bola Meluncur` : 'Siap Jatuhkan'}
          </span>
        </div>

        {/* Pegboard Canvas/Area */}
        <div className="relative w-full h-80 bg-[#0a0e19] rounded-2xl border-2 border-blue-900/40 p-4 overflow-hidden shadow-inner flex flex-col justify-between">
          {/* Top Drop Hole */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full bg-blue-500/30 border border-blue-400/60 shadow-md shadow-blue-500/50" />

          {/* Pegs Grid */}
          <div className="flex-1 flex flex-col justify-around pt-6 pb-2">
            {Array.from({ length: NUM_ROWS }).map((_, rIdx) => {
              const numPegs = rIdx + 2;
              return (
                <div key={rIdx} className="flex justify-center gap-5 sm:gap-6">
                  {Array.from({ length: numPegs }).map((_, pIdx) => (
                    <div
                      key={pIdx}
                      className="w-2.5 h-2.5 rounded-full bg-neutral-300 shadow-sm shadow-blue-400/40"
                    />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Active Balls moving down */}
          {balls.map((b) => (
            <div
              key={b.id}
              className="absolute w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border border-white shadow-lg shadow-amber-400/70 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out z-20"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
              }}
            />
          ))}

          {/* Multiplier Catch Slots at Bottom */}
          <div className="grid grid-cols-9 gap-1 pt-2 border-t border-blue-900/40">
            {MULTIPLIERS.map((m, idx) => (
              <div
                key={idx}
                className={`py-1.5 rounded-md text-[10px] sm:text-xs font-black text-center transition-all ${
                  activeSlotHighlight === idx
                    ? 'scale-110 ring-2 ring-white shadow-lg brightness-125'
                    : 'opacity-90'
                }`}
                style={{
                  backgroundColor: MULT_COLORS[idx],
                  color: '#ffffff',
                }}
              >
                {m}x
              </div>
            ))}
          </div>
        </div>

        {/* Win Banner */}
        {lastWin !== null && (
          <div className="mt-3 p-2 rounded-xl bg-black/60 border border-blue-500/30 text-center text-xs font-bold text-amber-300 animate-fade-in">
            Hasil Jatuh: Anda Mendapatkan {lastWin} Koin!
          </div>
        )}

        {/* Betting Controls and Drop Action */}
        <div className="mt-4 pt-3 border-t border-blue-500/20 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-300">Taruhan Bola:</span>
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    sounds.playChip();
                    setBetAmount(amt);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                    betAmount === amt
                      ? 'bg-blue-500 text-white font-bold'
                      : 'bg-[#18233a] text-blue-200 hover:bg-[#223152]'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            <button
              onClick={dropBall}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:brightness-110 text-white font-extrabold text-xs tracking-wider shadow-lg shadow-blue-950/60 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CircleDot size={15} /> JATUHKAN BOLA ({betAmount} KOIN)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
