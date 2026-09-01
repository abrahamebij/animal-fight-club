import { PerkDefinition } from '@/lib/types';

export const CHAIN_CONFIG = {
  chainId: 50312,
  chainName: 'Somnia Shannon Testnet',
  rpcUrl: 'https://dream-rpc.somnia.network',
  currencySymbol: 'STT',
  blockExplorer: 'https://shannon-explorer.somnia.network',
} as const;

export const DREAMDEX_CONTRACTS = {
  BinaryMarketsModule: '0x3ecC694Cef705358864a646142ac17A90E29e388',
  MarketsCore: '0x2802504314685D89bF6C992CA5a8e7cC78bc0294',
  BinarySettlement: '0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23',
  OutcomeToken6909: '0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9',
  OracleHub: '0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b',
  CollateralRouter: '0xbC0C9834B15ACE38bB50dDaa7d7f7C7CC4DC183C',
  TestnetCollateral_tUSDC: '0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E',
} as const;

export const STAT_BUDGET = {
  TOTAL_POINTS: 20,
  MIN_PER_STAT: 1,
  MAX_PER_STAT: 10,
  BASE_HP: 100,
} as const;

export const AVAILABLE_PERKS: PerkDefinition[] = [
  {
    id: 'iron_plating',
    name: 'TITANIUM CARAPACE',
    category: 'DEFENSIVE',
    description: 'Sub-dermal plating reduces critical hit damage taken by 40% and grants +5 base armor.',
    effectSummary: '-40% Crit Damage Taken, +5 Armor',
  },
  {
    id: 'kinetic_overdrive',
    name: 'KINETIC OVERDRIVE',
    category: 'OFFENSIVE',
    description: 'Converts accumulated kinetic force into explosive counter-attacks when HP drops below 35%.',
    effectSummary: '+35% Power below 35% HP',
  },
  {
    id: 'synaptic_surge',
    name: 'SYNAPTIC SURGE',
    category: 'TACTICAL',
    description: 'Advanced neural reflex suite guarantees opening turn initiative and +15% dodge chance.',
    effectSummary: 'First strike guarantee, +15% Evasion',
  },
  {
    id: 'predator_instinct',
    name: 'PREDATOR PROTOCOL',
    category: 'OFFENSIVE',
    description: 'Deep neural tracking targeting wounded combatants, increasing critical strike probability against foes below 50% HP.',
    effectSummary: '+25% Crit chance vs foes under 50% HP',
  },
  {
    id: 'nano_repair',
    name: 'CELLULAR REGENERATION',
    category: 'DEFENSIVE',
    description: 'Automated cellular recovery micro-drones regenerate 4 HP per combat round after Round 2.',
    effectSummary: '+4 HP / round starting Turn 3',
  },
  {
    id: 'volt_arc',
    name: 'TESLA DISCHARGE',
    category: 'TACTICAL',
    description: 'High-voltage capacitors discharge on contact, occasionally disrupting opponent offensive moves.',
    effectSummary: '20% Stun chance on hit',
  },
];

export const AVATAR_PRESETS = [
  {
    id: 'cyber_gorilla',
    name: 'Apex Mecha-Kong',
    imageUrl: '/assets/stitch/home/asset_1.jpg',
  },
  {
    id: 'plasma_wolf',
    name: 'Fenrir Vector-9',
    imageUrl: '/assets/stitch/home/asset_2.jpg',
  },
  {
    id: 'titan_rhino',
    name: 'Goliath Vanguard',
    imageUrl: '/assets/stitch/home/asset_3.jpg',
  },
  {
    id: 'shadow_panther',
    name: 'Spectre Night-Stalker',
    imageUrl: '/assets/stitch/home/asset_4.jpg',
  },
  {
    id: 'dread_bear',
    name: 'Ursus Demolisher',
    imageUrl: '/assets/stitch/home/asset_5.jpg',
  },
];
