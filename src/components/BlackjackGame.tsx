import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Shield, Plus, Hand, Sparkles, Layers } from 'lucide-react';
import { sounds } from '../utils/audio';
import { GameOutcome } from '../types/game';

interface BlackjackProps {
  balance: number;
  onUpdateBalance: (amount: number) => void;
  onGameEnd?: (outcome: GameOutcome) => void;
}

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
}

export default function BlackjackGame({ balance, onUpdateBalance, onGameEnd }: BlackjackProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'dealing' | 'playing' | 'dealerTurn' | 'ended'>('betting');
  const [bet, setBet] = useState<number>(50);
  const [currentBet, setCurrentBet] = useState<number>(50);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [resultType, setResultType] = useState<'win' | 'lose' | 'push' | 'blackjack' | null>(null);

  // Build deck with unique card IDs
  const createFreshDeck = (): Card[] => {
    const suits: Suit[] = ['♠', '♥', '♦', '♣'];
    const ranks: { rank: Rank; val: number }[] = [
      { rank: 'A', val: 11 },
      { rank: '2', val: 2 },
      { rank: '3', val: 3 },
      { rank: '4', val: 4 },
      { rank: '5', val: 5 },
      { rank: '6', val: 6 },
      { rank: '7', val: 7 },
      { rank: '8', val: 8 },
      { rank: '9', val: 9 },
      { rank: '10', val: 10 },
      { rank: 'J', val: 10 },
      { rank: 'Q', val: 10 },
      { rank: 'K', val: 10 },
    ];
    const newDeck: Card[] = [];
    let counter = 0;
    for (const suit of suits) {
      for (const r of ranks) {
        newDeck.push({
          id: `${suit}-${r.rank}-${Date.now()}-${counter++}`,
          suit,
          rank: r.rank,
          value: r.val,
        });
      }
    }
    // Shuffle
    return newDeck.sort(() => Math.random() - 0.5);
  };

  // Calculate hand score with Ace handling
  const calculateScore = (hand: Card[]): number => {
    let score = hand.reduce((acc, c) => acc + c.value, 0);
    let aceCount = hand.filter((c) => c.rank === 'A').length;

    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount -= 1;
    }
    return score;
  };

  // Start round with realistic sequential dealing animation
  const dealInitialCards = () => {
    if (balance < bet) {
      alert('Saldo koin tidak cukup untuk memasang taruhan ini!');
      return;
    }

    onUpdateBalance(-bet);
    setCurrentBet(bet);
    sounds.playChip();

    const currentDeck = createFreshDeck();
    const p1 = currentDeck.pop()!;
    const d1 = currentDeck.pop()!;
    const p2 = currentDeck.pop()!;
    const d2 = currentDeck.pop()!;

    setDeck(currentDeck);
    setPlayerHand([]);
    setDealerHand([]);
    setResultMessage('');
    setResultType(null);
    setGameState('dealing');

    // 1. Deal 1st card to Player
    setTimeout(() => {
      setPlayerHand([p1]);
      sounds.playCard();
    }, 150);

    // 2. Deal 1st card to Dealer
    setTimeout(() => {
      setDealerHand([d1]);
      sounds.playCard();
    }, 450);

    // 3. Deal 2nd card to Player
    setTimeout(() => {
      setPlayerHand([p1, p2]);
      sounds.playCard();
    }, 750);

    // 4. Deal 2nd card (hole card) to Dealer
    setTimeout(() => {
      setDealerHand([d1, d2]);
      sounds.playCard();
    }, 1050);

    // 5. Complete dealing and evaluate naturals
    setTimeout(() => {
      const pScore = calculateScore([p1, p2]);
      const dScore = calculateScore([d1, d2]);

      // Check for natural Blackjack
      if (pScore === 21) {
        if (dScore === 21) {
          // Push
          setGameState('ended');
          setResultMessage('Sama-sama Blackjack! Push (Seri).');
          setResultType('push');
          onUpdateBalance(bet);
          onGameEnd?.({
            type: 'push',
            betAmount: bet,
            payout: bet,
            netProfit: 0,
            message: 'Sama-sama Blackjack! Push (Seri).',
            gameId: 'blackjack',
          });
        } else {
          // Player Natural Blackjack pays 3:2
          const winPayout = Math.round(bet * 2.5); // bet + 1.5 * bet
          setGameState('ended');
          setResultMessage(`BLACKJACK! Anda Menang 3:2 (+${winPayout - bet} Koin)!`);
          setResultType('blackjack');
          onUpdateBalance(winPayout);
          sounds.playJackpot();
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          onGameEnd?.({
            type: 'win',
            betAmount: bet,
            payout: winPayout,
            netProfit: winPayout - bet,
            message: `BLACKJACK! Anda Menang 3:2 (+${winPayout - bet} Koin)!`,
            gameId: 'blackjack',
          });
        }
      } else {
        setGameState('playing');
      }
    }, 1350);
  };

  // Player Hits
  const handleHit = () => {
    if (gameState !== 'playing') return;
    const currentDeck = [...deck];
    const card = currentDeck.pop();
    if (!card) return;

    sounds.playCard();
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(currentDeck);

    const score = calculateScore(newHand);
    if (score > 21) {
      // Player Bust!
      sounds.playBomb();
      setGameState('ended');
      setResultMessage(`Bust! Total nilai ${score} melebihi 21. Anda kalah.`);
      setResultType('lose');
      onGameEnd?.({
        type: 'loss',
        betAmount: currentBet,
        payout: 0,
        netProfit: -currentBet,
        message: `Bust! Total nilai ${score} melebihi 21. Anda kalah.`,
        gameId: 'blackjack',
      });
    } else if (score === 21) {
      handleStand(newHand);
    }
  };

  // Player Stands -> Dealer plays
  const handleStand = (pHand = playerHand) => {
    if (gameState !== 'playing') return;
    setGameState('dealerTurn');

    let currentDeck = [...deck];
    let curDealerHand = [...dealerHand];
    let dScore = calculateScore(curDealerHand);
    const pScore = calculateScore(pHand);

    // Dealer draws cards step by step until score >= 17
    const playDealerStep = () => {
      dScore = calculateScore(curDealerHand);
      if (dScore < 17) {
        const nextCard = currentDeck.pop();
        if (nextCard) {
          curDealerHand = [...curDealerHand, nextCard];
          setDealerHand(curDealerHand);
          sounds.playCard();
          setTimeout(playDealerStep, 700);
          return;
        }
      }

      // Finish evaluation
      finishRound(pScore, dScore);
    };

    setTimeout(playDealerStep, 700);
  };

  // Player Double Down
  const handleDoubleDown = () => {
    if (gameState !== 'playing' || playerHand.length !== 2) return;
    if (balance < currentBet) {
      alert('Saldo tidak cukup untuk Double Down!');
      return;
    }

    onUpdateBalance(-currentBet);
    const doubleBet = currentBet * 2;
    setCurrentBet(doubleBet);
    sounds.playChip();

    const currentDeck = [...deck];
    const card = currentDeck.pop();
    if (!card) return;

    sounds.playCard();
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(currentDeck);

    const score = calculateScore(newHand);
    if (score > 21) {
      sounds.playBomb();
      setGameState('ended');
      setResultMessage(`Double Down Bust (${score})! Anda kalah ${doubleBet} koin.`);
      setResultType('lose');
      onGameEnd?.({
        type: 'loss',
        betAmount: doubleBet,
        payout: 0,
        netProfit: -doubleBet,
        message: `Double Down Bust (${score})! Anda kalah ${doubleBet} koin.`,
        gameId: 'blackjack',
      });
    } else {
      handleStand(newHand);
    }
  };

  // Conclude game
  const finishRound = (pScore: number, dScore: number) => {
    setGameState('ended');

    if (dScore > 21) {
      // Dealer busts
      sounds.playWin();
      confetti({ particleCount: 60, spread: 60 });
      setResultMessage(`Dealer Bust (${dScore})! Anda Menang (+${currentBet} Koin)!`);
      setResultType('win');
      onUpdateBalance(currentBet * 2);
      onGameEnd?.({
        type: 'win',
        betAmount: currentBet,
        payout: currentBet * 2,
        netProfit: currentBet,
        message: `Dealer Bust (${dScore})! Anda Menang (+${currentBet} Koin)!`,
        gameId: 'blackjack',
      });
    } else if (pScore > dScore) {
      sounds.playWin();
      confetti({ particleCount: 60, spread: 60 });
      setResultMessage(`Anda Menang (${pScore} vs ${dScore})! (+${currentBet} Koin)!`);
      setResultType('win');
      onUpdateBalance(currentBet * 2);
      onGameEnd?.({
        type: 'win',
        betAmount: currentBet,
        payout: currentBet * 2,
        netProfit: currentBet,
        message: `Anda Menang (${pScore} vs ${dScore})! (+${currentBet} Koin)!`,
        gameId: 'blackjack',
      });
    } else if (dScore > pScore) {
      sounds.playBomb();
      setResultMessage(`Dealer Menang (${dScore} vs ${pScore}). Anda kalah.`);
      setResultType('lose');
      onGameEnd?.({
        type: 'loss',
        betAmount: currentBet,
        payout: 0,
        netProfit: -currentBet,
        message: `Dealer Menang (${dScore} vs ${pScore}). Anda kalah.`,
        gameId: 'blackjack',
      });
    } else {
      // Push
      sounds.playChip();
      setResultMessage(`Push! Skor imbang (${pScore} vs ${dScore}). Taruhan dikembalikan.`);
      setResultType('push');
      onUpdateBalance(currentBet);
      onGameEnd?.({
        type: 'push',
        betAmount: currentBet,
        payout: currentBet,
        netProfit: 0,
        message: `Push! Skor imbang (${pScore} vs ${dScore}). Taruhan dikembalikan.`,
        gameId: 'blackjack',
      });
    }
  };

  const isRedSuit = (suit: Suit) => suit === '♥' || suit === '♦';

  const playerScore = calculateScore(playerHand);
  const dealerVisibleScore =
    gameState === 'playing' || gameState === 'dealing'
      ? dealerHand[0]?.value ?? 0
      : calculateScore(dealerHand);

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto">
      {/* Felt Table */}
      <div className="w-full bg-gradient-to-b from-[#0c2f1f] via-[#092418] to-[#061810] border-4 border-[#1e462e] rounded-3xl p-5 shadow-2xl relative text-white overflow-hidden">
        {/* Table Felt Header & Dealing Shoe Indicator */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-emerald-500/20">
          <div>
            <h2 className="text-sm font-bold tracking-widest text-emerald-300">BLACKJACK 21</h2>
            <p className="text-[10px] text-emerald-400/60 uppercase">Dealer stands on 17 • Blackjack pays 3:2</p>
          </div>

          {/* Visual Casino Deck Shoe */}
          <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/30 px-2.5 py-1 rounded-xl shadow-inner">
            <div className="flex -space-x-2">
              <div className="w-4 h-6 rounded bg-gradient-to-b from-blue-900 to-indigo-950 border border-blue-400/40 shadow -rotate-12" />
              <div className="w-4 h-6 rounded bg-gradient-to-b from-blue-800 to-indigo-900 border border-blue-300/40 shadow -rotate-3" />
              <div className="w-4 h-6 rounded bg-gradient-to-b from-blue-700 to-indigo-850 border border-blue-200/50 shadow rotate-6" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400/70 font-semibold">DECK SHOE</span>
              <span className="text-[10px] font-mono font-bold text-emerald-200">
                {deck.length > 0 ? `${deck.length} Kartu` : '52 Kartu'}
              </span>
            </div>
          </div>
        </div>

        {/* Dealer Hand Area */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-emerald-200">DEALER</span>
            {dealerHand.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-black/40 text-[11px] font-mono border border-emerald-500/20">
                {gameState === 'playing' || gameState === 'dealing' ? (
                  <>Terbuka: {dealerVisibleScore}</>
                ) : (
                  <>Skor Total: {dealerVisibleScore}</>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2.5 min-h-[105px]">
            {dealerHand.length === 0 ? (
              <div className="text-xs text-emerald-400/40 italic flex items-center gap-1.5 py-6">
                <Layers size={14} className="text-emerald-500/40" />
                <span>Menunggu kartu dibagikan dari Shoe...</span>
              </div>
            ) : (
              <AnimatePresence>
                {dealerHand.map((card, idx) => {
                  // Hide dealer's second card during dealing and player's turn
                  const isHidden = idx === 1 && (gameState === 'playing' || gameState === 'dealing');

                  return (
                    <motion.div
                      key={card.id || `dealer-${idx}`}
                      initial={{
                        opacity: 0,
                        y: -75,
                        x: 55,
                        rotate: -18,
                        scale: 0.6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        x: 0,
                        rotate: 0,
                        scale: 1,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 360,
                        damping: 24,
                        mass: 0.75,
                      }}
                      className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl flex flex-col justify-between p-2 shadow-2xl border transition-shadow select-none ${
                        isHidden
                          ? 'bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-950 border-blue-400/50 text-blue-200 flex items-center justify-center font-bold'
                          : `bg-white border-neutral-300 ${isRedSuit(card.suit) ? 'text-red-600' : 'text-neutral-900'}`
                      }`}
                    >
                      {isHidden ? (
                        <div className="text-center flex flex-col items-center justify-center">
                          <div className="text-2xl drop-shadow">🂠</div>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-300 mt-1">
                            Tertutup
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="text-xs sm:text-sm font-black leading-none">{card.rank}</div>
                          <div className="text-2xl sm:text-3xl text-center leading-none my-auto drop-shadow-sm">
                            {card.suit}
                          </div>
                          <div className="text-xs sm:text-sm font-black text-right leading-none">{card.rank}</div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Center Game Result Banner */}
        {resultMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`my-3 p-2.5 rounded-xl text-center text-xs font-bold shadow-md ${
              resultType === 'win' || resultType === 'blackjack'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : resultType === 'push'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}
          >
            {resultMessage}
          </motion.div>
        )}

        {/* Player Hand Area */}
        <div className="flex flex-col items-center mt-2 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-emerald-200">KARTU ANDA</span>
            {playerHand.length > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono border ${
                  playerScore > 21
                    ? 'bg-red-900/60 text-red-300 border-red-500/40 font-bold'
                    : playerScore === 21
                    ? 'bg-amber-500/30 text-amber-200 border-amber-500/40 font-bold'
                    : 'bg-black/40 text-white border-emerald-500/20'
                }`}
              >
                Skor: {playerScore}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-2.5 min-h-[105px]">
            {playerHand.length === 0 ? (
              <div className="text-xs text-emerald-400/40 italic py-6">
                Klik "BAGIKAN KARTU" untuk mulai
              </div>
            ) : (
              <AnimatePresence>
                {playerHand.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{
                      opacity: 0,
                      y: -85,
                      x: 65,
                      rotate: -15,
                      scale: 0.6,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      x: 0,
                      rotate: 0,
                      scale: 1,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 360,
                      damping: 24,
                      mass: 0.75,
                    }}
                    whileHover={{ y: -4, scale: 1.04 }}
                    className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl flex flex-col justify-between p-2 shadow-2xl border bg-white border-neutral-300 select-none ${
                      isRedSuit(card.suit) ? 'text-red-600' : 'text-neutral-900'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-black leading-none">{card.rank}</div>
                    <div className="text-2xl sm:text-3xl text-center leading-none my-auto drop-shadow-sm">
                      {card.suit}
                    </div>
                    <div className="text-xs sm:text-sm font-black text-right leading-none">{card.rank}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-emerald-500/20">
          {gameState === 'dealing' ? (
            <div className="py-3.5 rounded-xl bg-black/40 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Membagikan kartu satu per satu ke meja...</span>
            </div>
          ) : gameState === 'dealerTurn' ? (
            <div className="py-3.5 rounded-xl bg-black/40 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Giliran Dealer membuka kartu...</span>
            </div>
          ) : gameState === 'playing' ? (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleHit}
                className="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus size={16} /> HIT (+Kartu)
              </button>
              <button
                onClick={() => handleStand()}
                className="py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Hand size={16} /> STAND (Cukup)
              </button>
              <button
                onClick={handleDoubleDown}
                disabled={playerHand.length !== 2 || balance < currentBet}
                className="py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Sparkles size={16} /> DOUBLE (2x)
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded-xl border border-emerald-500/20">
                <span className="text-xs text-neutral-300">Pilih Taruhan:</span>
                <div className="flex items-center gap-1.5">
                  {[25, 50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        sounds.playChip();
                        setBet(amt);
                      }}
                      className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                        bet === amt
                          ? 'bg-emerald-500 text-white font-bold'
                          : 'bg-[#1a3826] text-emerald-200 hover:bg-[#254d35]'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={dealInitialCards}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/60 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Shield size={16} /> BAGIKAN KARTU (TARUHAN {bet} KOIN)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
