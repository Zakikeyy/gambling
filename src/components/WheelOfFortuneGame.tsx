import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { RotateCw, Sparkles, Trophy } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface WheelOfFortuneProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

interface Segment {
  id: number;
  multiplier: number;
  label: string;
  color: string;
}

const SEGMENTS: Segment[] = [
  { id: 0, multiplier: 1, label: '1x', color: '#3b82f6' },
  { id: 1, multiplier: 2, label: '2x', color: '#eab308' },
  { id: 2, multiplier: 1, label: '1x', color: '#3b82f6' },
  { id: 3, multiplier: 5, label: '5x', color: '#10b981' },
  { id: 4, multiplier: 1, label: '1x', color: '#3b82f6' },
  { id: 5, multiplier: 2, label: '2x', color: '#eab308' },
  { id: 6, multiplier: 10, label: '10x', color: '#8b5cf6' },
  { id: 7, multiplier: 1, label: '1x', color: '#3b82f6' },
  { id: 8, multiplier: 2, label: '2x', color: '#eab308' },
  { id: 9, multiplier: 5, label: '5x', color: '#10b981' },
  { id: 10, multiplier: 1, label: '1x', color: '#3b82f6' },
  { id: 11, multiplier: 40, label: '⭐ 40x', color: '#ec4899' },
  { id: 12, multiplier: 1, label: '1x', color: '#3b82f6' },
  { id: 13, multiplier: 2, label: '2x', color: '#eab308' },
  { id: 14, multiplier: 1, label: '1x', color: '#3b82f6' },
  { id: 15, multiplier: 20, label: '20x', color: '#f97316' },
];

export default function WheelOfFortuneGame({ balance, onUpdateBalance, onGameEnd }: WheelOfFortuneProps) {

  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(2);
  const [betAmount, setBetAmount] = useState<number>(30);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [resultText, setResultText] = useState<string>('Pilih angka pengali lalu putar Roda Keberuntungan!');
  const [lastWin, setLastWin] = useState<number | null>(null);

  const numSegments = SEGMENTS.length;
  const segmentAngle = 360 / numSegments;

  const spinWheel = () => {
    if (isSpinning) return;
    if (balance < betAmount) {
      alert('Saldo koin tidak cukup untuk memutar Roda Keberuntungan!');
      return;
    }

    onUpdateBalance(-betAmount);
    sounds.playChip();
    setIsSpinning(true);
    setLastWin(null);

    // Pick random target segment
    const targetIdx = Math.floor(Math.random() * numSegments);
    const targetSegment = SEGMENTS[targetIdx];

    // Extra spins (5 to 8 full rotations) + target angle
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
    // The pointer is at the TOP (0 degrees).
    // Segment i occupies angle [i * segmentAngle, (i + 1) * segmentAngle].
    // Center of segment i is at (i + 0.5) * segmentAngle.
    // To align with top pointer, wheel must rotate:
    const targetAngle = 360 - (targetIdx + 0.5) * segmentAngle;
    const finalRotation = currentRotation + extraSpins + (targetAngle - (currentRotation % 360) + 360) % 360;

    setCurrentRotation(finalRotation);

    // Clicker sound during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sounds.playRouletteTick();
      tickCount++;
      if (tickCount > 30) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);

      if (targetSegment.multiplier === selectedMultiplier) {
        const winPayout = betAmount * (targetSegment.multiplier + 1);
        sounds.playWin();
        if (targetSegment.multiplier >= 10) {
          sounds.playJackpot();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } else {
          confetti({ particleCount: 50, spread: 60 });
        }
        onUpdateBalance(winPayout);
        setLastWin(winPayout);
        const winMsg = `Roda berhenti di ${targetSegment.label}! Anda MENANG +${winPayout - betAmount} Koin! 🎉`;
        setResultText(winMsg);
        onGameEnd?.({
          type: 'win',
          betAmount,
          payout: winPayout,
          netProfit: winPayout - betAmount,
          message: winMsg,
          gameId: 'wheel',
        });
      } else {
        sounds.playBomb();
        const lossMsg = `Roda berhenti di ${targetSegment.label}. Pilihan Anda (${selectedMultiplier}x) tidak tembus.`;
        setResultText(lossMsg);
        onGameEnd?.({
          type: 'loss',
          betAmount,
          payout: 0,
          netProfit: -betAmount,
          message: lossMsg,
          gameId: 'wheel',
        });
      }
    }, 4000);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto">
      {/* Cabinet Frame */}
      <div className="w-full bg-gradient-to-b from-[#26152a] via-[#1a0f1d] to-[#110913] border-4 border-[#4d2454] rounded-3xl p-5 shadow-2xl relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-500/20">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎡</span>
            <div>
              <h2 className="text-sm font-bold tracking-widest text-pink-300">WHEEL OF FORTUNE</h2>
              <p className="text-[10px] text-pink-400/60 uppercase">Big Six Vegas Wheel • Hadiah Hingga 40x</p>
            </div>
          </div>
          <span className="text-xs bg-pink-500/10 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full font-semibold">
            {isSpinning ? 'MEMUTAR...' : 'SIAP PUTAR'}
          </span>
        </div>

        {/* Wheel & Pointer Container */}
        <div className="flex flex-col items-center my-4 relative">
          {/* Top Pointer Indicator */}
          <div className="z-20 -mb-3 flex flex-col items-center drop-shadow-lg">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400" />
            <div className="w-3 h-3 rounded-full bg-amber-300 -mt-1" />
          </div>

          {/* Rotating Big Wheel */}
          <div
            className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border-4 border-amber-400 shadow-2xl relative overflow-hidden flex items-center justify-center transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${currentRotation}deg)`,
              background: 'radial-gradient(circle, #2a1630 30%, #15081a 100%)',
            }}
          >
            {/* SVG Segments */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {SEGMENTS.map((seg, idx) => {
                const startAngle = idx * (360 / numSegments) * (Math.PI / 180);
                const endAngle = (idx + 1) * (360 / numSegments) * (Math.PI / 180);
                const x1 = 50 + 50 * Math.cos(startAngle);
                const y1 = 50 + 50 * Math.sin(startAngle);
                const x2 = 50 + 50 * Math.cos(endAngle);
                const y2 = 50 + 50 * Math.sin(endAngle);
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                return (
                  <path
                    key={seg.id}
                    d={pathData}
                    fill={seg.color}
                    opacity="0.88"
                    stroke="#110913"
                    strokeWidth="0.75"
                  />
                );
              })}
            </svg>

            {/* Segment Labels Overlay */}
            {SEGMENTS.map((seg, idx) => {
              const rot = idx * segmentAngle + segmentAngle / 2;
              return (
                <div
                  key={seg.id}
                  className="absolute text-[10px] sm:text-xs font-black text-white pointer-events-none drop-shadow"
                  style={{
                    transform: `rotate(${rot}deg) translate(0, -78px)`,
                  }}
                >
                  {seg.label}
                </div>
              );
            })}

            {/* Center Cap */}
            <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 border-2 border-white shadow-xl flex items-center justify-center text-black font-extrabold text-xs">
              ★
            </div>
          </div>
        </div>

        {/* Result Message */}
        <div className="my-2 p-2.5 rounded-xl bg-black/60 border border-pink-500/20 text-center text-xs font-semibold text-pink-200">
          {resultText}
        </div>

        {/* Multiplier Bet Selector */}
        <div className="mt-4 pt-3 border-t border-pink-500/20 flex flex-col gap-3">
          <span className="text-xs text-neutral-300 font-medium">Pilih Angka Taruhan (Multiplier):</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1, 2, 5, 10, 20, 40].map((m) => (
              <button
                key={m}
                disabled={isSpinning}
                onClick={() => {
                  sounds.playChip();
                  setSelectedMultiplier(m);
                }}
                className={`py-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  selectedMultiplier === m
                    ? 'bg-amber-500 text-black border-amber-300 font-bold ring-2 ring-amber-400 shadow-md scale-102'
                    : 'bg-[#211126] text-neutral-300 border-pink-900/40 hover:bg-[#2c1733]'
                }`}
              >
                <span className="text-xs font-black">{m}x</span>
                <span className="text-[10px] opacity-80">{m === 40 ? 'JACKPOT' : `Bayar ${m}x`}</span>
              </button>
            ))}
          </div>

          {/* Bet size and Spin button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-pink-500/20 mt-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-300">Taruhan:</span>
              {[20, 30, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  disabled={isSpinning}
                  onClick={() => {
                    sounds.playChip();
                    setBetAmount(amt);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                    betAmount === amt
                      ? 'bg-pink-500 text-white font-bold'
                      : 'bg-[#2b1631] text-pink-200 hover:bg-[#381c40]'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            <button
              disabled={isSpinning}
              onClick={spinWheel}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:brightness-110 text-white font-extrabold text-xs tracking-wider shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCw size={15} className={isSpinning ? 'animate-spin' : ''} />
              <span>PUTAR RODA ({betAmount} KOIN)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
