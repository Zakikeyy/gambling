import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, RotateCcw, HelpCircle, Gift } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface ScratchCardProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

interface Tile {
  id: number;
  symbol: string;
  prize: number;
  revealed: boolean;
}

const POSSIBLE_PRIZES = [
  { symbol: '👑', prize: 1000, label: 'Royal Crown' },
  { symbol: '💎', prize: 500, label: 'Diamond' },
  { symbol: '💰', prize: 200, label: 'Money Bag' },
  { symbol: '🪙', prize: 100, label: 'Gold Coin' },
  { symbol: '🎁', prize: 50, label: 'Gift Box' },
  { symbol: '⭐', prize: 25, label: 'Lucky Star' },
  { symbol: '🍀', prize: 15, label: 'Clover' },
];

export default function ScratchCardGame({ balance, onUpdateBalance, onGameEnd }: ScratchCardProps) {

  const [ticketPrice, setTicketPrice] = useState<number>(30);
  const [hasBoughtTicket, setHasBoughtTicket] = useState<boolean>(false);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [winResult, setWinResult] = useState<{ amount: number; message: string } | null>(null);

  const buyTicket = () => {
    if (balance < ticketPrice) {
      alert('Saldo koin tidak cukup untuk membeli tiket gosok!');
      return;
    }

    onUpdateBalance(-ticketPrice);
    sounds.playChip();
    setWinResult(null);

    // Generate 9 tiles with RNG.
    // Decide whether this ticket is a winning ticket (~40% win rate)
    const isWinner = Math.random() < 0.42;
    let winningPrize = POSSIBLE_PRIZES[POSSIBLE_PRIZES.length - 1]; // default low

    if (isWinner) {
      // Pick random prize weighted towards smaller prizes
      const rand = Math.random();
      if (rand < 0.05) winningPrize = POSSIBLE_PRIZES[0]; // 1000
      else if (rand < 0.12) winningPrize = POSSIBLE_PRIZES[1]; // 500
      else if (rand < 0.25) winningPrize = POSSIBLE_PRIZES[2]; // 200
      else if (rand < 0.5) winningPrize = POSSIBLE_PRIZES[3]; // 100
      else if (rand < 0.75) winningPrize = POSSIBLE_PRIZES[4]; // 50
      else winningPrize = POSSIBLE_PRIZES[5]; // 25
    }

    const generated: Tile[] = [];
    if (isWinner) {
      // Put 3 of winningPrize
      for (let i = 0; i < 3; i++) {
        generated.push({ id: i, symbol: winningPrize.symbol, prize: winningPrize.prize, revealed: false });
      }
      // Fill rest with random different symbols (max 2 of any other)
      for (let i = 3; i < 9; i++) {
        const others = POSSIBLE_PRIZES.filter((p) => p.symbol !== winningPrize.symbol);
        const randomP = others[Math.floor(Math.random() * others.length)];
        generated.push({ id: i, symbol: randomP.symbol, prize: randomP.prize, revealed: false });
      }
    } else {
      // Losing ticket: no 3 of any kind
      const pool = [...POSSIBLE_PRIZES];
      for (let i = 0; i < 9; i++) {
        const randomP = pool[i % pool.length];
        generated.push({ id: i, symbol: randomP.symbol, prize: randomP.prize, revealed: false });
      }
    }

    // Shuffle
    generated.sort(() => Math.random() - 0.5);
    setTiles(generated.map((t, idx) => ({ ...t, id: idx })));
    setHasBoughtTicket(true);
  };

  const scratchTile = (index: number) => {
    if (!hasBoughtTicket || tiles[index].revealed) return;
    sounds.playCard();

    const newTiles = [...tiles];
    newTiles[index] = { ...newTiles[index], revealed: true };
    setTiles(newTiles);

    // Check if all revealed
    const allRevealed = newTiles.every((t) => t.revealed);
    if (allRevealed) {
      evaluateCard(newTiles);
    }
  };

  const scratchAll = () => {
    if (!hasBoughtTicket) return;
    sounds.playCard();
    const newTiles = tiles.map((t) => ({ ...t, revealed: true }));
    setTiles(newTiles);
    evaluateCard(newTiles);
  };

  const evaluateCard = (currentTiles: Tile[]) => {
    // Count symbols
    const counts: { [sym: string]: number } = {};
    currentTiles.forEach((t) => {
      counts[t.symbol] = (counts[t.symbol] || 0) + 1;
    });

    let wonPrize = 0;
    let winningSym = '';
    for (const [sym, count] of Object.entries(counts)) {
      if (count >= 3) {
        const pObj = POSSIBLE_PRIZES.find((p) => p.symbol === sym);
        if (pObj && pObj.prize > wonPrize) {
          wonPrize = pObj.prize;
          winningSym = sym;
        }
      }
    }

    if (wonPrize > 0) {
      sounds.playWin();
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      onUpdateBalance(wonPrize);
      const winMsg = `SELAMAT! Anda menemukan 3x ${winningSym} dan memenangkan ${wonPrize} Koin! 🎉`;
      setWinResult({
        amount: wonPrize,
        message: winMsg,
      });
      onGameEnd?.({
        type: 'win',
        betAmount: ticketPrice,
        payout: wonPrize,
        netProfit: wonPrize - ticketPrice,
        message: winMsg,
        gameId: 'scratch',
      });
    } else {
      sounds.playBomb();
      const lossMsg = 'Belum ada 3 simbol kembar. Coba gosok tiket berikutnya!';
      setWinResult({
        amount: 0,
        message: lossMsg,
      });
      onGameEnd?.({
        type: 'loss',
        betAmount: ticketPrice,
        payout: 0,
        netProfit: -ticketPrice,
        message: lossMsg,
        gameId: 'scratch',
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center max-w-lg mx-auto">
      {/* Scratchcard Ticket Container */}
      <div className="w-full bg-gradient-to-br from-[#2a1b3d] via-[#1a1226] to-[#120c1a] border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl relative">
        {/* Ticket Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎫</span>
            <div>
              <h2 className="text-base font-extrabold text-purple-300 tracking-wider">LUCKY SCRATCH 777</h2>
              <p className="text-[11px] text-purple-400/70">Cocokkan 3 Simbol Kembar Untuk Menang!</p>
            </div>
          </div>
          <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full font-mono font-bold">
            Harga: {ticketPrice} 🪙
          </span>
        </div>

        {/* Scratch Surface */}
        {!hasBoughtTicket ? (
          <div className="py-12 px-4 rounded-2xl bg-[#140e1e] border-2 border-dashed border-purple-500/30 flex flex-col items-center justify-center text-center my-4">
            <Gift size={48} className="text-purple-400 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white mb-1">Beli Tiket Gosok Keberuntungan</h3>
            <p className="text-xs text-neutral-400 mb-6 max-w-xs">
              Temukan 3 simbol yang sama di balik foil perak untuk memenangkan hadiah hingga 1000 Koin!
            </p>

            <button
              onClick={buyTicket}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-purple-950/60 active:scale-95 transition-all cursor-pointer"
            >
              BELI TIKET ({ticketPrice} KOIN)
            </button>
          </div>
        ) : (
          <div>
            {/* 3x3 Scratch Tiles */}
            <div className="grid grid-cols-3 gap-3 my-2">
              {tiles.map((tile, idx) => (
                <div
                  key={tile.id}
                  onClick={() => scratchTile(idx)}
                  className={`h-24 sm:h-28 rounded-xl flex flex-col items-center justify-center relative cursor-pointer select-none transition-all shadow-md overflow-hidden ${
                    tile.revealed
                      ? 'bg-gradient-to-b from-[#251838] to-[#160d24] border-2 border-purple-500/40 text-white'
                      : 'bg-gradient-to-br from-neutral-400 via-neutral-300 to-neutral-500 border-2 border-neutral-200 text-neutral-700 hover:brightness-105 active:scale-95'
                  }`}
                >
                  {tile.revealed ? (
                    <div className="flex flex-col items-center justify-center animate-pop-in">
                      <span className="text-4xl sm:text-5xl">{tile.symbol}</span>
                      <span className="text-[10px] text-purple-300 font-bold mt-1">🪙 {tile.prize}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <Sparkles size={20} className="text-neutral-500 mb-1" />
                      <span className="text-[10px] font-black tracking-wider text-neutral-600 uppercase">
                        GOSOK
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center justify-between gap-3 mt-4">
              <button
                onClick={scratchAll}
                className="py-2 px-4 rounded-lg bg-purple-900/40 hover:bg-purple-800/40 border border-purple-500/30 text-purple-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Gosok Semua Sekaligus
              </button>

              <button
                onClick={buyTicket}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white font-bold text-xs tracking-wide shadow-md active:scale-95 cursor-pointer"
              >
                Tiket Baru ({ticketPrice} Koin)
              </button>
            </div>
          </div>
        )}

        {/* Win Banner */}
        {winResult && (
          <div
            className={`mt-4 p-3 rounded-xl text-center text-xs font-bold border animate-fade-in ${
              winResult.amount > 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700'
            }`}
          >
            {winResult.message}
          </div>
        )}

        {/* Prize Legend */}
        <div className="mt-4 pt-3 border-t border-purple-500/20">
          <span className="text-[11px] text-neutral-400 font-medium block mb-2">Daftar Hadiah Simbol Kembar (3x):</span>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-[10px] text-center">
            {POSSIBLE_PRIZES.map((p) => (
              <div key={p.symbol} className="bg-black/30 p-1 rounded border border-purple-500/10">
                <div className="text-sm">{p.symbol}</div>
                <div className="font-bold text-purple-300">{p.prize}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
