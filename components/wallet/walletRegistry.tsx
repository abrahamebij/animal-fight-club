import React from 'react';
import {
  WalletMetamask,
  WalletCoinbase,
  WalletTrust,
  WalletRainbow,
  WalletPhantom,
  WalletRabby,
  WalletWalletConnect,
  WalletOkx,
  WalletLedger,
  WalletTrezor,
  WalletSafe,
  WalletExodus,
  WalletArgent,
  WalletBackpack,
  WalletBitbox,
  WalletEnkrypt,
  WalletKeplr,
  WalletKraken,
  WalletTokenPocket,
  WalletXdefi,
  WalletSolflare,
  WalletMyEtherWallet,
  WalletAlphaWallet,
  WalletAmbire,
  WalletAtomic,
  WalletRonin,
  WalletSequence,
  WalletGlow,
  WalletImtoken,
  WalletZengo,
  WalletZerion,
  WalletCypherock,
  WalletVenly,
  WalletSquads,
  WalletPillar,
  WalletDaimo,
  WalletPortal,
  WalletUnipass,
  WalletSoul,
  WalletClave,
  WalletObvious,
  WalletKukai,
  WalletSender,
  WalletCoin98,
  WalletBlue,
  WalletTemple,
  WalletAlfa1,
  WalletMultis,
  WalletLit,
  WalletPecunityWallet,
  WalletWallet3,
  Web3IconLogo,
} from '@web3icons/react';
import { SiBrave } from 'react-icons/si';

export interface WalletDefinition {
  name: string;
  link: string;
  matchKeys: string[];
  renderIcon: (props: { size?: number | string; className?: string }) => React.ReactNode;
}

// Brave Lion Component Wrapper
function BraveIcon({ size = 24, className = '' }: { size?: number | string; className?: string }) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <SiBrave
      style={{ width: pixelSize, height: pixelSize }}
      className={`text-[#FB542B] flex-shrink-0 ${className}`}
    />
  );
}

// Master mapping of all known Web3 wallets to @web3icons/react components and official links
export const WALLET_REGISTRY: WalletDefinition[] = [
  {
    name: 'MetaMask',
    link: 'https://metamask.io',
    matchKeys: ['metamask', 'io.metamask'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletMetamask size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Brave Wallet',
    link: 'https://brave.com/wallet',
    matchKeys: ['brave', 'com.brave.wallet'],
    renderIcon: (props) => <BraveIcon {...props} />,
  },
  {
    name: 'Coinbase Wallet',
    link: 'https://www.coinbase.com/wallet',
    matchKeys: ['coinbase', 'com.coinbase.wallet', 'coinbasewallet'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletCoinbase size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Rabby Wallet',
    link: 'https://rabby.io',
    matchKeys: ['rabby', 'io.rabby'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletRabby size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Rainbow',
    link: 'https://rainbow.me',
    matchKeys: ['rainbow', 'me.rainbow'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletRainbow size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Trust Wallet',
    link: 'https://trustwallet.com',
    matchKeys: ['trust', 'trustwallet', 'com.trustwallet.app'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletTrust size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Phantom',
    link: 'https://phantom.app',
    matchKeys: ['phantom', 'app.phantom'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletPhantom size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'OKX Wallet',
    link: 'https://www.okx.com/web3',
    matchKeys: ['okx', 'okxwallet', 'com.okex.wallet'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletOkx size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'WalletConnect',
    link: 'https://walletconnect.network',
    matchKeys: ['walletconnect'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletWalletConnect size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Safe',
    link: 'https://safe.global',
    matchKeys: ['safe', 'gnosis'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletSafe size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Zerion',
    link: 'https://zerion.io',
    matchKeys: ['zerion', 'io.zerion.wallet'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletZerion size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Backpack',
    link: 'https://backpack.app',
    matchKeys: ['backpack', 'app.backpack'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletBackpack size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'TokenPocket',
    link: 'https://www.tokenpocket.pro',
    matchKeys: ['tokenpocket', 'vip.mytokenpocket'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletTokenPocket size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'XDEFI Wallet',
    link: 'https://xdefi.io',
    matchKeys: ['xdefi'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletXdefi size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Ledger',
    link: 'https://www.ledger.com',
    matchKeys: ['ledger'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletLedger size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Trezor',
    link: 'https://trezor.io',
    matchKeys: ['trezor'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletTrezor size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Argent',
    link: 'https://www.argent.xyz',
    matchKeys: ['argent'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletArgent size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Exodus',
    link: 'https://www.exodus.com',
    matchKeys: ['exodus'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletExodus size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Enkrypt',
    link: 'https://www.enkrypt.com',
    matchKeys: ['enkrypt'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletEnkrypt size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Keplr',
    link: 'https://www.keplr.app',
    matchKeys: ['keplr'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletKeplr size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Kraken Wallet',
    link: 'https://www.kraken.com/wallet',
    matchKeys: ['kraken'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletKraken size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Solflare',
    link: 'https://solflare.com',
    matchKeys: ['solflare'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletSolflare size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'MyEtherWallet',
    link: 'https://www.myetherwallet.com',
    matchKeys: ['mew', 'myetherwallet'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletMyEtherWallet size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Ronin',
    link: 'https://wallet.roninchain.com',
    matchKeys: ['ronin'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletRonin size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Sequence',
    link: 'https://sequence.xyz',
    matchKeys: ['sequence'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletSequence size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'imToken',
    link: 'https://token.im',
    matchKeys: ['imtoken'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletImtoken size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'BitBox',
    link: 'https://shiftcrypto.ch',
    matchKeys: ['bitbox'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletBitbox size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Ambire',
    link: 'https://www.ambire.com',
    matchKeys: ['ambire'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletAmbire size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Atomic Wallet',
    link: 'https://atomicwallet.io',
    matchKeys: ['atomic'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletAtomic size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Glow',
    link: 'https://glow.app',
    matchKeys: ['glow'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletGlow size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'ZenGo',
    link: 'https://zengo.com',
    matchKeys: ['zengo'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletZengo size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Coin98',
    link: 'https://coin98.com',
    matchKeys: ['coin98'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletCoin98 size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Cypherock',
    link: 'https://www.cypherock.com',
    matchKeys: ['cypherock'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletCypherock size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Venly',
    link: 'https://www.venly.io',
    matchKeys: ['venly'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletVenly size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Squads',
    link: 'https://squads.so',
    matchKeys: ['squads'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletSquads size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Pillar',
    link: 'https://www.pillar.fi',
    matchKeys: ['pillar'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletPillar size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Daimo',
    link: 'https://daimo.com',
    matchKeys: ['daimo'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletDaimo size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Portal',
    link: 'https://portalhq.io',
    matchKeys: ['portal'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletPortal size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'UniPass',
    link: 'https://unipass.id',
    matchKeys: ['unipass'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletUnipass size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Soul',
    link: 'https://soulwallet.io',
    matchKeys: ['soul'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletSoul size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Clave',
    link: 'https://getclave.io',
    matchKeys: ['clave'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletClave size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Obvious',
    link: 'https://obvious.technology',
    matchKeys: ['obvious'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletObvious size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Kukai',
    link: 'https://kukai.app',
    matchKeys: ['kukai'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletKukai size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Sender',
    link: 'https://sender.org',
    matchKeys: ['sender'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletSender size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'BlueWallet',
    link: 'https://bluewallet.io',
    matchKeys: ['blue', 'bluewallet'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletBlue size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Temple',
    link: 'https://templewallet.com',
    matchKeys: ['temple'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletTemple size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Alfa1',
    link: 'https://alfa1.io',
    matchKeys: ['alfa1'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletAlfa1 size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Multis',
    link: 'https://multis.com',
    matchKeys: ['multis'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletMultis size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Lit Protocol',
    link: 'https://litprotocol.com',
    matchKeys: ['lit'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletLit size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Pecunity',
    link: 'https://pecunity.com',
    matchKeys: ['pecunity'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletPecunityWallet size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Wallet3',
    link: 'https://wallet3.io',
    matchKeys: ['wallet3'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletWallet3 size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'AlphaWallet',
    link: 'https://alphawallet.com',
    matchKeys: ['alphawallet'],
    renderIcon: ({ size = 24, className = '' }) => (
      <WalletAlphaWallet size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
  {
    name: 'Injected Provider',
    link: 'https://ethereum.org/en/wallets',
    matchKeys: ['injected', 'browser'],
    renderIcon: ({ size = 24, className = '' }) => (
      <Web3IconLogo size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  },
];

// Fallback resolver for any wallet/connector
export function getWalletDetails(name?: string, id?: string): WalletDefinition {
  const queryName = (name || '').toLowerCase().trim();
  const queryId = (id || '').toLowerCase().trim();

  // Try exact match first, then partial match
  for (const wallet of WALLET_REGISTRY) {
    for (const key of wallet.matchKeys) {
      if (
        queryName === key ||
        queryId === key ||
        queryName.includes(key) ||
        queryId.includes(key)
      ) {
        return wallet;
      }
    }
  }

  // Default fallback
  return {
    name: name || 'Web3 Wallet',
    link: 'https://ethereum.org/en/wallets',
    matchKeys: [],
    renderIcon: ({ size = 24, className = '' }) => (
      <Web3IconLogo size={size} variant="branded" className={`flex-shrink-0 ${className}`} />
    ),
  };
}

// Reusable component to render the wallet icon with EIP-6963 data URI fallback
export function WalletIconRenderer({
  name,
  id,
  iconUrl,
  size = 24,
  className = '',
}: {
  name?: string;
  id?: string;
  iconUrl?: string;
  size?: number | string;
  className?: string;
}) {
  const wallet = getWalletDetails(name, id);

  // If a known wallet from registry is matched, use the official @web3icons vector icon
  if (wallet.matchKeys.length > 0) {
    return wallet.renderIcon({ size, className });
  }

  // If an EIP-6963 data URI icon was provided by an unmapped injected wallet
  if (iconUrl && (iconUrl.startsWith('data:') || iconUrl.startsWith('http'))) {
    const pixelSize = typeof size === 'number' ? `${size}px` : size;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt={name || 'Wallet icon'}
        style={{ width: pixelSize, height: pixelSize }}
        className={`object-contain flex-shrink-0 ${className}`}
      />
    );
  }

  // Fallback to Web3IconLogo
  return wallet.renderIcon({ size, className });
}
