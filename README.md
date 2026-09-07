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

1. **Spreadsheet-style interfaces:** Most prediction platforms present odds as dry financial numbers, appealing strictly to hardcore DeFi traders rather than mainstream gamers or sports fans.
2. **Passive waiting periods:** Once a user places a wager, they must wait hours or days in the dark for an oracle resolution without any interactive content or visual engagement.
3. **Isolated liquidity:** Event contracts typically operate in financial silos away from gaming, social entertainment, and spectator communities.

---

## The Solution

**Animal Fight Club** turns live crypto prediction markets into a high-stakes, spectator combat sport on Somnia Shannon.

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

## Hackathon Evaluation & Criteria Alignment

### 1. Innovation & Originality

#### How novel is the idea?
Most hackathon prediction projects duplicate existing AMMs or build standard binary prediction cards that mimic Polymarket. Animal Fight Club introduces a completely new paradigm: **Gamified Event Contract Consumption**. 

By transforming real-time market order book depth into physical, dynamic combat modifiers, financial market volatility is transformed into entertainment. A spike in BTC buy volume is no longer just a green tick on a chart; it is a visible stat surge powering a cybernetic gladiator inside an underground boxing arena.

#### Does the project use Event Contracts creatively to solve a real-world problem?
Yes. The real-world problem of prediction markets is **passivity and low user retention**. Users place a bet and close the tab because there is nothing to watch or experience while waiting for oracle resolution.

Animal Fight Club solves this by establishing a 1-hour spectator window where:
* The live DreamDEX order book actively shifts fighter advantage back and forth until the window locks.
* Once locked, the outcome is settled through an animated tactical duel where users watch their wagers play out turn-by-turn.
* Spectators are transformed from passive bettors into active, entertained audience members.

---

### 2. Technical Implementation

#### How effectively does the project use DreamDEX Event Contracts and available APIs/SDKs?
Animal Fight Club implements a multi-tiered DreamDEX integration:

* **Direct SDK Integration:** Employs `@somnia-chain/markets-sdk` along with `viem` and `wagmi` for low-level protocol communication.
* **Order Book & Implied Odds Engine:** Ingests live bids and asks via `fetchOrderBook(symbol, depth)` to calculate real-time implied probabilities (`upOdds`, `downOdds`, `bestBid`, `bestAsk`).
* **Active Market Discovery:** Queries the DreamDEX GraphQL Indexer (`https://dev.smk.somnia.host/v1/graphql`) with strict expiry filtering (`expiry > nowSec`), on-chain status verification (`status === 1`), and automatic resolution of SDK-compatible outcome symbols (`{ASSET}-0-{DDMMMYY}/tUSDC#YES`).
* **Dual Execution Pipeline:** Executes orders primarily through `exchange.createOrder` with Immediate-Or-Cancel (IOC) parameters, supported by an on-chain fallback directly calling `placeBinaryOrder` on the underlying Binary Pool contract.

#### How strong and functional is the technical implementation?
* **On-Chain Escrow Smart Contract:** Deployed on Somnia Shannon Testnet at `0x6e25F8863A2f3458F6F165A9dFe46522c0199187`. The contract manages match creation, non-custodial STT pool deposits, protocol-authorized settlement, and mathematical proportional payouts.
* **Physics & Animation Engine:** A custom 2D vector boxing arena rendered with responsive SVG elements and GSAP timeline state machines. Features dynamic glove coloring, directional lunges, impact recoil, critical hit screenshake, health bar color gradients, and knockout collapse animations.
* **Deterministic Replay System:** Battle sequences can be scrubbed, paused, and replayed at variable speeds (1x, 2x, 3x) without desynchronizing state.
* **Engineering Standards:** Built on Next.js 16 (Turbopack) and React 19. The entire repository compiles with **0 lint errors and 0 build errors** across all 17 static and dynamic routes.

---

### 3. User Experience & Design

#### How intuitive, accessible, and usable is the product?
* **Frictionless Spectating:** Anyone can view duels, inspect fighter profiles, explore the leaderboard, test the combat replay engine, and check live market pulse without connecting a wallet. Wallet connection is requested only when a user actively initiates a wager, creates a combatant, or places a prediction.
* **1-Click Testnet Onboarding:** An integrated tUSDC faucet on the `/predictions` page allows judges and users to immediately mint testnet collateral and place orders in under 5 seconds.
* **Preset Gallery & Fast Creation:** The beast forge features 8 visual preset avatars stored locally, alongside custom image upload support powered by ImgBB.
* **Universal Web3 Wallet Modal:** Integrated with `@web3icons/react` and EIP-6963, auto-discovering injected providers and rendering native vector branding for over 25 Web3 wallets with zero provider collisions.

#### Does it provide a compelling overall user experience?
* **Disciplined Brutalist Aesthetics:** Built with a high-contrast dark theme, bold uppercase headers, monospace data readouts, and sharp borders.
* **Subtle, Contextual Color Accents:** Employs minimal emerald (`emerald-500`) and rose (`rose-500`) highlights to denote bullish/bearish biases and UP/DOWN positions without turning into visual noise.
* **Responsive Architecture:** Fully optimized for mobile, tablet, and desktop screens with slide-out bet slip drawers, sticky summaries, and scalable vector viewports.

---

### 4. Business & Ecosystem Impact

#### Attract New Users
Traditional DeFi platforms struggle to acquire non-financial users. Animal Fight Club uses gaming psychology, character creation, and spectator combat to attract gamers, sports bettors, and esports enthusiasts who would otherwise never interact with an order book DEX.

#### Generate Trading Activity
The platform features a **dual-track speculation model**:
1. **Spectator Arena Wagering:** Users deposit native STT into escrow pools to back fighters.
2. **Direct Event Contract Trading:** Users simultaneously take positions on the underlying DreamDEX Event Contracts (`/predictions`), directly generating trading volume, open interest, and transaction fees on DreamDEX.

#### Increase Event Contracts Adoption
Animal Fight Club provides a tangible demonstration of **composable event contracts**. It proves to developers and institutions that Event Contracts are not limited to standalone exchange websites—they can serve as live financial data feeds for third-party games, metaverse environments, and interactive entertainment applications.

#### Expand the DreamDEX Ecosystem
The project transforms DreamDEX from a self-contained exchange into a foundational protocol layer. Other builders can fork or reference this architecture to build prediction-powered racing games, fantasy leagues, and automated strategy duels.

#### Create a Sustainable Product or Use Case
* **Protocol Fee Revenue:** Battle escrow pools support a sustainable protocol rake (e.g. 2.5% fee on winning payouts) that generates ongoing treasury revenue.
* **Extensible Asset Meta:** The engine naturally expands as DreamDEX launches new Event Contract markets beyond BTC and ETH (e.g. SOL, gold, equities, esports).
* **Syndicate & Stable Ownership:** Future roadmap includes guild-owned combatants where multiple users co-own high-ranking beasts and split winnings automatically via smart contracts.

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
