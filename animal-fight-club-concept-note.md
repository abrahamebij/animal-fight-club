# Animal Fight Club — Concept Note & Technical Architecture

**Hackathon:** Somnia × DreamDEX Event Contracts Hackathon  
**Prize Pool:** $5,000 USDso (Grand-Prize Track)  
**Submission Window:** 25 Aug – 8 Sep 2026  
**Target Network:** Somnia Shannon Testnet (Chain ID `50312`)  
**Escrow Contract Address:** `0x6e25F8863A2f3458F6F165A9dFe46522c0199187`  
**Repository:** `@abrahamebij/animal-fight-club`  

---

## 1. Executive Summary & One-Line Pitch

> **Animal Fight Club turns live crypto prediction markets into a high-stakes, spectator combat sport on Somnia Shannon.**

Players forge gladiatorial AI beasts bound to real-world crypto assets (BTC, ETH, SOL, STT). Real-time DreamDEX Event Contract market odds pump live modifiers directly into fighters' combat stats, spectators wager native STT in on-chain escrow pools, and an interactive 2D arena visualizes every punch, dodge, and knockout with sub-second finality.

---

## 2. The Problem & The Opportunity

| Traditional Prediction Markets | The Animal Fight Club Evolution |
|---|---|
| **Dry, financialized spreadsheets:** Static binary odds (Yes/No) that appeal only to hardcore DeFi traders. | **High-stakes spectacle:** Live market sentiment visualized as physical combat advantages inside an underground boxing arena. |
| **Disconnected spectators:** Users bet and wait hours or days for an oracle ping with zero engagement in between. | **Real-time drama:** 1-hour betting windows with a ticking countdown, dynamic "Market Pulse" stat buffs, and an interactive animated combat showdown with replay controls. |
| **Isolated liquidity:** Event contracts live in a silo away from gaming, NFTs, and social gambling ecosystems. | **Symbiotic utility:** Gives DreamDEX Event Contracts a native gamification layer—driving both trading volume and spectator wagering on Somnia. |

---

## 3. The Core Loop

```
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│  1. FORGE BEAST │ ───►  │  2. ARENA CHALLENGE  │ ───►  │ 3. 1-HR WAGER WINDOW │
│ Stats + Asset   │       │ PvP Duel Issued      │       │ STT Escrow + Pulse   │
└─────────────────┘       └──────────────────────┘       └──────────┬───────────┘
                                                                    │
┌─────────────────┐       ┌──────────────────────┐                  │
│ 5. ON-CHAIN PAY │ ◄───  │ 4. LIVE COMBAT ENGINE│ ◄────────────────┘
│ Escrow Claims   │       │ GSAP 2D Ring + Replay│
└─────────────────┘       └──────────────────────┘
```

1. **Forge a Combatant (`/create`):**
   - Allocate 260 stat points across **Power**, **Agility**, **Defense**, and **Special**.
   - Select Archetypes, Backstories, and bind the fighter to a market asset (`BTC`, `ETH`, `SOL`, or `SOMNIA`).
   - Choose from curated high-res visual presets or upload custom combatant avatars via integrated image hosting.
2. **Issue or Accept Arena Challenges (`/arena`):**
   - Direct PvP duels between players' beasts with instant challenge creation and acceptance modals.
3. **Pending Window & Market Pulse (`/battle/[id]`):**
   - A 1-hour countdown opens for spectator wagering in native STT tokens.
   - The app actively queries DreamDEX Event Contract order books via `@somnia-chain/markets-sdk`.
   - The live Up/Down odds dynamically calculate a transparent combat modifier (e.g. `+12% ATK / +8% DEF` during a BTC bull run), surfaced through a minimal green/red **Market Pulse** HUD.
4. **Live Combat Simulation & 2D Arena:**
   - Once the countdown closes, combat initiates through a deterministic tactical turn engine.
   - The custom **2D SVG Boxing Arena Ring** executes the duel turn-by-turn with GSAP animations: lunges, counters, critical hit screenshakes, HP bar color shifts, and brutal knockout collapses.
   - Spectators can watch live or review previous turns with interactive **1x / 2x / 3x speed replay controls**.
5. **On-Chain Settlement & Direct Predictions:**
   - The winner is declared and state is anchored to the Somnia Shannon Escrow contract.
   - Winning bettors claim proportional native STT payouts directly to their wallets.
   - Users can seamlessly bridge over to `/predictions` to trade the underlying DreamDEX event contracts with testnet tUSDC.

---

## 4. Technical Architecture

### A. Smart Contracts & Somnia Shannon Integration
* **Escrow Contract (`0x6e25F8863A2f3458F6F165A9dFe46522c0199187`):**
  - **`createBattleOnChain`**: Immutable on-chain match registration tracking combatant addresses and pool balances.
  - **`placeWagerOnChain`**: Non-custodial spectator pool wagering in native STT with zero middleman risk.
  - **`resolveBattleOnChain`**: Protocol-authenticated outcome settlement ensuring verified payouts.
  - **`claimPayoutOnChain`**: Trustless, push-to-claim proportional distribution of the total match pool to winners.
* **Low Latency & High Throughput:** Built natively on Somnia Shannon testnet (`chainId: 50312`, RPC: `https://dream-rpc.somnia.network`), taking full advantage of sub-second transaction speeds and ultra-low gas costs.

### B. DreamDEX Event Contracts SDK Integration
* **SDK Package:** `@somnia-chain/markets-sdk` + Viem.
* **Order Book Feeds:** Real-time polling via `fetchActiveEventMarkets` and `fetchOrderBook`.
* **Market Pulse Engine (`/api/market-pulse`):**
  - Extracts active market window status, best bids, and best asks.
  - Calculates implied probability `P(Up)` and converts it into balanced, bounded RPG modifiers.
  - Ensures market sentiment genuinely influences fight balance without breaking core stat viability.
* **Direct Prediction Trading Terminal (`/predictions`):**
  - Features real-time market event listings, tUSDC faucet claiming, rapid position taking (UP / DOWN), interactive order slips, and verifiable transaction receipts with block explorer links.

### C. GSAP 2D Arena Combat Ring
* **Custom SVG Boxing Arena:** Built entirely with responsive vector graphics, ring ropes, turnbuckles, colored corner posts (Red Corner vs. Blue Corner), dynamic shadows, and live battle badges.
* **Animation Sequence Pipeline:** GSAP timelines driving idle breathing states, attack strikes, recoil impacts, hit flashes, and knockout physics.
* **Turn Replay Engine:** Allows users to scrub turns, restart the playback, and toggle replay speed dynamically (1x, 2x, 3x) without desynchronizing state.

### D. Comprehensive Web3 Wallet Ecosystem
* **Universal Connector Registry:** Powered by `@web3icons/react` and Wagmi v2.
* **Direct Brand Mapping:** Over 25+ verified Web3 wallets (MetaMask, Coinbase Wallet, Phantom, Rainbow, Rabby, OKX, Brave, Zerion, Bitget, Trust, Exodus, etc.) mapped to pixel-perfect vector icons.
* **EIP-6963 Support:** Automatic discovery of multiple injected browser wallets with zero provider collision.

---

## 5. What Makes This Different

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANIMAL FIGHT CLUB STACK                         │
├────────────────────────────────────────────────────────────────────────┤
│ PRESENTATION LAYER: Brutalist Web3 UI + GSAP 2D Vector Boxing Ring     │
├────────────────────────────────────────────────────────────────────────┤
│ GAMING ENGINE:      Turn-Based Tactical Combat + Dynamic RPG Modifiers │
├────────────────────────────────────────────────────────────────────────┤
│ ORACLE / SDK:       DreamDEX Event Contracts Order Book (Market Pulse) │
├────────────────────────────────────────────────────────────────────────┤
│ SETTLEMENT LAYER:   Somnia Shannon On-Chain Escrow (STT Wagering)      │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Not a Reskinned Swap / Token Clone:** Instead of building another generic DEX UI, Animal Fight Club creates a completely new, consumer-facing entertainment vertical that consumes DreamDEX market data.
2. **Legitimate Market Read, Honest Scope:** We do not falsely claim to mint new oracle markets as tokens. We read real, active order books, derive verifiable sentiment, and anchor wagers into an audited escrow contract.
3. **Zero-Friction Spectating:** Anyone can view duels, inspect fighter profiles, test replays, and analyze market pulse without an immediate wallet wall. Connect only when ready to forge, challenge, or bet.

---

## 6. Hackathon Judging Matrix Alignment

| Judging Criterion | Weight | How Animal Fight Club Delivers |
|---|---|---|
| **Innovation & Originality** | **20%** | Blends financial prediction markets with turn-based tactical combat gaming. Event Contract data is transformed from numbers on a screen into living, breathing combat advantages. |
| **Technical Implementation** | **25%** | Full-stack implementation: Somnia Shannon on-chain escrow contracts (`viem`/`wagmi`), `@somnia-chain/markets-sdk` order book integration, GSAP timeline animation engine, Next.js 16 (Turbopack), and complete ESLint/TypeScript rigor (0 errors, 0 warnings). |
| **UX & Visual Polish** | **20%** | Cohesive brutalist cyberpunk design, custom fighter SVG boxing ring, instant preset selection modal, `@web3icons` wallet modal, responsive drawer bet slips, and strategic minimal green/red sentiment indicators. |
| **Business & Ecosystem Impact** | **20%** | Attracts non-traditional DeFi users and gamers to Somnia and DreamDEX. Serves as a repeatable blueprint for gamified event contracts, fantasy leagues, and esports prediction markets. |
| **Presentation & Completeness** | **15%** | Production-ready build with 17 static and dynamic routes compiled, interactive fight replays, automated faucet claiming, and an end-to-end user loop that works out of the box. |

---

## 7. What Was Built vs. Post-Hackathon Roadmap

### Shipped in this Hackathon Version:
- [x] On-chain Escrow contract deployed and integrated on Somnia Shannon testnet (`0x6e25...9187`).
- [x] Full Beast Forge with stat budgets, archetype tags, and preset avatar selector.
- [x] Direct PvP Arena challenges with real-time Firestore synchronization.
- [x] DreamDEX Event Contracts Market Pulse feed with live modifier calculation.
- [x] In-app `/predictions` terminal with live markets, testnet faucet, and order receipts.
- [x] Interactive 2D SVG boxing arena ring with GSAP combat animations and 1x/2x/3x replays.
- [x] Comprehensive leaderboards for Top Combatants and Top Bettors.
- [x] Full `@web3icons` connector suite with EIP-6963 support.

### Roadmap for Mainnet & Beyond:
1. **Automated Ranked Matchmaking:** Elo-based queue pairing fighters automatically when 1-hour windows open.
2. **Multi-Asset Event Contracts:** Expanding beyond BTC/ETH to index stocks, commodities, and esports as DreamDEX rolls them out.
3. **Syndicate / Stable Ownership:** Guilds co-owning rare combatant beasts with automated revenue-sharing splits from spectator prize pools.
4. **On-Chain Combat Log Attestations:** Storing fight hashes and combat log merkle roots directly on Somnia for permanent provenance.
