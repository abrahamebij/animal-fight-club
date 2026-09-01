import { formatUnits } from 'viem';

export interface BalanceLike {
  formatted?: string;
  value?: bigint;
  decimals?: number;
  symbol?: string;
}

/**
 * Safely formats native or ERC20 balance without throwing or producing NaN
 */
export function formatBalance(balance?: BalanceLike | null, precision = 2): string {
  if (!balance) return '0.00 STT';

  try {
    if (balance.formatted && !isNaN(Number(balance.formatted))) {
      const num = Number(balance.formatted);
      return `${num.toFixed(precision)} ${balance.symbol || 'STT'}`;
    }

    if (balance.value !== undefined && balance.decimals !== undefined) {
      const formatted = formatUnits(balance.value, balance.decimals);
      const num = Number(formatted);
      if (!isNaN(num)) {
        return `${num.toFixed(precision)} ${balance.symbol || 'STT'}`;
      }
    }
  } catch {
    return '0.00 STT';
  }

  return '0.00 STT';
}

/**
 * Truncates an Ethereum address to 0x1234...5678 format
 */
export function truncateAddress(address?: string | null): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
