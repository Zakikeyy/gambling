import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Rocket, Trophy, Coins, RotateCcw, ShieldAlert, Zap } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface CrashGameProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

export default function CrashGame({ balance, onUpdateBalance, onGameEnd }: CrashGameProps) {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.0);
  const [gameState, setGameState] = useState<'idle' | 'running' | 'crashed' | 'cashed'>({ status: 'idle' } as any);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(1.0);
  const [cashedMultiplier, setCashedMultiplier] = useState<number>(0);

  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const startCrash = () => {
    if (balance < betAmount) {
      alert('Saldo koin tidak cukup!');
      return;
    }
    sounds.playChip();
    onUpdateBalance(-betAmount);

    // Determine crash point with 5% house edge distribution (approx geometric distribution)
    // 5.5% chance of instant crash at 1.00x
    const rand = Math.random();
    let point = 1.0;
    if (rand < 0.055) {
      point = 1.0;
    } else {
      // E[X] = 0.95 / (1 - p) -> weighted so house edge ~ 5%
      point = Math.round((0.95 / (1 - Math.random() * 0.95)) * 100) / 100;
      point = Math.max(1.01, Math.min(point, 50.0));
    }

    setCrashPoint(point);
    setCurrentMultiplier(1.0);
    setCashedMultiplier(0);
    setGameState('running');
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Exponential rise curve
      const mult = Math.round((1.0 + elapsed * 0.8 + Math.pow(elapsed, 1.8) * 0.15) * 100) / 100;

      if (mult >= point) {
        // CRASHED!
        setCurrentMultiplier(point);
        setGameState('crashed');
        sounds.playLoss();
        if (onGameEnd) {
          onGameEnd({
            type: 'loss',
            betAmount,
            netProfit: -betAmount,
            message: `Roket meledak di ${point.toFixed(2)}x!`,
            gameId: 'crash',
          });
        }
        cancelAnimationFrame(requestRef.current);
      } else {
        setCurrentMultiplier(mult);
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
  };

  const cashOut = () => {
    if (gameState !== 'running') return;
    cancelAnimationFrame(requestRef.current);

    const mult = currentMultiplier;
    setCashedMultiplier(mult);
    setGameState('cashed');

    const payout = Math.floor(betAmount * mult);
    const profit = payout - betAmount;

    sounds.playJackpot();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onUpdateBalance(payout);

    if (onGameEnd) {
      onGameEnd({
        type: 'win',
        betAmount,
        payout,
        netProfit: profit,
        message: `Berhasil mencairkan di ${mult.toFixed(2)}x!`,
        gameId: 'crash',
      });
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="w-full max-w-2xl bg-[#141414] border border-[#262626] rounded-3xl p-6 shadow-2xl text-white">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#222]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-600 flex items-center justify-center text-xl shadow-lg">
            🚀
          </div>
          <div>
            <h3 className="font-black text-base text-white">Crash Vegas (Rocket Multiplier)</h3>
            <p className="text-[11px] text-neutral-400">Amankan koin sebelum roket meledak di angkasa!</p>
          </div>
        </div>
        <div className="text-xs bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold px-3 py-1.5 rounded-xl">
          House Edge: 5.0%
        </div>
      </div>

      {/* Rocket Flight Screen */}
      <div className="relative h-64 bg-gradient-to-b from-[#1a1025] via-[#120a18] to-[#0a060d] border border-purple-500/30 rounded-2xl flex flex-col items-center justify-center overflow-hidden mb-6 shadow-inner">
        {/* Background grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a1b3d_1px,transparent_1px),linear-gradient(to_bottom,#2a1b3d_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-25"></div>

        {gameState === 'idle' && (
          <div className="relative z-10 text-center space-y-2">
            <div className="text-5xl animate-bounce">🚀</div>
            <div className="text-lg font-black text-neutral-300">ROKET SIAP MELUNCUR</div>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Pasang taruhan dan klik tombol Cairkan sebelum roket crash secara acak!
            </p>
          </div>
        )}

        {gameState === 'running' && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="relative z-10 text-center"
          >
            <div className="text-6xl sm:text-7xl font-black font-mono text-amber-400 tracking-wider drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]">
              {currentMultiplier.toFixed(2)}x
            </div>
            <div className="text-xs text-purple-300 font-bold mt-2 animate-pulse flex items-center justify-center gap-1">
              <Zap size={14} /> Roket sedang melesat naik...
            </div>
          </motion.div>
        )}

        {gameState === 'crashed' && (
          <div className="relative z-10 text-center space-y-2">
            <div className="text-5xl animate-shake">💥</div>
            <div className="text-xl font-black text-rose-500 tracking-wide">ROKET CRASH!</div>
            <div className="text-sm font-mono text-neutral-300">
              Meledak pada: <strong className="text-rose-400">{crashPoint.toFixed(2)}x</strong>
            </div>
            <p className="text-xs text-neutral-400">Seluruh taruhan hangus. Bandar selalu menang!</p>
          </div>
        )}

        {gameState === 'cashed' && (
          <div className="relative z-10 text-center space-y-2">
            <div className="text-5xl animate-bounce">🎉</div>
            <div className="text-xl font-black text-emerald-400 tracking-wide">BERHASIL CAIR!</div>
            <div className="text-sm font-mono text-amber-300 font-bold">
              +{Math.floor(betAmount * cashedMultiplier).toLocaleString()} Koin ({cashedMultiplier.toFixed(2)}x)
            </div>
            <p className="text-xs text-neutral-400">Keuntungan berhasil diamankan sebelum crash.</p>
          </div>
        )}
      </div>

      {/* Controls & Betting */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181818] p-4 rounded-2xl border border-[#282828]">
          <div className="space-y-1">
            <label className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Jumlah Taruhan Koin</label>
            <div className="flex items-center gap-2">
              {[20, 50, 100, 250, 500].map((val) => (
                <button
                  key={val}
                  disabled={gameState === 'running'}
                  onClick={() => setBetAmount(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    betAmount === val
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-[#222] text-neutral-300 hover:bg-[#2c2c2c] border border-[#333]'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-neutral-400 block font-bold">Saldo Aktif</span>
            <span className="text-sm font-black text-amber-300 font-mono">{balance.toLocaleString()} Koin</span>
          </div>
        </div>

        {/* Action Button */}
        {gameState !== 'running' ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startCrash}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-rose-600 to-amber-600 hover:brightness-110 text-white font-black text-sm shadow-xl shadow-purple-950/50 cursor-pointer"
          >
            🚀 MULAI ROKET ({betAmount} Koin)
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={cashOut}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-black font-black text-base shadow-2xl shadow-emerald-950/70 cursor-pointer animate-pulse"
          >
            💰 CAIRKAN SEKARANG ({Math.floor(betAmount * currentMultiplier).toLocaleString()} Koin)
          </motion.button>
        )}
      </div>
    </div>
  );
}
