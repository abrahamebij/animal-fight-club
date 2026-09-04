# Animal Fight Club — Project Status & Handoff Brief

## 1. Project Overview & Architecture
**Animal Fight Club (AFC)** is an autonomous, on-chain AI combat arena built on **Somnia Shannon Testnet** (Chain ID `50312`).

### Core Pillars:
1. **Genetic Forge / Incubator (`/create`)**:
   - Users mint combat agents with custom stats (Power, Defense, Speed, Special out of a strict 20-point budget), 0–2 tactical perks, and optional binding to **DreamDEX** prediction market assets (`BTC`, `ETH`, or `UNBOUND`).
2. **DreamDEX Market Pulse**:
   - Connects live order book prediction odds (`BTC/USDso`, `ETH/USDso`) from DreamDEX smart contracts via `@somnia-chain/markets-sdk`.
   - Modifiers (e.g. `+15% Power` from Bullish Surge) dynamically augment fighter stats inside the combat simulation engine.
3. **Agentic Combat Reasoner (`/api/battle/resolve`)**:
   - Turn-by-turn LLM reasoning simulating tactical decisions using both combatants' full current attributes, HP, and market pulses.
4. **Pari-Mutuel Escrow Staking (`/battle/[id]`)**:
   - Spectator wagers are held in the Somnia Escrow contract (`0xc5b68a7a3282f66255aa5a11be165a1f817abbdc`).
   - 1-hour betting countdown window opens upon challenge acceptance.
   - Payout calculations: $Payout = Stake + \frac{Stake \times LosingPool}{WinningPool}$.
5. **Matchmaking & Challenges (`/arena`, `/dashboard`)**:
   - Beast owners can challenge other beasts in the Arena.
   - Incoming challenges appear in the **Challenge Control Matrix** on `/dashboard`, where the defender can **Accept** (which initializes the official battle document and opens the 1-hr escrow window) or **Decline**.

---

## 2. What Has Been Completed

### A. Modular Component Decomposition (< 300 LOC Rule)
Every single page in `app/` is strictly under 300 lines of code:
- `app/page.tsx`: **24 LOC** (split into `components/home/HeroSection`, `FeaturedLiveDuel`, `FeaturesSection`, `TopCombatantsSection`)
- `app/create-beast/page.tsx`: **30 LOC**
- `app/leaderboard/page.tsx`: **59 LOC** (split into `components/leaderboard/LeaderboardTabs`, `BeastsLeaderboardTable`, `BettorsLeaderboardTable`)
- `app/beast/[id]/page.tsx`: **82 LOC** (split into `components/beast/BeastProfileHeader`, `BeastStatsCard`, `BeastMatchHistory`)
- `app/arena/page.tsx`: **129 LOC** (split into `components/arena/ArenaFilterBar`, `ArenaBattleCard`, `ChallengeModal`)
- `app/battle/[id]/page.tsx`: **175 LOC** (split into `components/battle/BattleFighterCard`, `CombatLogFeed`, `MarketPulsePanel`, `SpectatorWageringPanel`)
- `app/create/page.tsx`: **227 LOC** (split into `components/create/StepIdentity`, `StepAttributes`, `StepPerks`, `StepDreamDex`)
- `app/dashboard/page.tsx`: **240 LOC** (includes `components/dashboard/DashboardChallengesPanel`)

### B. React Query Migration (`/hooks`)
All direct Firestore queries and contract reads are encapsulated into `@tanstack/react-query` hooks:
- `hooks/useBeasts.ts`: `useBeasts`, `useBeast(id)`, `useUserBeasts(address)`, `useCreateBeastMutation`
- `hooks/useBattles.ts`: `useBattles`, `useBattle(id)`, `useLiveBattle(id)`, `useUserBets(address)`, `useOnChainBattle`, `useOnChainWager`, `usePlaceBetMutation`, `useClaimPayoutMutation`
- `hooks/useBattleActions.ts`: `useBattleCombat`, `useBattleWager`
- `hooks/useChallenges.ts`: `useOpenChallenges`, `useUserChallenges(address)`, `useCreateChallengeMutation`, `useAcceptChallengeMutation`, `useDeclineChallengeMutation`
- `hooks/useLeaderboard.ts`: `useLeaderboardBeasts`, `useLeaderboardBettors`

### C. Combat Engine & Turn Alternation Bug Fix
- Fixed the previous issue where combat resolution loops failed to alternate turns.
- In `app/api/battle/resolve/route.ts`, the starting turn is determined once by initial Speed (`statsA_init.speed >= statsB_init.speed`), and possession strictly flips each turn (`currentAttacker = currentAttacker === 'beastA' ? 'beastB' : 'beastA'`).
- Both combatants' full current HP and states are supplied to the prompt context.

### D. Escrow Wagering & Restrictions
- **Strict On-Chain Confirmation**: Wagering now requires `receipt.status === 'success'` from viem/publicClient before committing the bet to Firestore.
- **Single Wager Rule**: Users cannot stack wagers or bet on both sides of the same duel (`CannotWagerOnBothSides`).
- **Owner Exclusion**: Combatant owners cannot wager on their own matches.
- **Only Owners Can Trigger AI Combat**: Combat execution button is strictly restricted to the 2 combatant owners.

### E. Challenge Control Matrix Restored
- Rebuilt `components/dashboard/DashboardChallengesPanel.tsx` with **Incoming** (with Accept & Decline buttons) and **Transmitted** tabs.

---

## 3. Things to Note & Traps to Avoid (Critical For Next Agent)

### ⚠️ 1. Firestore Security Rules Requirement
If the browser throws:
`FirebaseError: Missing or insufficient permissions. (lib/services/challengeService.ts)`
The user's Firebase Console rules for project `phrasal-method-457011-q8` must include the `challenges` collection. The required rules file is already drafted at `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /beasts/{beastId} { allow read, write: if true; }
    match /battles/{battleId} { allow read, write: if true; }
    match /bets/{betId} { allow read, write: if true; }
    match /challenges/{challengeId} { allow read, write: if true; }
    match /{document=**} { allow read, write: if true; }
  }
}
```

### ⚠️ 2. Strict Design Constraint: NO YELLOW
- The user has strictly demanded **NO YELLOW** colors anywhere on the UI.
- Use the monochrome ash-gray, black, white, and zinc palette (`bg-primary text-background`, `text-primary`, `border-divider`, `bg-surface-container-low`, `text-danger` for HP drops).

### ⚠️ 3. Page File Size Limit (< 300 LOC)
- Any page file under `app/` MUST NOT exceed 300 lines of code.
- If adding new UI features, build subcomponents under `components/<feature>/` and import them.

### ⚠️ 4. PowerShell Environment Note
- Running `npm run build` directly in PowerShell can trigger script execution policy errors.
- Run commands using `cmd /c "npm run build"` or `cmd /c "npx ..."` to bypass this. And dont run this till the user asks you to

### ⚠️ 5. Wagmi & Next.js 16.3.4 (Turbopack)
- Wagmi config is in `lib/config/wagmi.ts`.
- Somnia Shannon Testnet RPC: `https://dream-rpc.somnia.network` (Chain ID: `50312`).

## Hallucinated Issues Resolved

1. **Restored Video Animation on Landing Page**:
   - Replaced broken `/hero-beast.png` with `/hero-animation.mp4` (`<video autoPlay muted loop playsInline>`) in [`HeroSection.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/components/home/HeroSection.tsx).
   - Re-enabled GSAP timeline entrance animation for hero elements.
2. **Standardized Semantic Divider Classes & `#C7C6CA` Color**:
   - Cleaned up `.divider-ash`, `.border-ash`, and `.ash-divider` from [`globals.css`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/app/globals.css).
   - Enforced semantic `border-divider` (`#C7C6CA`) across headers, breadcrumbs, containers, tables, and dividers in [`Navbar.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/components/layout/Navbar.tsx), [`Footer.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/components/layout/Footer.tsx), [`app/dashboard/page.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/app/dashboard/page.tsx), [`DashboardChallengesPanel.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/components/dashboard/DashboardChallengesPanel.tsx), [`arena/page.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/app/arena/page.tsx), [`battle/[id]/page.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/app/battle/[id]/page.tsx), [`beast/[id]/page.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/app/beast/[id]/page.tsx), [`create/page.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/app/create/page.tsx), and [`leaderboard/page.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/app/leaderboard/page.tsx).
3. **Removed "UVW // XYZ" Copy Patterns**:
   - Simplified step and badge labels across the entire codebase to short and simple titles (`STEP 01 - IDENTITY`, `STEP 02 - STAT ALLOCATION`, `STEP 03 - TACTICAL PERKS`, `STEP 04 - MARKET PULSE`, `GENETIC FORGE`, and `SOMNIA SHANNON TESTNET - AGENTIC COMBAT PROTOCOL`).
4. **Verified Live Database Flow for Incoming Challenges**:
   - Ensured incoming challenges are pulled directly from Firestore with checksum-insensitive address matching (`getAddressVariants`).
   - Eliminated `localStorage` shadowing so the database is the primary source of truth.
5. **Responsive Mobile Navigation**:
   - Implemented a mobile hamburger toggle button (`FiMenu` / `FiX`) and slide-down drawer navigation overlay in [`Navbar.tsx`](file:///c:/Users/Abraham/Desktop/Projects/animal-fight-club/components/layout/Navbar.tsx).
   - Added backdrop overlay, auto-closing on route navigation, and escape-key dismissal.
   - Designed with touch targets adhering strictly to the brutalist monochrome palette (`#FAFAF8`, `#0A0A0B`, `#C7C6CA`).
