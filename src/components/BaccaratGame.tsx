import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Shield, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface BaccaratProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

type BetType = 'player' | 'banker' | 'tie';

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  rank: string;
  value: number; // 0 to 9
}

export default function BaccaratGame({ balance, onUpdateBalance, onGameEnd }: BaccaratProps) {

  const [selectedBet, setSelectedBet] = useState<BetType>('player');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isDealing, setIsDealing] = useState<boolean>(false);
  
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState<number | null>(null);
  const [bankerScore, setBankerScore] = useState<number | null>(null);
  
  const [outcome, setOutcome] = useState<string>('');
  const [winMessage, setWinMessage] = useState<string>('');
  const [roadMap, setRoadMap] = useState<('P' | 'B' | 'T')[]>(['P', 'B', 'B', 'P', 'T', 'B', 'P']);

  const drawCard = (): Card => {
    const suits: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const rank = ranks[Math.floor(Math.random() * ranks.length)];
    let val = 0;
    if (rank === 'A') val = 1;
    else if (['10', 'J', 'Q', 'K'].includes(rank)) val = 0;
    else val = parseInt(rank, 10);

    return { suit, rank, value: val };
  };

  const calculateHand = (cards: Card[]): number => {
    const sum = cards.reduce((acc, c) => acc + c.value, 0);
    return sum % 10;
  };

  const handleDeal = () => {
    if (isDealing) return;
    if (balance < betAmount) {
      alert('Saldo koin tidak cukup untuk memasang taruhan Baccarat!');
      return;
    }

    onUpdateBalance(-betAmount);
    setIsDealing(true);
    setOutcome('');
    setWinMessage('');
    sounds.playChip();

    // Deal first 2 cards to Player & Banker
    const p1 = drawCard();
    const b1 = drawCard();
    const p2 = drawCard();
    const b2 = drawCard();

    sounds.playCard();
    setPlayerCards([p1, p2]);
    setBankerCards([b1, b2]);

    let pHand = [p1, p2];
    let bHand = [b1, b2];
    let pScore = calculateHand(pHand);
    let bScore = calculateHand(bHand);

    setPlayerScore(pScore);
    setBankerScore(bScore);

    // Official Punto Banco drawing rules
    setTimeout(() => {
      // Check Naturals (8 or 9)
      const isNatural = pScore >= 8 || bScore >= 8;

      if (!isNatural) {
        let playerThirdCard: Card | null = null;
        // Player draws 3rd card if total is 0 to 5
        if (pScore <= 5) {
          playerThirdCard = drawCard();
          pHand = [...pHand, playerThirdCard];
          sounds.playCard();
          setPlayerCards(pHand);
          pScore = calculateHand(pHand);
          setPlayerScore(pScore);
        }

        // Banker drawing logic
        let bankerDraws = false;
        if (!playerThirdCard) {
          // Player stood (6 or 7) -> Banker draws on 0-5, stands on 6-7
          if (bScore <= 5) bankerDraws = true;
        } else {
          // Player drew a 3rd card -> Banker tableau
          const p3Val = playerThirdCard.value;
          if (bScore <= 2) bankerDraws = true;
          else if (bScore === 3 && p3Val !== 8) bankerDraws = true;
          else if (bScore === 4 && [2, 3, 4, 5, 6, 7].includes(p3Val)) bankerDraws = true;
          else if (bScore === 5 && [4, 5, 6, 7].includes(p3Val)) bankerDraws = true;
          else if (bScore === 6 && [6, 7].includes(p3Val)) bankerDraws = true;
        }

        if (bankerDraws) {
          const b3 = drawCard();
          bHand = [...bHand, b3];
          sounds.playCard();
          setBankerCards(bHand);
          bScore = calculateHand(bHand);
          setBankerScore(bScore);
        }
      }

      // Final Evaluation
      let winner: 'player' | 'banker' | 'tie';
      let roundTag: 'P' | 'B' | 'T';

      if (pScore > bScore) {
        winner = 'player';
        roundTag = 'P';
        setOutcome(`PLAYER MENANG (${pScore} vs ${bScore})!`);
      } else if (bScore > pScore) {
        winner = 'banker';
        roundTag = 'B';
        setOutcome(`BANKER MENANG (${bScore} vs ${pScore})!`);
      } else {
        winner = 'tie';
        roundTag = 'T';
        setOutcome(`TIE / SERI (${pScore} vs ${bScore})!`);
      }

      setRoadMap((prev) => [roundTag, ...prev.slice(0, 15)]);

      // Payouts
      let won = 0;
      if (selectedBet === winner) {
        if (winner === 'player') won = betAmount * 2; // 1:1
        else if (winner === 'banker') won = Math.round(betAmount * 1.95); // 0.95:1
        else if (winner === 'tie') won = betAmount * 9; // 8:1 + return bet

        sounds.playWin();
        confetti({ particleCount: 70, spread: 60 });
        onUpdateBalance(won);
        const winMsg = `Selamat! Anda menebak ${winner.toUpperCase()} dan menang +${won - betAmount} koin!`;
        setWinMessage(winMsg);
        onGameEnd?.({
          type: 'win',
          betAmount,
          payout: won,
          netProfit: won - betAmount,
          message: winMsg,
          gameId: 'baccarat',
        });
      } else if (winner === 'tie' && selectedBet !== 'tie') {
        // Tie pushes Player/Banker bets
        sounds.playChip();
        onUpdateBalance(betAmount);
        const pushMsg = 'Hasil Tie! Taruhan Player/Banker dikembalikan.';
        setWinMessage(pushMsg);
        onGameEnd?.({
          type: 'push',
          betAmount,
          payout: betAmount,
          netProfit: 0,
          message: pushMsg,
          gameId: 'baccarat',
        });
      } else {
        sounds.playBomb();
        const lossMsg = `Taruhan pada ${selectedBet.toUpperCase()} kalah.`;
        setWinMessage(lossMsg);
        onGameEnd?.({
          type: 'loss',
          betAmount,
          payout: 0,
          netProfit: -betAmount,
          message: lossMsg,
          gameId: 'baccarat',
        });
      }

      setIsDealing(false);
    }, 1200);
  };

  const isRedSuit = (suit: string) => suit === '♥' || suit === '♦';

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto">
      {/* Baccarat Table */}
      <div className="w-full bg-gradient-to-b from-[#131d2a] via-[#0d1620] to-[#080e15] border-4 border-[#23354a] rounded-3xl p-5 shadow-2xl relative text-white">
        {/* Header */}
        <div className="text-center mb-4 pb-2 border-b border-blue-500/20">
          <h2 className="text-sm font-bold tracking-widest text-blue-300">BACCARAT (PUNTO BANCO)</h2>
          <p className="text-[10px] text-blue-300/60 uppercase">Target Nilai 9 • Natural 8/9 Wins • Banker Bayar 0.95:1</p>
        </div>

        {/* Road Map (Bead Plate History) */}
        <div className="mb-4 bg-black/40 p-2.5 rounded-xl border border-blue-500/20 flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-medium">Road Map (Riwayat):</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {roadMap.map((r, i) => (
              <span
                key={i}
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] text-white shadow-sm ${
                  r === 'P' ? 'bg-blue-600' : r === 'B' ? 'bg-red-600' : 'bg-emerald-600'
                }`}
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Card Arena: Player vs Banker */}
        <div className="grid grid-cols-2 gap-4 my-4">
          {/* PLAYER SIDE */}
          <div className="bg-[#101b27] border-2 border-blue-600/50 rounded-2xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-400">PLAYER</span>
              {playerScore !== null && (
                <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 text-xs font-mono font-bold">
                  {playerScore}
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 min-h-[90px]">
              {playerCards.length === 0 ? (
                <span className="text-xs text-blue-300/30">Belum ada kartu</span>
              ) : (
                playerCards.map((c, idx) => (
                  <div
                    key={idx}
                    className={`w-14 h-20 rounded-lg flex flex-col justify-between p-1 bg-white border border-neutral-300 shadow-md ${
                      isRedSuit(c.suit) ? 'text-red-600' : 'text-neutral-900'
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-none">{c.rank}</div>
                    <div className="text-xl text-center leading-none">{c.suit}</div>
                    <div className="text-[11px] font-bold text-right leading-none">{c.rank}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* BANKER SIDE */}
          <div className="bg-[#241316] border-2 border-red-600/50 rounded-2xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-red-400">BANKER</span>
              {bankerScore !== null && (
                <span className="px-2 py-0.5 rounded bg-red-900/60 text-red-200 text-xs font-mono font-bold">
                  {bankerScore}
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 min-h-[90px]">
              {bankerCards.length === 0 ? (
                <span className="text-xs text-red-300/30">Belum ada kartu</span>
              ) : (
                bankerCards.map((c, idx) => (
                  <div
                    key={idx}
                    className={`w-14 h-20 rounded-lg flex flex-col justify-between p-1 bg-white border border-neutral-300 shadow-md ${
                      isRedSuit(c.suit) ? 'text-red-600' : 'text-neutral-900'
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-none">{c.rank}</div>
                    <div className="text-xl text-center leading-none">{c.suit}</div>
                    <div className="text-[11px] font-bold text-right leading-none">{c.rank}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Outcome Display */}
        {outcome && (
          <div className="my-2 p-2.5 rounded-xl bg-black/60 border border-amber-500/30 text-center animate-fade-in">
            <div className="text-xs font-bold text-amber-300">{outcome}</div>
            {winMessage && <div className="text-[11px] text-neutral-300 mt-0.5">{winMessage}</div>}
          </div>
        )}

        {/* Betting Selection (Player, Tie, Banker) */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <button
            onClick={() => setSelectedBet('player')}
            className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedBet === 'player'
                ? 'bg-blue-600 text-white border-blue-300 ring-2 ring-blue-400 font-bold shadow-lg scale-102'
                : 'bg-blue-950/40 text-blue-300 border-blue-600/30 hover:bg-blue-900/30'
            }`}
          >
            <span className="text-xs font-black">PLAYER</span>
            <span className="text-[10px] opacity-80 mt-0.5">Bayar 1:1</span>
          </button>

          <button
            onClick={() => setSelectedBet('tie')}
            className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedBet === 'tie'
                ? 'bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-400 font-bold shadow-lg scale-102'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/30 hover:bg-emerald-900/30'
            }`}
          >
            <span className="text-xs font-black">TIE (SERI)</span>
            <span className="text-[10px] opacity-80 mt-0.5">Bayar 8:1</span>
          </button>

          <button
            onClick={() => setSelectedBet('banker')}
            className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
              selectedBet === 'banker'
                ? 'bg-red-600 text-white border-red-300 ring-2 ring-red-400 font-bold shadow-lg scale-102'
                : 'bg-red-950/40 text-red-300 border-red-600/30 hover:bg-red-900/30'
            }`}
          >
            <span className="text-xs font-black">BANKER</span>
            <span className="text-[10px] opacity-80 mt-0.5">Bayar 0.95:1</span>
          </button>
        </div>

        {/* Stake and Deal Action */}
        <div className="pt-3 border-t border-blue-500/20 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded-xl border border-blue-500/20">
            <span className="text-xs text-neutral-300">Nominal Taruhan:</span>
            <div className="flex items-center gap-1.5">
              {[25, 50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  disabled={isDealing}
                  onClick={() => {
                    sounds.playChip();
                    setBetAmount(amt);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                    betAmount === amt
                      ? 'bg-blue-500 text-white font-bold'
                      : 'bg-[#182738] text-blue-200 hover:bg-[#20344b]'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={isDealing}
            onClick={handleDeal}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:brightness-110 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-950/60 active:scale-98 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles size={16} /> DEAL KARTU (TARUHAN {betAmount} KOIN DI {selectedBet.toUpperCase()})
          </button>
        </div>
      </div>
    </div>
  );
}
