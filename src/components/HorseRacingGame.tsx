import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Flag, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface HorseRacingProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

interface Horse {
  id: number;
  name: string;
  color: string;
  bgColor: string;
  odds: number;
  progress: number; // 0 to 100
}

const HORSES_DATA = [
  { id: 1, name: 'Thunder Bolt', color: '#ef4444', bgColor: 'bg-red-500', odds: 2.5 },
  { id: 2, name: 'Golden Prince', color: '#eab308', bgColor: 'bg-yellow-500', odds: 3.5 },
  { id: 3, name: 'Night Phantom', color: '#8b5cf6', bgColor: 'bg-purple-500', odds: 5.0 },
  { id: 4, name: 'Royal Sapphire', color: '#3b82f6', bgColor: 'bg-blue-500', odds: 8.0 },
  { id: 5, name: 'Lucky Star', color: '#10b981', bgColor: 'bg-emerald-500', odds: 15.0 },
];

export default function HorseRacingGame({ balance, onUpdateBalance, onGameEnd }: HorseRacingProps) {

  const [horses, setHorses] = useState<Horse[]>(
    HORSES_DATA.map((h) => ({ ...h, progress: 0 }))
  );
  const [selectedHorseId, setSelectedHorseId] = useState<number>(1);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [winner, setWinner] = useState<Horse | null>(null);
  const [raceComment, setRaceComment] = useState<string>('Pilih kuda juara Anda dan pasang taruhan!');

  const startRace = () => {
    if (isRacing) return;
    if (balance < betAmount) {
      alert('Saldo koin tidak cukup untuk memasang taruhan pacuan kuda!');
      return;
    }

    onUpdateBalance(-betAmount);
    sounds.playChip();
    setIsRacing(true);
    setWinner(null);
    setRaceComment('Balapan dimulai! Kuda-kuda melesat dari gerbang awal!');

    // Reset progress
    let currentHorses = HORSES_DATA.map((h) => ({ ...h, progress: 0 }));
    setHorses(currentHorses);

    // Gallop sound loop
    const gallopInterval = setInterval(() => {
      sounds.playDice();
    }, 200);

    const raceInterval = setInterval(() => {
      currentHorses = currentHorses.map((h) => {
        // Speed calculation based on slight odds bias + RNG burst
        const baseSpeed = Math.random() * 3.5 + 1.2;
        // Horses with lower odds have a slight consistency advantage, but high odds can burst
        const burst = Math.random() < 0.15 ? Math.random() * 3 : 0;
        const newProgress = Math.min(100, h.progress + baseSpeed + burst);
        return { ...h, progress: newProgress };
      });

      setHorses([...currentHorses]);

      // Dynamic commentary
      const leader = [...currentHorses].sort((a, b) => b.progress - a.progress)[0];
      if (leader.progress > 70 && leader.progress < 95) {
        setRaceComment(`${leader.name} memimpin di tikungan terakhir menuju garis finish!`);
      }

      const champ = currentHorses.find((h) => h.progress >= 100);
      if (champ) {
        clearInterval(raceInterval);
        clearInterval(gallopInterval);
        setIsRacing(false);
        setWinner(champ);

        if (champ.id === selectedHorseId) {
          const payout = Math.round(betAmount * champ.odds);
          sounds.playWin();
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
          onUpdateBalance(payout);
          const winMsg = `Kuda Anda ${champ.name} MENANG JUARA 1! Anda memperoleh +${payout - betAmount} Koin (${champ.odds}x)! 🎉`;
          setRaceComment(winMsg);
          onGameEnd?.({
            type: 'win',
            betAmount,
            payout,
            netProfit: payout - betAmount,
            message: winMsg,
            gameId: 'horses',
          });
        } else {
          sounds.playBomb();
          const lossMsg = `Juara 1: ${champ.name} (#${champ.id}). Kuda pilihan Anda belum berhasil.`;
          setRaceComment(lossMsg);
          onGameEnd?.({
            type: 'loss',
            betAmount,
            payout: 0,
            netProfit: -betAmount,
            message: lossMsg,
            gameId: 'horses',
          });
        }
      }
    }, 120);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto">
      {/* Race Track Cabinet */}
      <div className="w-full bg-gradient-to-b from-[#18261b] via-[#101b13] to-[#0a120c] border-4 border-[#27442f] rounded-3xl p-5 shadow-2xl relative text-white">
        {/* Track Top Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏇</span>
            <div>
              <h2 className="text-sm font-bold tracking-widest text-emerald-300">DERBY HORSE RACING</h2>
              <p className="text-[10px] text-emerald-400/60 uppercase">Kejuaraan Pacuan Kuda Internasional</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
            {isRacing ? '🏁 SEDANG BERLANGSUNG' : '🟢 SIAP MULAI'}
          </span>
        </div>

        {/* Live Race Track Arena */}
        <div className="bg-[#142318] border-2 border-emerald-800/60 rounded-2xl p-4 my-2 relative overflow-hidden shadow-inner">
          {/* Finish Line Ribbon */}
          <div className="absolute top-0 bottom-0 right-10 w-2.5 bg-[repeating-linear-gradient(45deg,#fff,#fff_4px,#000_4px,#000_8px)] opacity-70 z-10" />

          <div className="flex flex-col gap-3">
            {horses.map((horse) => (
              <div key={horse.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] px-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold ${horse.bgColor}`}>
                      {horse.id}
                    </span>
                    <span className={horse.id === selectedHorseId ? 'text-amber-300 font-bold' : 'text-neutral-200'}>
                      {horse.name}
                    </span>
                    {horse.id === selectedHorseId && (
                      <span className="text-[9px] bg-amber-400 text-black px-1 rounded font-bold">PILIHAN ANDA</span>
                    )}
                  </div>
                  <span className="text-neutral-400 font-mono text-[10px]">{horse.odds}x Odds</span>
                </div>

                {/* Track Lane Bar */}
                <div className="h-7 w-full bg-[#0b140e] rounded-lg relative overflow-hidden border border-emerald-900/40 p-0.5">
                  {/* Horse Avatar galloper */}
                  <div
                    className="absolute top-0 bottom-0 flex items-center transition-all duration-150 ease-linear"
                    style={{ left: `calc(${horse.progress * 0.88}% + 4px)` }}
                  >
                    <span className="text-xl filter drop-shadow-md">🏇</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Commentator Box */}
          <div className="mt-3 p-2.5 rounded-xl bg-black/60 border border-emerald-500/20 text-center text-xs font-semibold text-amber-300">
            {raceComment}
          </div>
        </div>

        {/* Horse Betting Selector */}
        <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-col gap-3">
          <span className="text-xs text-neutral-300 font-medium">Pilih Kuda Jagoan Anda:</span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {HORSES_DATA.map((h) => (
              <button
                key={h.id}
                disabled={isRacing}
                onClick={() => {
                  sounds.playChip();
                  setSelectedHorseId(h.id);
                }}
                className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedHorseId === h.id
                    ? 'bg-amber-500 text-black border-amber-300 font-bold ring-2 ring-amber-400 shadow-md scale-102'
                    : 'bg-[#142318] text-neutral-300 border-emerald-900/40 hover:bg-[#1b2f21]'
                }`}
              >
                <span className="text-[10px] font-mono">#{h.id}</span>
                <span className="text-xs truncate max-w-full font-bold">{h.name}</span>
                <span className="text-[10px] mt-0.5 opacity-90">{h.odds}x</span>
              </button>
            ))}
          </div>

          {/* Stake and Start Race */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-emerald-500/20 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-300">Taruhan:</span>
              {[25, 50, 100, 200, 500].map((amt) => (
                <button
                  key={amt}
                  disabled={isRacing}
                  onClick={() => {
                    sounds.playChip();
                    setBetAmount(amt);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                    betAmount === amt
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'bg-[#1b2f21] text-emerald-300 hover:bg-[#25422e]'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            <button
              disabled={isRacing}
              onClick={startRace}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-extrabold text-xs tracking-wider shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Flag size={15} /> MULAI BALAPAN ({betAmount} KOIN)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
