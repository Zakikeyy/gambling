export type GameTab =
  | 'mines'
  | 'slots'
  | 'blackjack'
  | 'roulette'
  | 'baccarat'
  | 'craps'
  | 'scratch'
  | 'horses'
  | 'wheel'
  | 'plinko'
  | 'crash'
  | 'keno';

export interface GameInfo {
  id: GameTab;
  title: string;
  category: string;
  icon: string;
  badge?: string;
  description: string;
}

export interface GameOutcome {
  type: 'win' | 'loss' | 'push';
  betAmount: number;
  payout?: number;
  netProfit?: number;
  message?: string;
  gameId?: GameTab;
}

