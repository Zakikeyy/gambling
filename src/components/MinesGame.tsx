import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, RotateCcw, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface MinesGameProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  nickname: string;
  onGameEnd?: (outcome: GameOutcome) => void;
}

type CellType = 'diamond' | 'bomb';

interface CellState {
  id: number;
  type: CellType;
  revealed: boolean;
}

export default function MinesGame({ balance, onUpdateBalance, nickname, onGameEnd }: MinesGameProps) {

  const [bombCount, setBombCount] = useState<number>(2);
  const [betAmount, setBetAmount] = useState<number>(20);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [board, setBoard] = useState<CellState[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<string>('0.00');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isWin, setIsWin] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [revealedCount, setRevealedCount] = useState<number>(0);

  const [currentBet, setCurrentBet] = useState<number>(20);

  // Initialize board
  const generateBoard = (bombs: number): CellState[] => {
    const totalCells = 16;
    const types: CellType[] = Array(totalCells).fill('diamond');
    for (let i = 0; i < bombs; i++) {
      types[i] = 'bomb';
    }
    // Shuffle
    types.sort(() => Math.random() - 0.5);

    return types.map((type, index) => ({
      id: index,
      type,
      revealed: false,
    }));
  };

  // Calculate authentic casino multiplier with 8% house edge
  const getMultiplier = (revealed: number, bombs: number): number => {
    if (revealed === 0) return 1.0;
    let prob = 1.0;
    for (let i = 0; i < revealed; i++) {
      prob *= (16 - bombs - i) / (16 - i);
    }
    if (prob <= 0) return 1.0;
    // 92% RTP / 8% House Edge
    const raw = (0.92 / prob);
    return Math.max(1.05, Math.round(raw * 100) / 100);
  };

  const startNewGame = () => {
    if (balance < betAmount) {
      alert('Saldo koin tidak cukup untuk memasang taruhan Mines!');
      return;
    }
    sounds.playChip();
    onUpdateBalance(-betAmount);
    setCurrentBet(betAmount);
    setBoard(generateBoard(bombCount));
    setStartTime(Date.now());
    setGameOver(false);
    setIsWin(false);
    setShowPopup(false);
    setRevealedCount(0);
    setGameActive(true);
  };

  useEffect(() => {
    // Initial board in standby preview mode (not active until player clicks Mulai Taruhan)
    setBoard(generateBoard(2));
    setGameActive(false);
  }, []);

  const handleCellClick = (index: number) => {
    if (gameOver || !gameActive || board[index].revealed) return;

    const cell = board[index];
    const newBoard = [...board];
    newBoard[index] = { ...cell, revealed: true };

    const end = Date.now();
    const timeTaken = ((end - startTime) / 1000).toFixed(2);
    setElapsedTime(timeTaken);

    if (cell.type === 'bomb') {
      sounds.playBomb();
      setBoard(newBoard);
      setGameOver(true);
      setIsWin(false);
      setShowPopup(true);
      setGameActive(false);
      onGameEnd?.({
        type: 'loss',
        betAmount: currentBet,
        payout: 0,
        netProfit: -currentBet,
        message: `Kena Bom! Taruhan ${currentBet} koin hangus.`,
        gameId: 'mines',
      });
    } else {
      sounds.playDiamond();
      const newRevealed = revealedCount + 1;
      setRevealedCount(newRevealed);
      setBoard(newBoard);

      const targetDiamonds = 16 - bombCount;
      if (newRevealed === targetDiamonds) {
        sounds.playWin();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setGameOver(true);
        setIsWin(true);
        setShowPopup(true);
        setGameActive(false);
        const mult = getMultiplier(newRevealed, bombCount);
        const winPayout = Math.round(currentBet * mult);
        onUpdateBalance(winPayout);
        onGameEnd?.({
          type: 'win',
          betAmount: currentBet,
          payout: winPayout,
          netProfit: winPayout - currentBet,
          message: `Semua Diamond Ditemukan (+${winPayout - currentBet} Koin)!`,
          gameId: 'mines',
        });
      }
    }
  };

  const cashOutEarly = () => {
    if (!gameActive || revealedCount === 0 || gameOver) return;
    sounds.playWin();
    const end = Date.now();
    setElapsedTime(((end - startTime) / 1000).toFixed(2));
    const mult = getMultiplier(revealedCount, bombCount);
    const payout = Math.round(currentBet * mult);
    onUpdateBalance(payout);
    setGameOver(true);
    setIsWin(true);
    setShowPopup(true);
    setGameActive(false);
    onGameEnd?.({
      type: 'win',
      betAmount: currentBet,
      payout,
      netProfit: payout - currentBet,
      message: `Cash Out Berhasil (+${payout - currentBet} Koin)!`,
      gameId: 'mines',
    });
  };

  const revealAllBoard = () => {
    setBoard((prev) => prev.map((c) => ({ ...c, revealed: true })));
  };

  return (
    <div className="w-full flex flex-col items-center max-w-lg mx-auto">
      {/* Controls & Stake */}
      <div className="w-full bg-[#1e1e1e] border border-[#2e2e2e] rounded-2xl p-4 mb-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-[#2e2e2e]">
          <div>
            <span className="text-xs text-neutral-400 font-medium">PLAYER</span>
            <div className="text-sm font-semibold text-emerald-400">Hi, {nickname}!</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Jumlah Bom:</span>
            <div className="flex bg-[#141414] rounded-lg p-0.5 border border-[#333]">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  disabled={gameActive && revealedCount > 0 && !gameOver}
                  onClick={() => {
                    setBombCount(count);
                    if (!gameActive || gameOver) {
                      setBoard(generateBoard(count));
                    }
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                    bombCount === count
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {count} 💣
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bet Selection & Action */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Taruhan:</span>
            {[10, 20, 50, 100].map((amt) => (
              <button
                key={amt}
                disabled={gameActive && revealedCount > 0 && !gameOver}
                onClick={() => setBetAmount(amt)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  betAmount === amt
                    ? 'bg-emerald-500 text-white font-bold'
                    : 'bg-[#141414] text-neutral-400 hover:text-white border border-[#333]'
                }`}
              >
                🪙 {amt}
              </button>
            ))}
          </div>

          {gameActive && revealedCount > 0 && !gameOver ? (
            <button
              onClick={cashOutEarly}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span>Cash Out ({Math.round(currentBet * getMultiplier(revealedCount, bombCount))} Koin • {getMultiplier(revealedCount, bombCount)}x)</span>
            </button>
          ) : (
            <button
              onClick={startNewGame}
              className="px-4 py-1.5 rounded-lg bg-[#4caf50] hover:bg-[#45a049] text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              {gameActive && !gameOver ? 'Mulai Ulang Board' : `Pasang Taruhan (${betAmount} Koin)`}
            </button>
          )}
        </div>
      </div>

      {/* Game Grid Container */}
      <div className="grid-container" id="gameBoard">
        {board.map((cell, index) => {
          let cellClass = 'cell';
          if (cell.revealed) {
            cellClass += cell.type === 'bomb' ? ' revealed-bomb' : ' revealed-diamond';
          }

          return (
            <div
              key={cell.id}
              className={cellClass}
              data-index={index}
              data-revealed={cell.revealed ? 'true' : 'false'}
              onClick={() => handleCellClick(index)}
            >
              {cell.revealed && (
                <span className="emoji">
                  {cell.type === 'bomb' ? '💣' : '💎'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-400">
        <span>Diamond Ditemukan: <strong className="text-emerald-400">{revealedCount}</strong> / {16 - bombCount}</span>
        <span>•</span>
        <span>Pengali Saat Ini: <strong className="text-amber-400">{getMultiplier(revealedCount, bombCount)}x</strong></span>
        <span>•</span>
        <span className="text-[11px] text-neutral-500">House Edge: 8% (Kekalahan Eksponensial)</span>
      </div>

      {/* Pop-Up Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowPopup(false)} />
          <div className="relative z-10 w-full max-w-xs bg-[#1e1e1e] border border-[#333] rounded-2xl p-6 text-center text-white shadow-2xl animate-pop-in">
            <div className="text-4xl mb-2">
              {isWin ? '🎉' : '💥'}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
              {isWin ? 'Kemenangan Semu!' : 'Game Over!'}
            </h2>
            <div className="text-sm text-neutral-300 space-y-1 my-4 bg-[#141414] p-3 rounded-lg border border-[#2d2d2d]">
              {isWin ? (
                <>
                  <p className="text-emerald-400 font-semibold">
                    🎉 Payout Diterima: +{Math.round(currentBet * getMultiplier(revealedCount, bombCount))} Koin ({getMultiplier(revealedCount, bombCount)}x)
                  </p>
                  <p className="flex items-center justify-center gap-1 text-neutral-400">
                    <Clock size={14} /> Waktu: {elapsedTime}s
                  </p>
                  <p className="text-white font-bold text-base mt-1">🏆 Total Saldo: {balance}</p>
                </>
              ) : (
                <>
                  <p className="text-red-400 font-semibold">❌ Kena Bom: -{currentBet} Koin Hangus</p>
                  <p className="flex items-center justify-center gap-1 text-neutral-400">
                    <Clock size={14} /> Waktu: {elapsedTime}s
                  </p>
                  <p className="text-white font-bold text-base mt-1">🏆 Sisa Saldo: {balance}</p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={startNewGame}
                className="w-full py-2.5 px-4 bg-[#4caf50] hover:bg-[#45a049] text-white font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Main Lagi (Play Again)
              </button>
              <button
                onClick={revealAllBoard}
                className="text-xs text-neutral-400 hover:text-white py-1 transition-colors cursor-pointer"
              >
                Lihat Semua Lokasi Bom & Diamond
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
