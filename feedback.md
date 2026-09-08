# Developer Feedback: Challenges, Bugs, and Lessons Learned

This document provides a comprehensive post-mortem of the engineering challenges, bugs, and protocol integration hurdles encountered during the development of **Animal Fight Club** for the Somnia x DreamDEX Event Contracts Hackathon.

---

## 1. Executive Summary

Building a real-time, gamified spectator layer over decentralized Event Contracts required bridging three distinct technical domains:
1. High-throughput on-chain settlement and escrow on Somnia Shannon Testnet.
2. Low-latency financial order book reads and execution using `@somnia-chain/markets-sdk` and the DreamDEX GraphQL Indexer.
3. Interactive 2D vector physics, turn animations, and deterministic replay state management using GSAP and Next.js 16.

Connecting these systems revealed subtle edge cases in testnet market lifecycles, SDK symbol conventions, and browser wallet standardizations. Below is a detailed breakdown of the challenges faced, root causes diagnosed, and solutions implemented.

---

## 2. DreamDEX Indexer & Event Contract Lifecycles

### Bug: "Window has locked or expired" Loop on Market Refresh

#### The Symptom
Users on the `/predictions` page were met with an error toast reading:
`"Window has locked or expired. Refresh for live windows."`
Even after clicking the manual "REFRESH WINDOWS" button, the page appeared to refresh, but submitting an order immediately failed with the exact same error message.

#### Root Cause Analysis
Investigating the API route (`/api/predictions/markets`) revealed a disconnect between the GraphQL query and the testnet environment:
* The query fetched markets with `order_by: { createdAtTimestamp: desc }, limit: 25` without filtering by the expiry timestamp (`expiry > nowSec`).
* Testnet market bots had generated dozens of short-duration (60s and 300s) test markets that had all expired over an hour prior.
* Because the 25 most recent markets had already expired, their on-chain contract status was `0` or `2` (not `1 - Trading`).
* The API's verification loop correctly rejected all 25 expired markets. With zero active markets found, it fell back to a hardcoded fallback list containing an old test market ID (`0x...1448c`).
* When the client called `getMarketOnchain("0x...1448c")`, the on-chain status was not active (`status !== 1`), throwing the error. Refreshing simply re-queried the same top 25 expired entries, creating an infinite failure loop.

#### The Solution
1. **Added Strict Expiry Gating to GraphQL:**
   The query was updated to filter for active binary markets with `expiry: { _gt: "${nowSec}" }` and `asset: { _in: ["BTC", "ETH"] }`, ordered by `expiry: asc`.
2. **Prioritized Earliest-Closing Active Windows:**
   This immediately surfaced the real, deployed active markets (e.g. `0x15778` for BTC and `0x15779` for ETH) with on-chain status `1` and active order books.
3. **Updated Fallbacks to Verified On-Chain Contracts:**
   Fallback configurations were updated to point to live deployed contracts rather than mock strings, ensuring resilient behavior even during testnet indexer blips.

---

## 3. SDK Outcome Symbol Format & Order Execution

### Challenge: Mismatch Between UI Symbols and SDK Registry

#### The Symptom
When calling `exchange.createOrder()` via `@somnia-chain/markets-sdk`, transactions failed with unhandled rejections or silent fallback drops.

#### Root Cause Analysis
The application initially passed custom UI-friendly symbols like `BTC/USDso-15M#YES` to `createOrder()`. However, the SDK's internal dictionary populated via `loadMarkets()` uses a strict date-and-strike naming convention derived from the contract metadata:
`{ASSET}-0-{DDMMMYY}/tUSDC#YES` (e.g., `BTC-0-08SEP26/tUSDC#YES`).

Because the passed symbol did not exist in the SDK's internal loaded market table, the order builder could not resolve the target pool or market outcome index.

#### The Solution
1. **Dynamic Symbol Resolution:**
   In `lib/services/predictionService.ts`, instead of passing static strings, we load markets via `await exchange.loadMarkets(false)` and locate the matching market record by `marketId`:
   ```typescript
   const sdkMarket = Object.values(loaded).find(
     (lm) => lm.info && (lm.info as { marketId?: string }).marketId?.toLowerCase() === market.marketId.toLowerCase()
   );
   const tradableSymbol = side === 'UP'
     ? (sdkMarket?.outcomes?.[0]?.symbol || market.upSymbol)
     : (sdkMarket?.outcomes?.[1]?.symbol || market.downSymbol);
   ```
2. **Robust Fallback Execution:**
   If the unified `createOrder` encounters a client-side routing issue, the service automatically falls back to invoking `placeBinaryOrder` directly against the on-chain Binary Pool contract via `walletClient.writeContract`, ensuring the user's order always executes.

---

## 4. GSAP 2D Vector Arena & Replay State Synchronization

### Challenge: Decoupling Live Battle Polling from Turn-by-Turn Replay

#### The Symptom
In the boxing arena (`/battle/[id]`), players can watch duels live or scrub back through turns at 1x, 2x, or 3x speed. During rapid testing, replaying earlier turns caused health bars to snap to 0%, knocked-out fighters to remain standing, or turn animations to overlap when live updates arrived from Firestore.

#### Root Cause Analysis
React component state updates (`activeBattle`) triggered by live listeners were colliding with internal GSAP animation timelines. When a turn was replayed, the component re-read the final match health instead of the historic turn health, creating visual desynchronization.

#### The Solution
* **Ref-Driven State Architecture:**
  Decoupled animation playback from React render cycles using mutable refs (`replayIntervalRef`, `prevReplayTurnNo`, `figARef`, `figBRef`, `aDeadRef`, `bDeadRef`).
* **Visual Snap-Back on Reset:**
  Implemented a dedicated `replayReset` dependency effect that clears all active GSAP tweens, snaps fighter SVG coordinates back to their respective corners (Red vs. Blue), resets health bar widths and color gradients to 100%, and replays turns sequentially from turn 0.
* **Dynamic Speed Multipliers:**
  Mapped 1x, 2x, and 3x controls to timeline `timeScale` adjustments (e.g. interval delay scaled from 1800ms down to 600ms), giving spectators seamless control over match pacing.

---

## 5. Web3 Multi-Wallet Provider Collisions (EIP-6963)

### Challenge: Injected Provider Conflicts & Missing Wallet Icons

#### The Symptom
Users with multiple browser extensions installed (e.g., MetaMask, Coinbase Wallet, Phantom, Rabby) experienced connector hijacking where clicking one wallet prompted another, or displayed generic placeholder icons in the modal.

#### Root Cause Analysis
Legacy `window.ethereum` injection patterns overwrite the global provider variable when multiple wallet extensions are active. Additionally, standard Wagmi connectors frequently omit icon assets or return arbitrary Base64 data URIs.

#### The Solution
* **EIP-6963 Integration:**
  Migrated connector discovery to Wagmi's multi-injected provider discovery, allowing the application to distinguish between distinct wallet providers simultaneously without collision.
* **Universal Vector Icon Registry (`@web3icons/react`):**
  Constructed a dedicated registry (`components/wallet/walletRegistry.tsx`) mapping over 25 major Web3 wallets to official SVG vector icons, complete with dark-theme background backings and graceful fallbacks for unmapped injected connectors.

---

## 6. Next.js 16 (Turbopack) & Strict Compiler Rules

### Challenge: React 19 Compiler Strictness

#### The Symptom
During production build (`next build`) and ESLint checks, Next.js 16 with React 19 threw compilation errors regarding `react-hooks/set-state-in-effect` and unescaped HTML entities in modal templates.

#### Root Cause Analysis
The new React Compiler enforces strict rules against setting state directly inside `useEffect` when synchronizing server-fetched props, flagging potential infinite rendering loops.

#### The Solution
* **Functional State Updaters:**
  Refactored data synchronization in battle views to use functional updaters with entity ID and turn-length equality checks:
  ```typescript
  useEffect(() => {
    if (initialBattle && !isSimulating) {
      setActiveBattle((curr) => (
        curr?.id === initialBattle.id &&
        curr?.status === initialBattle.status &&
        curr?.combatLog?.length === initialBattle.combatLog?.length
          ? curr
          : initialBattle
      ));
    }
  }, [initialBattle, isSimulating]);
  ```
* **Linting & Entity Sanitization:**
  Replaced unescaped apostrophes with HTML entities (`&apos;`), eliminated unused imports across 16 files, and brought the entire codebase to **0 errors and 0 warnings** under strict ESLint 9 rules.

---

## 7. Developer Experience Feedback for Somnia & DreamDEX

Based on our implementation journey, we submit the following recommendations for future developer documentation and SDK improvements:

1. **GraphQL Indexer Documentation:**
   Providing pre-built GraphQL query snippets for active binary markets in the official docs—specifically emphasizing `expiry: { _gt: $now }`—would save developers significant debugging time during hackathons.
2. **SDK Outcome Symbol Helper:**
   Adding a utility method to `SomniaMarkets` such as `getMarketOutcomeSymbols(marketId)` would eliminate the need for manual symbol string construction or searching through `loadMarkets()`.
3. **Testnet Market Maker Health:**
   Ensuring automated market-making bots maintain rolling 15-minute and 1-hour active windows continuously on testnet prevents indexer downtime for teams testing outside core timezones.

---

## 8. Summary of Final Build Verification

| Verification Step | Command | Result |
|---|---|---|
| ESLint Verification | `pnpm lint` | 0 errors, 0 warnings across all components and hooks. |
| Production Build | `pnpm build` | Compiled successfully in Turbopack; 17/17 routes rendered. |
| On-Chain Escrow | Somnia Shannon | Match registration, STT wagering, and payouts verified on-chain. |
| DreamDEX Trading | Testnet tUSDC | Market discovery, order book ingestion, and IOC orders operational. |
