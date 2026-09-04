import { keccak256, stringToBytes, parseEther, formatEther, createPublicClient, http } from 'viem';
import { somniaShannon } from '@/lib/config/wagmi';
import { ESCROW_ABI } from '@/lib/contracts/escrowAbi';
import { ESCROW_CONTRACT_CONFIG } from '@/lib/constants/game';

export enum EscrowSide {
  None = 0,
  BeastA = 1,
  BeastB = 2,
}

export enum EscrowBattleStatus {
  Uninitialized = 0,
  Pending = 1,
  Resolved = 2,
  Cancelled = 3,
}

export interface OnChainBattleState {
  ownerA: `0x${string}`;
  ownerB: `0x${string}`;
  bettingClosesAt: bigint;
  totalPoolA: bigint;
  totalPoolB: bigint;
  status: EscrowBattleStatus;
  winner: EscrowSide;
}

export interface OnChainWager {
  amount: bigint;
  side: EscrowSide;
  claimed: boolean;
}

/**
 * Converts a string battle ID into the bytes32 hash expected by AnimalFightClubEscrow.sol
 */
export function battleIdToBytes32(battleId: string): `0x${string}` {
  return keccak256(stringToBytes(battleId));
}

/**
 * Converts frontend side string ('beastA' | 'beastB') to contract EscrowSide enum uint8
 */
export function sideToEscrowEnum(side: 'beastA' | 'beastB'): EscrowSide {
  return side === 'beastA' ? EscrowSide.BeastA : EscrowSide.BeastB;
}

/**
 * Creates a public client connected to Somnia Shannon testnet
 */
export function getEscrowPublicClient() {
  return createPublicClient({
    chain: somniaShannon,
    transport: http(somniaShannon.rpcUrls.default.http[0]),
  });
}

/**
 * Reads on-chain battle state from AnimalFightClubEscrow.sol
 */
export async function fetchOnChainBattle(battleId: string): Promise<OnChainBattleState | null> {
  if (!ESCROW_CONTRACT_CONFIG.isConfigured) return null;

  try {
    const client = getEscrowPublicClient();
    const bytes32Id = battleIdToBytes32(battleId);
    const data = await client.readContract({
      address: ESCROW_CONTRACT_CONFIG.address,
      abi: ESCROW_ABI,
      functionName: 'getBattle',
      args: [bytes32Id],
    });

    return {
      ownerA: data.ownerA as `0x${string}`,
      ownerB: data.ownerB as `0x${string}`,
      bettingClosesAt: data.bettingClosesAt,
      totalPoolA: data.totalPoolA,
      totalPoolB: data.totalPoolB,
      status: Number(data.status) as EscrowBattleStatus,
      winner: Number(data.winner) as EscrowSide,
    };
  } catch (error) {
    console.warn('Failed to fetch on-chain battle from escrow contract:', error);
    return null;
  }
}

/**
 * Reads on-chain wager state for a given bettor from AnimalFightClubEscrow.sol
 */
export async function fetchOnChainWager(
  battleId: string,
  bettorAddress: string
): Promise<OnChainWager | null> {
  if (!ESCROW_CONTRACT_CONFIG.isConfigured || !bettorAddress) return null;

  try {
    const client = getEscrowPublicClient();
    const bytes32Id = battleIdToBytes32(battleId);
    const data = await client.readContract({
      address: ESCROW_CONTRACT_CONFIG.address,
      abi: ESCROW_ABI,
      functionName: 'getWager',
      args: [bytes32Id, bettorAddress as `0x${string}`],
    });

    return {
      amount: data.amount,
      side: Number(data.side) as EscrowSide,
      claimed: data.claimed,
    };
  } catch (error) {
    console.warn('Failed to fetch on-chain wager from escrow contract:', error);
    return null;
  }
}

function getAdminPrivateKey(): `0x${string}` | null {
  let key = process.env.METAMASK_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!key && typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.resolve('.env.local');
      if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const k = trimmed.slice(0, eqIdx).trim();
            const v = trimmed.slice(eqIdx + 1).trim();
            if (k === 'METAMASK_PRIVATE_KEY' || k === 'PRIVATE_KEY') {
              key = v;
              break;
            }
          }
        }
      }
    } catch {
      // Ignore file read error
    }
  }

  if (!key) return null;
  return (key.startsWith('0x') ? key : `0x${key}`) as `0x${string}`;
}

function normalizeAddress(addr?: string | null): `0x${string}` {
  if (addr && addr.startsWith('0x') && addr.length === 42) {
    return addr as `0x${string}`;
  }
  return '0x0000000000000000000000000000000000000001' as `0x${string}`;
}

/**
 * Registers battle on-chain via protocolAdmin wallet
 */
export async function registerBattleOnChain(
  battleId: string,
  ownerA: string,
  ownerB: string,
  bettingClosesAtMs: number
): Promise<string | null> {
  const privateKey = getAdminPrivateKey();
  if (!ESCROW_CONTRACT_CONFIG.isConfigured || !privateKey) return null;

  try {
    const existing = await fetchOnChainBattle(battleId);
    if (existing && existing.status !== EscrowBattleStatus.Uninitialized) {
      return 'ALREADY_REGISTERED';
    }

    const { privateKeyToAccount } = await import('viem/accounts');
    const { createWalletClient } = await import('viem');
    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: somniaShannon,
      transport: http(somniaShannon.rpcUrls.default.http[0]),
    });

    const bytes32Id = battleIdToBytes32(battleId);
    const nowSec = Math.floor(Date.now() / 1000);
    const minDeadline = nowSec + 3600; // at least 1 hour in the future
    const candidateDeadline = Math.floor(bettingClosesAtMs / 1000);
    const bettingClosesAtSec = BigInt(Math.max(minDeadline, candidateDeadline));

    const validOwnerA = normalizeAddress(ownerA);
    const validOwnerB = normalizeAddress(ownerB);

    const hash = await walletClient.writeContract({
      address: ESCROW_CONTRACT_CONFIG.address,
      abi: ESCROW_ABI,
      functionName: 'registerBattle',
      args: [bytes32Id, validOwnerA, validOwnerB, bettingClosesAtSec],
    });

    return hash;
  } catch (err) {
    console.warn('registerBattleOnChain error:', err);
    return null;
  }
}

/**
 * Resolves battle on-chain via protocolAdmin wallet
 */
export async function resolveBattleOnChain(
  battleId: string,
  winner: 'beastA' | 'beastB'
): Promise<string | null> {
  const privateKey = getAdminPrivateKey();
  if (!ESCROW_CONTRACT_CONFIG.isConfigured || !privateKey) return null;

  try {
    const existing = await fetchOnChainBattle(battleId);
    if (existing && existing.status === EscrowBattleStatus.Resolved) {
      return 'ALREADY_RESOLVED';
    }

    const { privateKeyToAccount } = await import('viem/accounts');
    const { createWalletClient } = await import('viem');
    const account = privateKeyToAccount(privateKey);
    const walletClient = createWalletClient({
      account,
      chain: somniaShannon,
      transport: http(somniaShannon.rpcUrls.default.http[0]),
    });

    const bytes32Id = battleIdToBytes32(battleId);
    const winnerSide = sideToEscrowEnum(winner);

    const hash = await walletClient.writeContract({
      address: ESCROW_CONTRACT_CONFIG.address,
      abi: ESCROW_ABI,
      functionName: 'resolveBattle',
      args: [bytes32Id, winnerSide],
    });

    return hash;
  } catch (err) {
    console.warn('resolveBattleOnChain error:', err);
    return null;
  }
}
