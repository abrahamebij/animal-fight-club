export type BoundAsset = 'BTC' | 'ETH' | null;

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
  asset: 'BTC' | 'ETH';
  marketId: string;
  symbol: string;
  intervalSec: number;
  upProbability: number;
  bestBid?: number;
  bestAsk?: number;
  modifier: {
    stat: keyof BeastStats;
    value: number; // e.g. +2 Speed
    description: string;
  };
  locked: boolean;
  oracleQuestionId?: string;
  readTimestamp: number;
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
  status: 'active' | 'won' | 'lost' | 'refunded';
  placedAt: number;
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
