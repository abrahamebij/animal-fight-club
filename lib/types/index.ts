export type BoundAsset = 'BTC' | 'ETH' | 'UNBOUND' | null;

export interface BeastStats {
  power: number;      // Offensive damage capacity (1-10)
  defense: number;    // Damage mitigation & armor (1-10)
  speed: number;      // Turn initiative & dodge chance (1-10)
  special: number;    // Critical strike chance & ability synergy (1-10)
}

export interface PerkDefinition {
  id: string;
  name: string;
  category: 'OFFENSIVE' | 'DEFENSIVE' | 'TACTICAL';
  description: string;
  effectSummary: string;
}

export interface Beast {
  id: string;
  ownerAddress: string;
  name: string;
  description: string;
  avatarUrl: string;
  stats: BeastStats;
  perks: string[]; // Perk IDs
  boundAsset: BoundAsset;
  record: {
    wins: number;
    losses: number;
  };
  createdAt: number;
}

export type BattleStatus = 'pending' | 'live' | 'completed';

export type ChallengeStatus = 'awaiting_response' | 'accepted' | 'declined';

export interface Challenge {
  id: string;
  challengerBeast: Beast;
  challengedBeast: Beast;
  challengerAddress: string;
  challengedAddress: string;
  status: ChallengeStatus;
  createdAt: number;
  respondedAt?: number;
  battleId?: string;
}

export interface MarketPulse {
  asset?: 'BTC' | 'ETH';
  marketId?: string;
  symbol: string;
  intervalSec?: number;
  upProbability: number;
  bestBid?: number | string;
  bestAsk?: number | string;
  modifier: {
    stat: keyof BeastStats;
    value?: number; // e.g. +2 Speed
    percentageBonus?: number;
    description: string;
  };
  locked?: boolean;
  lockedAt?: number;
  oracleQuestionId?: string;
  readTimestamp?: number;
}


export interface CombatTurn {
  turnNumber: number;
  actor: 'beastA' | 'beastB';
  actionName: string;
  reasoning: string;
  damageDealt: number;
  isCritical: boolean;
  beastAHp: number;
  beastBHp: number;
  combatNarrative: string;
  timestamp: number;
}

export interface Battle {
  id: string;
  beastA: Beast;
  beastB: Beast;
  status: BattleStatus;
  challengeAcceptedAt: number;
  bettingWindowClosesAt: number;
  marketPulseA: MarketPulse | null;
  marketPulseB: MarketPulse | null;
  combatLog: CombatTurn[];
  winner: 'beastA' | 'beastB' | null;
  totalPoolA: number;
  totalPoolB: number;
  createdAt: number;
}

export interface Bet {
  id: string;
  battleId: string;
  bettorAddress: string;
  beastPicked: 'beastA' | 'beastB';
  amount: number;
  status: 'active' | 'won' | 'lost' | 'refunded' | 'claimed';
  placedAt: number;
  payoutAmount?: number;
}

export interface LeaderboardEntry {
  rank: number;
  beastId: string;
  beastName: string;
  ownerAddress: string;
  avatarUrl: string;
  boundAsset: BoundAsset;
  wins: number;
  losses: number;
  winRate: number;
  totalBattles: number;
}

export interface BettorLeaderboardEntry {
  rank: number;
  address: string;
  totalWagered: number;
  profit: number;
  winRate: number;
  totalBets: number;
}

export interface LiveEventMarket {
  marketId: string;
  pool: string;
  symbol: string;
  asset: 'BTC' | 'ETH';
  cadence: '15-min' | '1-hour';
  intervalSec: number;
  expiry: number; // Unix timestamp in seconds
  secondsLeft: number;
  upSymbol: string;
  downSymbol: string;
  upOdds: number; // Implied probability 0..1
  downOdds: number; // Implied probability 0..1
  bestBid?: string;
  bestAsk?: string;
  oracleQuestionId?: string;
  status: number; // 1 = Trading
}

export interface EventPrediction {
  id: string;
  userAddress: string;
  marketId: string;
  poolAddress: string;
  asset: 'BTC' | 'ETH';
  side: 'UP' | 'DOWN';
  symbol: string;
  cadence: '15-min' | '1-hour';
  stakeAmount: number; // in tUSDC human units
  price: number;
  timeInForce: 'IOC';
  status: 'open' | 'closed' | 'canceled';
  marketExpiry: number;
  txHash: string;
  createdAt: number;
  marketStatus?: number; // 1: Trading, 2: Locked, 4: Resolved
  winningOutcome?: number; // 0: UP/YES, 1: DOWN/NO
  isResolved?: boolean;
  isCorrect?: boolean;
}

