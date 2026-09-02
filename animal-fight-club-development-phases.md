# Animal Fight Club — Phased Development Brief

**For:** Gemini (primary coding agent)
**Architecture:** Single Next.js app (frontend + backend/API routes together)
**Network:** Somnia Shannon testnet, chain ID `50312`

---

## Standing rules (apply to every phase, no exceptions)

- **No `pnpm run lint` or `pnpm run build` without explicit sign-off** from
  Abraham before running it.
- **No package installs without asking first** — confirm the exact package
  and version before running any `pnpm add` command.
- **If uncertain about any package's API surface (especially
  `@somnia-chain/markets-sdk`, `wagmi`, `viem`, or Firebase), search the
  official documentation before writing code.** Do not guess function
  signatures, especially anything touching the markets SDK — see the
  Gotchas doc excerpted in "Verified chain/SDK constants" below.
- **No re-deploy without explicit approval.**
- **Never invent contract addresses, RPC URLs, chain IDs, or ABI function
  names.** Every constant needed for this build is listed below, sourced
  directly from DreamDEX documentation. If a phase needs a constant not
  listed here, stop and ask rather than guessing.
- All `dreamDEX`/Event Contract interaction in this build is **read-only**.
  Do not implement `createOrder`, `mintSet`, `redeem`, or any write-path SDK
  call unless a future phase explicitly asks for it.

---

## Verified chain / SDK constants (do not modify without re-verifying)

**Somnia Shannon testnet:** chain ID `50312`, RPC `https://dream-rpc.somnia.network`

**Markets SDK:** `@somnia-chain/markets-sdk`, **version 0.28.0 or
newer required** — below 0.23.0 reads fail entirely (indexer schema
mismatch); below 0.28.0 float prices land off the tick grid. This build
only reads (`loadMarkets`, `listLiveBinaryMarkets`, `fetchOrderBook`,
`getMarketOnchain`), so the price-grid issue is unlikely to bite, but pin
0.28.0+ regardless. This package is already installed via `pnpm` — confirm
the installed version meets this floor before relying on it.

**Protocol core contracts (identical on testnet and mainnet, CREATE3):**

| Contract | Address |
|---|---|
| BinaryMarketsModule | `0x3ecC694Cef705358864a646142ac17A90E29e388` |
| MarketsCore | `0x2802504314685D89bF6C992CA5a8e7cC78bc0294` |
| BinarySettlement | `0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23` |
| OutcomeToken6909 | `0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9` |
| OracleHub | `0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b` |
| CollateralRouter | `0xbC0C9834B15ACE38bB50dDaa7d7f7C7CC4DC183C` |

**Never hardcode a per-market or pool address** — these are recycled across
windows. Always read `markets(marketId)` from the module registry or via
the SDK at runtime.

**Testnet collateral:** tUSDC at `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E`
(6 decimals) — irrelevant to this build since we never trade, but useful for
context if a phase needs to display a real market's pricing correctly
(mainnet USDso is 18 decimals — do not assume decimals, read them at
runtime or from the constant matching the network in use).

**Market lifecycle states (read `onchain.status`, not the indexer status —
it lags):**
`Listed (0) → Trading (1) → Locked (2) → Resolved (4) | Voided (5)`
Only `Trading (1)` markets should feed a live Market Pulse read. A
market that has moved to `Locked` or beyond should be treated as stale for
this purpose — pick the current live window for the asset instead.

**Symbol format example:** `"BTC-0-12AUG26-1600/USDso#YES"` — do not parse
this string for asset/interval; the SDK exposes `asset` and `intervalSec`
as typed fields on the market row per the Gotchas doc (#13). Read those
fields directly.

---

## Phase 0 — Shared schema & project scaffolding

**Goal:** Establish the Firestore schema and Next.js project shell before
any UI or logic work begins.

- Initialize Next.js app (confirm framework choices — App Router — with
  Abraham before scaffolding if not already decided)
- Firestore collections needed:
  - `beasts` — id, ownerAddress, name, description, avatarUrl, stats
    (power/defense/speed/special), perks (array), boundAsset
    (BTC/ETH/null), record (wins/losses), createdAt
  - `battles` — id, beastA, beastB, status (pending/live/completed),
    challengeAcceptedAt, bettingWindowClosesAt, marketPulseA,
    marketPulseB (the locked-in modifier per beast, once computed),
    combatLog (array of turn objects), winner, createdAt
  - `bets` — id, battleId, bettorAddress, beastPicked, amount, status
    (active/won/lost/refunded), placedAt
- Confirm Firebase project config with Abraham before writing any
  environment variable handling
- Core packages (`wagmi`, `@somnia-chain/markets-sdk`, `viem`,
  `@tanstack/react-query`, `firebase`, `react-icons`, `gsap`) are already
  installed via `pnpm` — confirm each is present and at a working version
  before use, rather than re-installing. A wallet-connect UI package
  (RainbowKit or ConnectKit) still needs to be chosen and installed with
  `pnpm add` — **ask before installing this one**, since it hasn't been
  decided yet.

**Sign-off required before Phase 1:** schema reviewed and approved,
packages installed and confirmed working (no lint/build run yet).

---

## Phase 1 — Scaffolding, navigation, design system

**Goal:** Stand up the shell all 7 pages will live in.

- Global layout: sticky nav (wordmark placeholder per Stitch Prompt 1 —
  logo asset to be swapped in once generated), footer
- Implement the two-tone design system as CSS variables/Tailwind theme:
  off-white `#FAFAF8`, charcoal `#0A0A0B`, amber (warning, scoped),
  red (danger, scoped) — no other colors in UI chrome anywhere
- Typography setup per the Stitch-generated design (confirm exact font
  choices against what Stitch actually output before hardcoding font
  imports)
- Routing shell for all 7 pages (Landing, Arena, Battle View, Beast
  Profile, Leaderboard, Create Beast, Dashboard) — placeholder content is
  fine at this stage, structure and nav is the goal
- Open browse/spectate confirmed working with no wallet connection
  required to view any page

**Sign-off required before Phase 2:** navigation and page shells reviewed.

---

## Phase 2 — Wallet connection & auth

**Goal:** Wallet connect gated correctly at both the route and action level
— required only for create, challenge, and bet activity, never for
browsing. Right now nothing enforces this: an unauthenticated user can
currently navigate to any route directly, including ones that should be
wallet-gated. This phase fixes that.

### Prompt for Gemini — route protection & permission rules

```
Animal Fight Club currently has no route protection — Create Beast and the
Dashboard are reachable by direct URL even without a connected wallet.
Implement proper gating across the whole app using the rules below. Do not
rely on hiding nav links alone; hiding a link does not stop someone from
typing the URL directly or refreshing on that route, so enforcement must
happen at the route/page level itself.

WALLET-GATED ROUTES (require a connected wallet to view at all):
- /create-beast
- /dashboard (My Beasts / Pending Challenges / My Bets)

If a user without a connected wallet navigates to either of these routes
directly (typed URL, refresh, back button, bookmark), do not render the
page content. Redirect them to a connect-wallet prompt or the landing page
with a connect-wallet call to action, and do not flash the protected
content before redirecting.

OPEN ROUTES (no wallet required to view):
- / (Landing)
- /arena
- /battle/[id] (both Pending and Live states)
- /beast/[id] (Beast Profile)
- /leaderboard

These remain fully viewable with no wallet connected. Do not add any wallet
check to these routes at the page level.

ACTION-LEVEL GATING (page is open, but a specific action within it requires
a wallet):
- "Challenge" action on a Beast Profile or Arena listing
- "Place Your Bet" action within Battle View (Pending state)

For these, the surrounding page renders normally for everyone. Only when
the user actually triggers the gated action (clicks Challenge or Place
Your Bet) should the app check wallet connection. If no wallet is
connected at that moment, intercept the action and show the connect-wallet
flow instead of proceeding — do not silently fail, and do not let the
action reach any backend call without a connected address.

LOGOUT WHILE ON A PROTECTED ROUTE
If a user is currently on a wallet-gated route (/create-beast or
/dashboard, or mid-way through a gated action) and their wallet
disconnects — whether by clicking disconnect, switching accounts in their
wallet extension, or the connection otherwise dropping — immediately
redirect them out of the protected route the same way as an unauthenticated
user hitting it directly. Do not leave stale protected content on screen
after disconnect. Treat "wallet just disconnected while on a gated route"
identically to "unauthenticated user tried to load a gated route."

IMPLEMENTATION NOTES
- Use wagmi's connection state (e.g. `useAccount`'s `isConnected`) as the
  single source of truth for gating decisions — do not maintain a separate
  parallel "logged in" flag that could drift out of sync with the actual
  wallet connection.
- This should work both for client-side navigation (clicking a nav link)
  and hard navigation (typing the URL, refreshing) — verify both cases
  explicitly, since a check that only runs on client-side route transitions
  will miss a direct page load.
- Confirm with Abraham which Next.js routing pattern to use for this
  (middleware-based redirect vs. a client-side guard component wrapping
  protected pages) before implementing, since this affects whether the
  check happens before or after the page's JavaScript loads.
```

### Permission matrix (for reference, not to be shown in-app)

| Action | Unauthenticated (no wallet) | Authenticated (wallet connected) |
|---|---|---|
| Browse Landing, Arena, Leaderboard | ✅ | ✅ |
| View any Beast Profile | ✅ | ✅ |
| View any Battle (Pending or Live) | ✅ | ✅ |
| View live odds / Market Pulse on a battle | ✅ | ✅ |
| Create a beast | ❌ (redirected to connect) | ✅ |
| View /dashboard (My Beasts, Pending Challenges, My Bets) | ❌ (redirected to connect) | ✅ |
| Challenge another beast | ❌ (action intercepted, prompted to connect) | ✅ — but only if they own the challenging beast |
| Accept/decline a challenge | ❌ | ✅ — only the challenged beast's owner |
| Place a bet on a pending battle | ❌ (action intercepted, prompted to connect) | ✅ — but NOT if they own either beast in that battle (owners cannot bet on their own matches, per the product rule already defined) |
| Disconnect wallet while on an open route (Landing/Arena/Battle/Profile/Leaderboard) | n/a | Stays on the page, page simply reverts to unauthenticated view/behavior |
| Disconnect wallet while on a protected route (/create-beast, /dashboard) or mid-action | n/a | Immediately redirected out, same as an unauthenticated user hitting that route directly |

- Wagmi config targeting Somnia Shannon testnet (chain ID `50312`, RPC
  `https://dream-rpc.somnia.network`) — confirm this RPC is still current
  by checking DreamDEX docs before hardcoding, since networks occasionally
  rotate endpoints
- Wallet-connect UI themed to match the two-tone system (this will require
  overriding the connector library's default theme — flag to Abraham if
  the chosen library makes this difficult)
- Connected-state handling: truncated address display, disconnect flow
- Route protection and action-level gating implemented exactly per the
  Gemini prompt above, including the logout-while-on-protected-route
  redirect behavior
- Owner-exclusion check for betting (beast owners cannot bet on their own
  battle) enforced at the action level, not just hinted at in copy

**Sign-off required before Phase 3:** wallet connect flow tested on
testnet, including: direct URL access to /create-beast and /dashboard
while disconnected (should redirect), disconnecting mid-session while on a
protected route (should redirect), and confirming open routes remain fully
browsable while disconnected.

---

## Phase 3 — Beast creation & market binding

**Goal:** Implement the Create Beast page per Stitch Prompt 4 + the Market
Binding addendum.

- Stat allocation UI wired to a real points-budget system (confirm the
  exact budget and stat ranges with Abraham if not already specified in
  the Stitch output)
- Perk selection wired to the perk data model
- Market binding selector (BTC / ETH / None) — this only stores a value on
  the beast document at this stage; it does not yet touch the markets SDK
  (that happens in Phase 5, at battle time)
- Write to Firestore `beasts` collection on confirm
- Beast Profile page (Stitch Prompt 5) — read-only display of a created
  beast, wired to real Firestore data

**Sign-off required before Phase 4:** beast creation flow tested
end-to-end (create → view on profile page).

---

## Phase 4 — Challenge flow & pending battle state

**Goal:** One beast can challenge another; a 1-hour pending window opens
with betting.

- Challenge modal/flow: select an opponent beast, send challenge
- Accept/decline handling for the challenged beast's owner
- On acceptance: create a `battles` document, status `pending`,
  `bettingWindowClosesAt` set to acceptance time + 1 hour
- Battle View Pending state (Stitch Prompt 3, State A) wired to real data:
  countdown timer, stat comparison, live odds panel
- Betting: spectators (addresses that are not either beast's owner) can
  place a bet on a pending battle — write to `bets` collection, funds
  handling per Phase 6 (escrow contract) rather than assumed here
- Arena page (Stitch Prompt 2) wired to real battle data across all three
  statuses

**Sign-off required before Phase 5:** challenge → pending window → betting
UI tested with mock/test data (escrow contract wiring can follow in Phase
6, this phase can use placeholder bet recording if the contract isn't
ready yet — confirm with Abraham).

---

## Phase 5 — Market Pulse integration (read-only DreamDEX SDK)

**Goal:** When a battle's pending window is active, read real Event
Contract odds for each bound beast's asset and compute the modifier.

- On battle pending-window start (or on page load while pending, whichever
  is more reliable — decide with Abraham), for each beast with a bound
  asset:
  - Use `exchange.client.listLiveBinaryMarkets` or `loadMarkets` to find
    the current live window for that asset (BTC or ETH)
  - **Gate on `onchain.status === 1` (Trading)** before reading — per the
    Gotchas doc, the indexer lags and a market that just locked should not
    be read as live
  - Read the order book via `fetchOrderBook` to get current Up probability
  - Compute a bounded, minor modifier from the odds (exact formula/range to
    be confirmed with Abraham — e.g. a modest Speed or Defense bump capped
    at a small fixed value, not a swingy multiplier)
  - Lock the computed modifier into the `battles` document
    (`marketPulseA`/`marketPulseB`) once the pending window closes, so it
    cannot be reread or changed after combat starts
- Market Pulse panel (Stitch Prompt 8 addendum) wired to display the real
  read and resulting effect
- Handle the no-binding case cleanly ("Unbound — no market edge")
- **If `@somnia-chain/markets-sdk` behaves differently than the Recipes/
  Gotchas docs describe, stop and re-check the docs rather than working
  around it with guesses** — this SDK has several documented sharp edges
  (indexer lag, tick/lot precision, pool recycling) and guessing here risks
  silent failures per Gotcha #2 (reverted writes that appear to succeed on
  older SDK versions — irrelevant to our read-only use, but a sign of how
  easy silent failure is in this SDK generally)

**Sign-off required before Phase 6:** Market Pulse tested against a real
live testnet market, confirmed the modifier locks correctly and doesn't
change after window close.

---

## Phase 6 — Combat engine (LLM-reasoned turns) & escrow

**Goal:** Live battle state with real LLM-reasoned combat, and the betting
escrow contract.

- Turn resolution: server-side (API route) call to an LLM given full battle
  state (both beasts' HP, stats, perks, locked Market Pulse modifier, turn
  history) — model choice and prompt design to be confirmed with Abraham
  separately, this brief only specifies the data contract, not the prompt
- Combat log written incrementally to the `battles` document as turns
  resolve
- Battle View Live state (Stitch Prompt 3, State B) wired to real combat
  log, HP bars depleting in real time
- Betting escrow: **this is Animal Fight Club's own contract, not a
  DreamDEX contract** — confirm with Abraham whether this is a simple
  Solidity contract deployed to Somnia testnet or a Firestore-tracked
  off-chain settlement for hackathon speed, since this materially changes
  scope and needs an explicit decision before building
- Settlement: on battle completion, resolve bets, update beast
  win/loss records, update leaderboard aggregates

**Sign-off required before Phase 7:** one full battle tested end-to-end,
challenge through settlement.

---

## Phase 7 — Leaderboard, dashboard, polish

**Goal:** Remaining pages, then pass over the whole build for consistency
and AI-slop screening.

- Leaderboard page (Stitch Prompt 6) — Top Beasts / Top Bettors, wired to
  real aggregate data
- Dashboard page (Stitch Prompt 7) — My Beasts, Pending Challenges, My Bets
- Hero loop video embedded into the Landing page hero placeholder once the
  Flow-generated asset is ready
- Logo asset swapped in for the wordmark placeholder once generated
- Full pass against the two-tone color rule — confirm no accent color has
  crept into any component across all 7 pages
- Empty/loading/error states checked on every page

**Sign-off required:** full walkthrough with Abraham before considering
the build demo-ready.

---

## Explicitly deferred / out of scope for this hackathon build

- Auto-matchmaking (UI shows "coming soon", no backend logic)
- AI-assisted beast creation (stat allocation is manual only)
- Any write-path DreamDEX SDK usage (trading, minting, redeeming) —
  strictly read-only throughout
- Assets beyond BTC/ETH for market binding
- Mobile client (web only, per product decision)