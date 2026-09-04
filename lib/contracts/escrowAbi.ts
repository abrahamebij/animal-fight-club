export const ESCROW_ABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'BattleRegistered',
    inputs: [
      { name: 'battleId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'ownerA', type: 'address', indexed: true, internalType: 'address' },
      { name: 'ownerB', type: 'address', indexed: true, internalType: 'address' },
      { name: 'bettingClosesAt', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'WagerPlaced',
    inputs: [
      { name: 'battleId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'bettor', type: 'address', indexed: true, internalType: 'address' },
      { name: 'side', type: 'uint8', indexed: false, internalType: 'enum AnimalFightClubEscrow.Side' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'BattleResolved',
    inputs: [
      { name: 'battleId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'winner', type: 'uint8', indexed: false, internalType: 'enum AnimalFightClubEscrow.Side' },
    ],
  },
  {
    type: 'event',
    name: 'BattleCancelled',
    inputs: [
      { name: 'battleId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
    ],
  },
  {
    type: 'event',
    name: 'PayoutClaimed',
    inputs: [
      { name: 'battleId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'bettor', type: 'address', indexed: true, internalType: 'address' },
      { name: 'payoutAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'protocolAdmin',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'registerBattle',
    inputs: [
      { name: 'battleId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'ownerA', type: 'address', internalType: 'address' },
      { name: 'ownerB', type: 'address', internalType: 'address' },
      { name: 'bettingClosesAt', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'placeWager',
    inputs: [
      { name: 'battleId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'side', type: 'uint8', internalType: 'enum AnimalFightClubEscrow.Side' },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'resolveBattle',
    inputs: [
      { name: 'battleId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'winner', type: 'uint8', internalType: 'enum AnimalFightClubEscrow.Side' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelBattle',
    inputs: [
      { name: 'battleId', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimPayout',
    inputs: [
      { name: 'battleId', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getBattle',
    inputs: [{ name: 'battleId', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct AnimalFightClubEscrow.BattleWagerState',
        components: [
          { name: 'ownerA', type: 'address', internalType: 'address' },
          { name: 'ownerB', type: 'address', internalType: 'address' },
          { name: 'bettingClosesAt', type: 'uint256', internalType: 'uint256' },
          { name: 'totalPoolA', type: 'uint256', internalType: 'uint256' },
          { name: 'totalPoolB', type: 'uint256', internalType: 'uint256' },
          { name: 'status', type: 'uint8', internalType: 'enum AnimalFightClubEscrow.BattleStatus' },
          { name: 'winner', type: 'uint8', internalType: 'enum AnimalFightClubEscrow.Side' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWager',
    inputs: [
      { name: 'battleId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'bettor', type: 'address', internalType: 'address' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct AnimalFightClubEscrow.Wager',
        components: [
          { name: 'amount', type: 'uint256', internalType: 'uint256' },
          { name: 'side', type: 'uint8', internalType: 'enum AnimalFightClubEscrow.Side' },
          { name: 'claimed', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const;
