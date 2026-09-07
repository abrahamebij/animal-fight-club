# Animal Fight Club

> Gamified prediction markets and real-time spectator combat powered by Somnia Shannon and DreamDEX Event Contracts.

---

## Project Links

| Resource | Link |
|---|---|
| Live Application | https://afc-market.vercel.app/ |
| GitHub Repository | https://github.com/abrahamebij/animal-fight-club |
| Video Demonstration | https://www.youtube.com/watch?v=vCSyRdNRsUI |
| Pitch Deck & Slides | https://docs.google.com/presentation/d/11zsSxJQM0FQzM7zCWMRpNXGQacSbMXcp3kDnulAnaAo/edit?usp=sharing |
| Target Network | Somnia Shannon Testnet (Chain ID: 50312) |
| Escrow Contract | `0x6e25F8863A2f3458F6F165A9dFe46522c0199187` |

---

## The Problem

Traditional prediction markets suffer from three fundamental limitations:

1. **Spreadsheet-style interfaces:** Most prediction platforms present odds as dry financial numbers, appealing strictly to DeFi traders rather than mainstream gamers or sports fans.
2. **Passive waiting periods:** Once a user places a wager, they must wait hours or days in the dark for an oracle resolution without any interactive content or visual feedback.
3. **Isolated liquidity:** Event contracts typically operate in silos away from gaming, social entertainment, and spectator communities.

---

## The Solution

**Animal Fight Club** turns live crypto prediction markets into a high-stakes, spectator combat sport. 

Players forge gladiatorial AI combatants bound to real-world crypto assets (BTC, ETH, SOL, SOMNIA). Live DreamDEX Event Contract market data directly influences each fighter's attributes in real time, spectators wager native STT in non-custodial on-chain escrow pools, and an interactive 2D arena visualizes every strike, dodge, critical hit, and knockout with sub-second finality.

Additionally, users can trade the underlying DreamDEX Event Contracts directly in-app through an integrated prediction market terminal.

---

## Core Game Loop

```
+-------------------+       +----------------------+       +----------------------+
|  1. FORGE BEAST   | ----> |  2. ARENA CHALLENGE  | ----> | 3. 1-HR WAGER WINDOW |
| Stats + Asset     |       | Direct PvP Duel      |       | STT Escrow + Pulse   |
+-------------------+       +----------------------+       +----------+-----------+
                                                                      |
+-------------------+       +----------------------+                  |
| 5. ON-CHAIN CLAIM | <---- | 4. LIVE COMBAT ENGINE| <----------------+
| Escrow Payouts    |       | GSAP 2D Ring + Replay|
+-------------------+       +----------------------+
```

1. **Forge a Beast (`/create`):** Allocate a 260-point stat budget across Power, Agility, Defense, and Special. Select archetypes, backstories, and asset bindings. Choose from high-fidelity visual presets or upload custom avatars.
2. **Issue or Accept Arena Duels (`/arena`):** Challenge rival beasts in direct PvP duels with instant challenge notifications and on-chain record tracking.
3. **1-Hour Betting Window & Market Pulse (`/battle/[id]`):** Spectators place native STT wagers on their chosen fighter. The app queries live DreamDEX Event Contract order books via `@somnia-chain/markets-sdk`, calculating dynamic stat modifiers (e.g. `+12% ATK / +8% DEF` during bullish price action).
4. **Live 2D Vector Combat:** When the wagering countdown closes, the match simulates through a tactical turn engine. The custom SVG boxing ring animates the entire battle using GSAP timelines, complete with punches, recoil, screenshake, health bar transitions, and knockouts. Includes an interactive turn scrubber and 1x / 2x / 3x speed replay controls.
5. **On-Chain Settlement & Claiming:** The duel outcome resolves on the Somnia Shannon Escrow contract, allowing winning bettors to claim their proportional share of the match pool directly.
6. **Direct Prediction Trading (`/predictions`):** Users can also directly trade live rolling Event Contracts with testnet tUSDC, using an integrated faucet, rapid UP/DOWN order slips, and verifiable transaction receipts.

---

## Technical Architecture

### 1. Smart Contracts & Somnia Testnet
* **Network:** Somnia Shannon Testnet (Chain ID `50312`, RPC: `https://dream-rpc.somnia.network`).
* **Non-Custodial Escrow Contract (`0x6e25F8863A2f3458F6F165A9dFe46522c0199187`):**
  - `createBattleOnChain`: Registers match details and combatant parameters.
  - `placeWagerOnChain`: Manages spectator pool deposits in native STT tokens.
  - `resolveBattleOnChain`: Secures outcome settlement with protocol authorization.
  - `claimPayoutOnChain`: Distributes total match pools to winners proportionally and trustlessly.
* **Testnet Collateral:** tUSDC (`0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`).

### 2. DreamDEX Event Contracts SDK Integration
* **SDK:** `@somnia-chain/markets-sdk` combined with `viem` and `wagmi`.
* **Market Discovery:** Queries the DreamDEX GraphQL indexer (`https://dev.smk.somnia.host/v1/graphql`) for active binary markets with strict on-chain status gating (`status === 1`).
* **Market Pulse Engine:** Calculates implied probabilities from real-time order books (`fetchOrderBook`) and maps sentiment into bounded combat modifiers.
* **Unified Trading Pipeline:** Employs `exchange.createOrder` with dynamic outcome symbol resolution and a direct binary pool contract fallback (`placeBinaryOrder`).

### 3. GSAP 2D Vector Arena Engine
* Custom SVG boxing arena containing responsive ropes, turnbuckles, Red/Blue corner posts, and procedural fighter models.
* GSAP timeline pipelines handling idle stances, dynamic glove colors, directional lunges, recoil impacts, hit flashes, and knockout physics.
* Deterministic turn replay state machine supporting scrubbing, pause/play, and variable speed toggles (1x, 2x, 3x).

### 4. Comprehensive Wallet Integration
* Built with `@web3icons/react` and Wagmi v2.
* Native vector branding for 25+ Web3 wallets (MetaMask, Coinbase Wallet, Phantom, Rainbow, Rabby, OKX, Brave, Zerion, Bitget, Trust, Exodus, etc.).
* Full EIP-6963 support for automatic detection of injected providers with zero wallet collision.

---

## Key Pages and Features

* **`/` (Arena Home):** Featured live duels, real-time platform statistics, combatant highlights, and rapid onboarding.
* **`/arena`:** Live duel spectating, pending match countdowns, open challenge board, and instant challenge initiation modal.
* **`/battle/[id]`:** Interactive 2D boxing arena, live Market Pulse indicator, STT wagering panel, turn-by-turn combat log, and 1x/2x/3x replay system.
* **`/create` & `/create-beast`:** Combatant forge with 260-point attribute allocation, asset binding, preset avatar gallery, and custom image upload.
* **`/predictions`:** Full DreamDEX event contract trading terminal, testnet tUSDC faucet, live order book tracking, and interactive trade receipts.
* **`/leaderboard`:** Dual ranking tables highlighting Top Combatants by win rate and Top Bettors by net STT profit.
* **`/dashboard`:** User combatants, active STT battle wagers, historical prediction order audits, and token balances.

---

## Contract Addresses & Network Details

| Parameter | Value |
|---|---|
| Network Name | Somnia Shannon Testnet |
| Chain ID | 50312 |
| Native Currency | STT (18 Decimals) |
| RPC Endpoint | https://dream-rpc.somnia.network |
| WebSocket RPC | wss://dream-rpc.somnia.network/ws |
| Block Explorer | https://shannon-explorer.somnia.network |
| Escrow Contract | `0x6e25F8863A2f3458F6F165A9dFe46522c0199187` |
| Collateral Token (tUSDC) | `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E` |
| Binary Markets Module | `0x75dD4D730F47cf6551b9E324b1050800b730f907` |
| Indexer GraphQL | https://dev.smk.somnia.host/v1/graphql |

---

## Hackathon Judging Alignment

| Criteria | Weight | Implementation Highlights |
|---|---|---|
| **Innovation & Originality** | 20% | Bridges prediction markets and tactical turn-based combat. Real-world financial sentiment directly alters virtual combat attributes. |
| **Technical Implementation** | 25% | Full integration of Somnia Shannon escrow contracts, `@somnia-chain/markets-sdk` order book feeds, Next.js 16 (Turbopack), and GSAP animations. Passed build and lint checks with zero errors and zero warnings. |
| **UX & Visual Polish** | 20% | High-contrast brutalist design system, SVG boxing arena, custom visual presets, `@web3icons` wallet modal, and minimal bullish/bearish indicators. |
| **Business & Ecosystem Impact** | 20% | Brings non-traditional DeFi users, gamers, and sports bettors into the Somnia and DreamDEX ecosystems, generating both trading volume and on-chain gaming transactions. |
| **Presentation & Completeness** | 15% | Fully deployed application on Vercel, verified live contracts on Somnia Shannon, detailed video demonstration, comprehensive pitch slides, and an end-to-end playable loop. |

---

## Local Development Setup

### Prerequisites
* Node.js v18+ or v20+
* pnpm (`npm install -g pnpm`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abrahamebij/animal-fight-club.git
cd animal-fight-club
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_DREAMDEX_INDEXER_URL=https://dev.smk.somnia.host/v1/graphql
DREAMDEX_INDEXER_URL=https://dev.smk.somnia.host/v1/graphql
METAMASK_PRIVATE_KEY=your_admin_private_key_here
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key_here
```

4. Run the development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Verify linting and production build:
```bash
pnpm lint
pnpm build
```

---

## License

This project is licensed under the MIT License.
