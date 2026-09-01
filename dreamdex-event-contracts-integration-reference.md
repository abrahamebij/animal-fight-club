# DreamDEX Event Contracts — Integration Reference for Gemini

**Purpose of this document:** You (Gemini) do not have DreamDEX's docs in
your training data — this hackathon and its SDK are recent. Everything
below is copied or closely paraphrased from the official DreamDEX developer
docs and verified directly by Abraham before being handed to you. Do not
supplement this with assumptions from general Web3/prediction-market
knowledge — DreamDEX's Event Contracts have specific, sometimes
counterintuitive mechanics (documented in the Gotchas section below) that
differ from a typical prediction-market implementation.

**Scope reminder:** Animal Fight Club uses this integration **read-only**.
We never place orders, mint sets, or redeem positions. We only discover
live markets and read their order books to compute a combat modifier. Any
code path that writes to these contracts is out of scope — if you find
yourself implementing `createOrder`, `mintSet`, `trader.placeOrder`, or
`redeem`, stop, because that means the read-only scope has been
misunderstood somewhere.

---

## 1. What Event Contracts actually are

Event Contracts are **Up/Down markets on crypto asset prices**, not a
general-purpose custom-market primitive. There is no function to create an
arbitrary market (e.g. "will Beast A beat Beast B") — markets are BTC/ETH
price windows on fixed cadences (15-minute and 1-hour today), created and
scheduled by the venue itself.

**How one resolves:** each market has an opening price (recorded when the
window starts) and a closing price (recorded when the window ends). If the
closing price is at or above the opening price, "Up" wins; otherwise "Down"
wins. Every winning contract redeems for exactly 1 USDso (or 1 tUSDC unit
equivalent on testnet); losing contracts redeem for 0. This is why we can
only use these markets as a **data source** (their live odds), never as the
actual resolution mechanism for a beast battle — there's no way to create a
"BeastA-vs-BeastB" market on this venue.

---

## 2. The developer surface: `@somnia-chain/markets-sdk`

This is the only supported way to interact with Event Contracts
programmatically. There is **no REST/HTTP API for event contracts** — the
HTTP API covers spot markets only. Everything for Event Contracts goes
through this TypeScript SDK.

### Install

Already installed in this project via `pnpm`. Confirm the installed
version satisfies the floor below before relying on it.

**Version requirement: 0.28.0 or newer.** Two hard floors:
- Below **0.23.0**: reads fail entirely. The indexer dropped a column
  (`longOpenInterest`) that older SDK versions still query for, so
  `loadMarkets` and `listBinaryMarkets` both fail outright.
- Below **0.28.0**: an ordinary float price lands off the venue's tick
  grid and gets rejected. This mainly matters for order placement, which we
  are not doing, but pin 0.28.0+ regardless since it's the documented safe
  floor.

Run examples with a TypeScript runner (`tsx`) if testing snippets outside
the Next.js app directly.

### Initializing the client

```ts
import { SomniaMarkets, isBinaryMarket } from "@somnia-chain/markets-sdk";

const exchange = new SomniaMarkets({
  indexerUrl,   // DreamDEX indexer endpoint — confirm current value with Abraham/docs before hardcoding
  chain,        // Somnia Shannon testnet, chain ID 50312
  wsRpcUrl,     // websocket RPC — confirm current value before hardcoding
  addresses,    // contract addresses — see section 4 below, do not invent these
  privateKey,   // NOT NEEDED for read-only usage in most cases — confirm whether
                // read calls require a signer at all before assuming one is needed;
                // many read methods likely work with just indexerUrl/chain/rpc
});
```

**Do not hardcode `indexerUrl` or `wsRpcUrl` without confirming the current
values from DreamDEX's docs first** — these were not provided in the
material handed to you, and guessing them will silently break the
integration. Ask Abraham to pull these specific values if they aren't
already in your context.

---

## 3. The three SDK tiers

| Tier | Access via | What it's for |
|---|---|---|
| Unified | `exchange.*` | Trading by symbol in human units (buy/sell/cancel). **Not used in this build** — we're read-only. |
| Client (reads) | `exchange.client.*` | On-chain truth: market status, order books, outcome balances. **This is the tier Animal Fight Club uses.** |
| Trader (writes) | `exchange.trader.*` | Low-level writes (place raw orders, redeem). **Not used in this build.** |

Everything Animal Fight Club needs lives in `exchange.client.*` and a
handful of unified read helpers (`fetchOrderBook`, `loadMarkets`).

---

## 4. Verified contract addresses (identical on testnet and mainnet)

The protocol core is deployed via CREATE3, so these addresses are the same
on both networks:

| Contract | Address |
|---|---|
| BinaryMarketsModule | `0x3ecC694Cef705358864a646142ac17A90E29e388` |
| MarketsCore | `0x2802504314685D89bF6C992CA5a8e7cC78bc0294` |
| BinarySettlement | `0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23` |
| OutcomeToken6909 | `0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9` |
| OracleHub | `0xe40db387cC98601Dd11bd634fF2f3AD5686dE32b` |
| CollateralRouter | `0xbC0C9834B15ACE38bB50dDaa7d7f7C7CC4DC183C` |

**Per-market and per-pool addresses are NOT in this table and must never be
hardcoded.** Every market window gets its own market contract, and pools
are recycled across successive windows of the same series (e.g. this
week's BTC 15-min window and next week's BTC 15-min window may share a pool
address at different points in time). Always read these at runtime via the
module registry (`markets(marketId)`) or the SDK — never cache or hardcode
a pool address as if it belongs permanently to one market.

**Collateral tokens (only relevant for context/display, we never move
these funds):**

| Network | Token | Address | Decimals |
|---|---|---|---|
| Mainnet | USDso | `0x00000022dA000002656c64D9eA6011ea952D008A` | 18 |
| Testnet | tUSDC | `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E` | 6 |

The two collateral tokens differ by a factor of 10^12 in decimals. If any
code ever displays or compares raw values from these markets, **derive the
decimal scale from the token's own `decimals()` at runtime, never from a
hardcoded constant** — a testnet-tuned constant silently mis-scales
everything on mainnet with no error thrown.

**Somnia Shannon testnet:** chain ID `50312`, RPC
`https://dream-rpc.somnia.network`.

---

## 5. Market lifecycle — read this before writing any status-gating logic

```
Listed (0) → Trading (1) → Locked (2) → Resolved (4) | Voided (5)
```

- **Listed (0):** deployed, not yet open for trading.
- **Trading (1):** the ONLY state where the market is "live" for our
  purposes. Only read odds from a market in this state.
- **Locked (2):** window ended, awaiting settlement price. No new activity.
- **Resolved (4):** winning side fixed, settled.
- **Voided (5):** no reliable settlement price was available; not relevant
  to a live odds read.

**Critical rule: always check the ON-CHAIN status, never the indexer's
reported status.** The indexer lags the chain by a few seconds. Reading the
indexer's status field for a "is this market live" check can give you a
stale answer — always call `exchange.client.getMarketOnchain(marketId)`
and check `onchain.status === 1` before treating a market as live and
reading its odds for the Market Pulse feature.

```ts
const onchain = await exchange.client.getMarketOnchain(marketId as `0x${string}`);
if (onchain.status !== 1) {
  // Not currently Trading — do not use this market's odds for a fresh
  // Market Pulse read. Either skip the modifier for this beast, or find
  // the next live window for the same asset.
}
```

---

## 6. Finding the current live market for an asset (BTC or ETH)

Use `listLiveBinaryMarkets`, which returns only currently-open windows,
already scoped to binary (Up/Down) markets — no need to filter out spot or
other market kinds.

```ts
const now = Date.now() / 1000;
const candidates = [];

for (const m of await exchange.client.listLiveBinaryMarkets({ limit: 50 })) {
  const onchain = await exchange.client.getMarketOnchain(m.marketId as `0x${string}`);
  if (onchain.status !== 1) continue;              // must be Trading

  const secondsLeft = Number(m.expiry) - now;
  if (secondsLeft < 300) continue;                 // skip windows about to close —
                                                     // per Gotcha #9, a window with
                                                     // only a few minutes left can
                                                     // lock between read and use

  candidates.push({ market: m, onchain, secondsLeft });
}
```

**Read the asset from typed fields, never by parsing the market's question
text or symbol string.** The market row exposes `asset` (e.g. `"BTC"` or
`"ETH"`) and `intervalSec` as typed fields directly — use those. Per
Gotcha #13, the human-readable question wording has changed multiple
times; a regex over question text will silently break on the next wording
change, while the typed fields have not changed.

For Animal Fight Club: filter `candidates` to the market whose `asset`
matches the beast's `boundAsset` (BTC or ETH), and prefer the one with the
most `secondsLeft` if there are multiple cadences live for the same asset,
so the read has maximum headroom before the window locks.

---

## 7. Reading live odds (the actual Market Pulse data)

```ts
const [up, down] = market.outcomes ?? [];
if (!up || !down) return;   // not a valid binary market, skip

const book = await exchange.fetchOrderBook(up.symbol, 5);
const bestBid = book.bids[0]?.[0];
const bestAsk = book.asks[0]?.[0];
```

**Prices are Up probabilities in the range (0, 1).** A price of `0.62`
means the market currently implies a 62% chance the asset closes the
window at or above its opening price. The Down side is always
`1 - upPrice` — there's no need to separately query the Down book, it's
the same book read from the other side.

For the Market Pulse feature, a reasonable approach is to use the midpoint
of `bestBid`/`bestAsk` (or just `bestAsk` if only one side has resting
liquidity) as "the current odds," then translate that into a small combat
modifier per the game-balance rule Abraham defines separately (see the
phases document, Phase 5 — the exact modifier formula is a product
decision, not specified here).

**Handle the no-liquidity case.** If `bestAsk` and `bestBid` are both
undefined, there's no resting liquidity yet on this window — treat this the
same as "no reliable read available" and either fall back to no modifier
for this beast, or try the next live window for the same asset.

---

## 8. Locking the modifier — why timing matters

Per the product decision already made: the Market Pulse modifier is
computed once, when the battle's own 1-hour pending window closes, and then
**locked into the battle document**. It is never re-read during combat.
This matters technically as well as for game design:

- Markets have their own independent lifecycle and expiry, separate from
  Animal Fight Club's battle pending window. A market read at the start of
  the battle's pending window may have moved to `Locked` by the time
  combat actually starts.
- Always re-check `onchain.status === 1` at the moment you compute and lock
  the modifier (i.e., right when the battle's pending window closes), not
  using a stale read from earlier.
- If the previously-tracked market has locked or expired by the time the
  battle's pending window closes, find the current live window for the
  same asset fresh (per section 6) rather than using a stale reference.

---

## 9. Gotchas specific to this SDK (read before implementing Phase 5)

These are documented, verified quirks of `@somnia-chain/markets-sdk`. Even
though Animal Fight Club only reads (doesn't write), several of these
affect read correctness:

1. **Indexer lag.** Always gate on-chain status before treating any read as
   current. Already covered above — worth repeating because it's the
   single most impactful gotcha for this build.
2. **`loadMarkets()` will not show settled markets.** Not relevant to
   Market Pulse (we only care about live markets), but relevant if any
   future feature wants to show "how did the market resolve" — use
   `listBinaryMarkets({ status: "Finalized" })` instead for that case.
3. **Pools are recycled across windows — never key any of your own state by
   pool address.** Key by `marketId` instead. This matters if Animal Fight
   Club ever caches "the current BTC market" — cache by `marketId`, and
   re-resolve which `marketId` is current each time you need it, don't
   assume a pool address stays bound to the same logical market.
4. **`getCandles` and `getFills` are keyed on pool, not market** — a single
   pool can carry many successive markets' worth of data. Not relevant to
   Market Pulse (we only need current order book, not historical candles),
   but worth knowing if a future feature wants price history.
5. **Symbol format looks parseable but isn't meant to be parsed.** Use
   typed fields (`asset`, `intervalSec`) as covered in section 6.

---

## 10. Auditing a resolution (optional, for transparency/credibility)

Each market row carries an `oracleQuestionId`. This links directly to a
public, auditable resolution trail:

```
https://prd.oracle.somnia.host/questions/{oracleQuestionId}?view=graph
```

This shows the on-chain question definition, every price source consulted,
the median calculation, and the resolution outcome. **Consider surfacing
this link in the Market Pulse panel** (e.g., a small "verify this odds
read" link) — it's a strong, genuine credibility signal for judges that
this isn't a fabricated number, and costs almost nothing to add since it's
just a link built from a field the SDK already returns.

---

## 11. What Gemini should NOT do

- Do not implement any write path (`createOrder`, `mintSet`, `burnSet`,
  `trader.placeOrder`, `redeem`) — this build never trades the real
  market.
- Do not hardcode any per-market or per-pool address.
- Do not parse market question text for asset/interval — use typed fields.
- Do not trust the indexer's status field for gating live-read decisions —
  always confirm via `getMarketOnchain`.
- Do not guess `indexerUrl` or `wsRpcUrl` — these specific values were not
  provided in this document; ask Abraham to supply them from DreamDEX's
  current docs before wiring up the `SomniaMarkets` client.
- Do not assume decimal scale (6 vs 18) — read from the token contract or
  use the correct constant for the network actually in use (testnet here).

---

## 12. Quick checklist for implementing Phase 5 (Market Pulse)

- [ ] `@somnia-chain/markets-sdk` installed at 0.28.0+
- [ ] `indexerUrl` / `wsRpcUrl` confirmed with Abraham, not guessed
- [ ] `SomniaMarkets` client initialized with the verified contract
      addresses from section 4
- [ ] Live market discovery filters to `asset` matching the beast's
      `boundAsset`, using typed fields not string parsing
- [ ] On-chain status (`getMarketOnchain`) checked before every read, not
      the indexer status
- [ ] Order book read via `fetchOrderBook`, midpoint or best-ask used as
      the odds signal
- [ ] No-liquidity case handled gracefully (falls back to no modifier)
- [ ] Modifier computed and locked into the `battles` document exactly
      once, at pending-window close, never re-read during combat
- [ ] No write-path SDK calls anywhere in this feature
