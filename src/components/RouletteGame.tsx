import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCw, Trophy, CircleDot, Sparkles, Trash2 } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface RouletteProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

interface BetPlacements {
  [key: string]: number; // key: 'red', 'black', 'even', 'odd', 'low', 'high', 'd1', 'd2', 'd3', 'num_0', 'num_1'...
}

export default function RouletteGame({ balance, onUpdateBalance, onGameEnd }: RouletteProps) {

  const [bets, setBets] = useState<BetPlacements>({});
  const [selectedChip, setSelectedChip] = useState<number>(20);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [recentNumbers, setRecentNumbers] = useState<number[]>([7, 20, 32, 0, 14]);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
  const [displayResult, setDisplayResult] = useState<string>('');

  const TABLE_MIN_BET = 10;
  const TABLE_MAX_SPOT_BET = 500;
  const [tableLimitWarning, setTableLimitWarning] = useState<string | null>(null);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

  const getNumberColor = (num: number): 'green' | 'red' | 'black' => {
    if (num === 0) return 'green';
    return RED_NUMBERS.includes(num) ? 'red' : 'black';
  };

  const handlePlaceBet = (betKey: string) => {
    if (isSpinning) return;
    setTableLimitWarning(null);

    const currentSpotBet = bets[betKey] || 0;
    if (currentSpotBet + selectedChip > TABLE_MAX_SPOT_BET) {
      setTableLimitWarning(
        `🛑 Batas Meja Tercapai (${TABLE_MAX_SPOT_BET} Koin/Petak)! Inilah 'Betting Limit Logic' kasino untuk menggagalkan strategi Martingale (Zishuo Yang 2026).`
      );
      sounds.playBomb();
      return;
    }

    if (balance < totalBet + selectedChip) {
      setTableLimitWarning('Saldo koin Anda tidak mencukupi untuk menambah taruhan ini!');
      sounds.playBomb();
      return;
    }

    sounds.playChip();
    setBets((prev) => ({
      ...prev,
      [betKey]: currentSpotBet + selectedChip,
    }));
  };

  const clearAllBets = () => {
    if (isSpinning) return;
    setTableLimitWarning(null);
    sounds.playChip();
    setBets({});
  };

  const spinWheel = () => {
    if (isSpinning) return;
    setTableLimitWarning(null);

    if (totalBet === 0) {
      setTableLimitWarning('Silakan pasang taruhan terlebih dahulu pada meja rolet!');
      return;
    }
    if (balance < totalBet) {
      setTableLimitWarning('Saldo koin Anda tidak mencukupi!');
      return;
    }

    onUpdateBalance(-totalBet);
    setIsSpinning(true);
    setWinningNumber(null);
    setLastWinAmount(null);
    setDisplayResult('');

    // Ball tick sounds during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sounds.playRouletteTick();
      tickCount++;
      if (tickCount > 20) clearInterval(tickInterval);
    }, 120);

    // Pick winning number 0-36
    const outcome = Math.floor(Math.random() * 37);

    setTimeout(() => {
      clearInterval(tickInterval);
      setWinningNumber(outcome);
      setIsSpinning(false);
      setRecentNumbers((prev) => [outcome, ...prev.slice(0, 7)]);

      // Calculate payouts
      let totalPayout = 0;
      const isRed = RED_NUMBERS.includes(outcome);
      const isEven = outcome !== 0 && outcome % 2 === 0;
      const isOdd = outcome !== 0 && outcome % 2 !== 0;
      const isLow = outcome >= 1 && outcome <= 18;
      const isHigh = outcome >= 19 && outcome <= 36;
      const isD1 = outcome >= 1 && outcome <= 12;
      const isD2 = outcome >= 13 && outcome <= 24;
      const isD3 = outcome >= 25 && outcome <= 36;

      // Check straight numbers
      const numKey = `num_${outcome}`;
      if (bets[numKey]) {
        totalPayout += bets[numKey] * 36; // 35:1 + original
      }
      // Outside bets
      if (bets['red'] && isRed) totalPayout += bets['red'] * 2;
      if (bets['black'] && !isRed && outcome !== 0) totalPayout += bets['black'] * 2;
      if (bets['even'] && isEven) totalPayout += bets['even'] * 2;
      if (bets['odd'] && isOdd) totalPayout += bets['odd'] * 2;
      if (bets['low'] && isLow) totalPayout += bets['low'] * 2;
      if (bets['high'] && isHigh) totalPayout += bets['high'] * 2;
      if (bets['d1'] && isD1) totalPayout += bets['d1'] * 3;
      if (bets['d2'] && isD2) totalPayout += bets['d2'] * 3;
      if (bets['d3'] && isD3) totalPayout += bets['d3'] * 3;

      const color = getNumberColor(outcome);
      const colorLabel = color === 'green' ? 'HIJAU' : color === 'red' ? 'MERAH' : 'HITAM';

      if (totalPayout > 0) {
        sounds.playWin();
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        onUpdateBalance(totalPayout);
        setLastWinAmount(totalPayout);
        const winMsg = `Bola berhenti di ${outcome} (${colorLabel})! Menang ${totalPayout} Koin! 🎉`;
        setDisplayResult(winMsg);
        onGameEnd?.({
          type: 'win',
          betAmount: totalBet,
          payout: totalPayout,
          netProfit: totalPayout - totalBet,
          message: winMsg,
          gameId: 'roulette',
        });
      } else {
        sounds.playBomb();
        const lossMsg = `Bola berhenti di ${outcome} (${colorLabel}). Taruhan tidak tembus.`;
        setDisplayResult(lossMsg);
        onGameEnd?.({
          type: 'loss',
          betAmount: totalBet,
          payout: 0,
          netProfit: -totalBet,
          message: lossMsg,
          gameId: 'roulette',
        });
      }
    }, 2800);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto">
      {/* Roulette Wheel & Outcome Display */}
      <div className="w-full bg-[#181818] border border-[#2e2e2e] rounded-3xl p-4 mb-4 shadow-2xl flex flex-col items-center">
        {/* Recent spins history */}
        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-[#2a2a2a] text-xs">
          <span className="text-neutral-400 font-medium">Riwayat Terakhir:</span>
          <div className="flex items-center gap-1.5">
            {recentNumbers.map((num, idx) => {
              const c = getNumberColor(num);
              return (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                    c === 'green' ? 'bg-emerald-600' : c === 'red' ? 'bg-red-600' : 'bg-neutral-800 border border-neutral-600'
                  }`}
                >
                  {num}
                </span>
              );
            })}
          </div>
        </div>

        {/* Center Animated Wheel Display */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-amber-600/50 bg-gradient-to-tr from-[#121212] via-[#221a12] to-[#121212] flex items-center justify-center shadow-xl my-2">
          {/* Outer Ring ticks */}
          <div
            className={`absolute inset-2 rounded-full border-2 border-dashed border-amber-500/40 flex items-center justify-center ${
              isSpinning ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '0.8s' }}
          >
            <div className="w-3 h-3 bg-white rounded-full absolute -top-1.5 shadow-md shadow-white" />
          </div>

          {/* Central Ball / Number Showcase */}
          <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border-2 border-amber-500/30 flex flex-col items-center justify-center text-center shadow-inner z-10">
            {isSpinning ? (
              <RotateCw size={28} className="animate-spin text-amber-400" />
            ) : winningNumber !== null ? (
              <>
                <span
                  className={`text-2xl font-black ${
                    getNumberColor(winningNumber) === 'green'
                      ? 'text-emerald-400'
                      : getNumberColor(winningNumber) === 'red'
                      ? 'text-red-400'
                      : 'text-neutral-200'
                  }`}
                >
                  {winningNumber}
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  {getNumberColor(winningNumber)}
                </span>
              </>
            ) : (
              <span className="text-xs text-neutral-400 font-medium">PUTAR MEJA</span>
            )}
          </div>
        </div>

        {/* Result announcement */}
        {displayResult && (
          <div
            className={`mt-2 py-1.5 px-4 rounded-xl text-xs font-semibold ${
              lastWinAmount ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-[#222] text-neutral-300'
            }`}
          >
            {displayResult}
          </div>
        )}
      </div>

      {/* Table Limit Warning Banner */}
      {tableLimitWarning && (
        <div className="w-full mb-3 p-3 rounded-2xl bg-gradient-to-r from-red-950/90 via-[#200d0e] to-red-950/90 border border-red-500/50 text-xs text-red-200 flex items-start justify-between gap-2 shadow-lg animate-fade-in">
          <div className="flex items-start gap-2">
            <span className="text-base leading-none">⚠️</span>
            <div className="leading-snug">{tableLimitWarning}</div>
          </div>
          <button
            onClick={() => setTableLimitWarning(null)}
            className="text-neutral-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-black/40"
          >
            ✕
          </button>
        </div>
      )}

      {/* Betting Board Layout */}
      <div className="w-full bg-[#161f18] border border-emerald-600/30 rounded-2xl p-4 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 pb-2 border-b border-emerald-500/20 text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-400 tracking-wider">PAPAN TARUHAN ROLET</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-mono">
              Batas Meja: Min 10 • Max 500/petak
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-300">Total Pasang: <strong className="text-amber-400">{totalBet}</strong></span>
            {totalBet > 0 && (
              <button
                onClick={clearAllBets}
                disabled={isSpinning}
                className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer"
              >
                <Trash2 size={12} /> Hapus
              </button>
            )}
          </div>
        </div>

        {/* Outside Bets (Red/Black, Even/Odd, Low/High) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
          <button
            onClick={() => handlePlaceBet('red')}
            className={`py-2 px-1 rounded-lg text-xs font-bold bg-red-700 hover:bg-red-600 transition-all border border-red-500/30 relative flex flex-col items-center justify-center ${
              bets['red'] ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            <span>MERAH (1:1)</span>
            {bets['red'] && <span className="text-[10px] bg-amber-400 text-black px-1 rounded font-mono mt-0.5">🪙 {bets['red']}</span>}
          </button>

          <button
            onClick={() => handlePlaceBet('black')}
            className={`py-2 px-1 rounded-lg text-xs font-bold bg-neutral-900 hover:bg-neutral-800 transition-all border border-neutral-700 relative flex flex-col items-center justify-center ${
              bets['black'] ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            <span>HITAM (1:1)</span>
            {bets['black'] && <span className="text-[10px] bg-amber-400 text-black px-1 rounded font-mono mt-0.5">🪙 {bets['black']}</span>}
          </button>

          <button
            onClick={() => handlePlaceBet('even')}
            className={`py-2 px-1 rounded-lg text-xs font-bold bg-[#1e3325] hover:bg-[#254230] transition-all border border-emerald-500/30 relative flex flex-col items-center justify-center ${
              bets['even'] ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            <span>GENAP (1:1)</span>
            {bets['even'] && <span className="text-[10px] bg-amber-400 text-black px-1 rounded font-mono mt-0.5">🪙 {bets['even']}</span>}
          </button>

          <button
            onClick={() => handlePlaceBet('odd')}
            className={`py-2 px-1 rounded-lg text-xs font-bold bg-[#1e3325] hover:bg-[#254230] transition-all border border-emerald-500/30 relative flex flex-col items-center justify-center ${
              bets['odd'] ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            <span>GANJIL (1:1)</span>
            {bets['odd'] && <span className="text-[10px] bg-amber-400 text-black px-1 rounded font-mono mt-0.5">🪙 {bets['odd']}</span>}
          </button>

          <button
            onClick={() => handlePlaceBet('low')}
            className={`py-2 px-1 rounded-lg text-xs font-bold bg-[#1e3325] hover:bg-[#254230] transition-all border border-emerald-500/30 relative flex flex-col items-center justify-center ${
              bets['low'] ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            <span>1 - 18 (1:1)</span>
            {bets['low'] && <span className="text-[10px] bg-amber-400 text-black px-1 rounded font-mono mt-0.5">🪙 {bets['low']}</span>}
          </button>

          <button
            onClick={() => handlePlaceBet('high')}
            className={`py-2 px-1 rounded-lg text-xs font-bold bg-[#1e3325] hover:bg-[#254230] transition-all border border-emerald-500/30 relative flex flex-col items-center justify-center ${
              bets['high'] ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            <span>19 - 36 (1:1)</span>
            {bets['high'] && <span className="text-[10px] bg-amber-400 text-black px-1 rounded font-mono mt-0.5">🪙 {bets['high']}</span>}
          </button>
        </div>

        {/* Dozens (1st 12, 2nd 12, 3rd 12) */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => handlePlaceBet('d1')}
            className={`py-1.5 rounded-lg text-xs font-semibold bg-[#1a2d21] hover:bg-[#223b2b] border border-emerald-500/20 text-center ${
              bets['d1'] ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            1st 12 (1-12) 2:1 {bets['d1'] ? `[${bets['d1']}]` : ''}
          </button>
          <button
            onClick={() => handlePlaceBet('d2')}
            className={`py-1.5 rounded-lg text-xs font-semibold bg-[#1a2d21] hover:bg-[#223b2b] border border-emerald-500/20 text-center ${
              bets['d2'] ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            2nd 12 (13-24) 2:1 {bets['d2'] ? `[${bets['d2']}]` : ''}
          </button>
          <button
            onClick={() => handlePlaceBet('d3')}
            className={`py-1.5 rounded-lg text-xs font-semibold bg-[#1a2d21] hover:bg-[#223b2b] border border-emerald-500/20 text-center ${
              bets['d3'] ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            3rd 12 (25-36) 2:1 {bets['d3'] ? `[${bets['d3']}]` : ''}
          </button>
        </div>

        {/* Straight Numbers Grid 0-36 (Teaser / Quick pick) */}
        <div className="text-[11px] text-neutral-400 mb-1">Angka Langsung (Bayar 35:1):</div>
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mb-4 max-h-36 overflow-y-auto p-1 bg-black/30 rounded-xl border border-emerald-500/10">
          <button
            onClick={() => handlePlaceBet('num_0')}
            className={`col-span-6 sm:col-span-12 py-1 rounded text-xs font-bold bg-emerald-700 hover:bg-emerald-600 ${
              bets['num_0'] ? 'ring-2 ring-amber-400' : ''
            }`}
          >
            0 (Green) {bets['num_0'] ? `• 🪙${bets['num_0']}` : ''}
          </button>
          {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => {
            const isR = RED_NUMBERS.includes(n);
            const bKey = `num_${n}`;
            return (
              <button
                key={n}
                onClick={() => handlePlaceBet(bKey)}
                className={`py-1 rounded text-[11px] font-bold ${
                  isR ? 'bg-red-700 hover:bg-red-600' : 'bg-neutral-800 hover:bg-neutral-700'
                } ${bets[bKey] ? 'ring-2 ring-amber-400 font-extrabold' : ''}`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* Chip Selection & Spin Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-emerald-500/20">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Pecahan Chip:</span>
            {[10, 20, 50, 100].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  sounds.playChip();
                  setSelectedChip(chip);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all cursor-pointer ${
                  selectedChip === chip
                    ? 'bg-amber-500 text-black border-white shadow-lg scale-110'
                    : 'bg-[#18281d] text-emerald-300 border-emerald-500/30 hover:scale-105'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <button
            disabled={isSpinning || totalBet === 0}
            onClick={spinWheel}
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-sm tracking-wider shadow-lg shadow-amber-950/60 active:scale-95 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCw size={16} className={isSpinning ? 'animate-spin' : ''} />
            <span>PUTAR RODA ({totalBet} KOIN)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
