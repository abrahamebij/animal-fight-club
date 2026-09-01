# Animal Fight Club — Concept Note

**Hackathon:** Somnia × DreamDEX Event Contracts Hackathon
**Prize pool:** $5,000 USDso (grand-prize style, no sub-tracks/bounties to stack)
**Submission window:** 25 Aug – 8 Sep 2026
**Network:** Somnia Shannon testnet (chain ID `50312`)
**Repo owner:** @abrahamebij

---

## One-line pitch

Create an AI-agent "beast," challenge another to a live, LLM-reasoned battle,
and let spectators bet on the outcome — while real DreamDEX Event Contract
market odds give each beast a genuine, auditable edge going into the fight.

---

## The problem this solves

Prediction markets today are almost entirely about abstract financial events
— will an asset go up or down. That's precise, but it's not spectacle.
Animal Fight Club gives DreamDEX's Event Contract infrastructure a second
life as the invisible engine behind something legible and entertaining: a
live combat prediction market, where the thing being predicted (which beast
wins) is dramatized in real time, and the thing already being traded on
DreamDEX (BTC/ETH price direction) becomes a genuine mechanical input rather
than a spectator's separate, disconnected activity.

## Core loop

1. **Create a beast** — name, description, manual stat allocation (Power,
   Defense, Speed, Special) within a points budget, plus a small selection of
   special-ability perks. Optionally bind the beast to BTC or ETH.
2. **Challenge another beast** — direct challenge only (auto-matchmaking is
   shown in the UI as "coming soon" to signal roadmap without expanding
   hackathon scope).
3. **Pending window opens (1 hour)** — betting opens for spectators (not the
   two beast owners). During this window, the app reads the live DreamDEX
   Event Contract order book for each bound beast's asset and computes a
   temporary, modest combat modifier from the real Up/Down odds — visibly
   surfaced as a "Market Pulse" panel. This is a genuine SDK read, not a
   fabricated number, and it locks in when the window closes.
4. **Combat goes live** — turn-based, LLM-reasoned. Each turn, the model
   receives both beasts' current state (HP, stats, perks, market-derived
   modifier, battle history) and reasons out an action. This is genuinely
   agentic decision-making, not scripted or deterministic.
5. **Settlement** — combat resolves, the app's own escrow contract pays out
   spectator wagers on the winning beast, records update (win/loss,
   leaderboard).

## Why the DreamDEX integration is real, not decorative

Event Contracts on DreamDEX are fixed-schedule Up/Down markets on BTC/ETH
(15-min and 1-hour rolling windows), created and resolved by the venue
itself via oracle settlement — there is no user-created custom market
primitive. Given that, Animal Fight Club does not pretend to run beast-vs-
beast markets *as* Event Contracts (that would be a superficial rename of an
in-house escrow system, and judges familiar with the SDK would see through
it in seconds).

Instead, the app performs a genuine, verifiable **read** against the real
market: live order book odds via `fetchOrderBook`, gated on real on-chain
market status (per the SDK's Trading/Locked/Resolved lifecycle), translated
into a bounded, minor combat modifier. The beast's own stats and the LLM's
combat reasoning remain the actual determinant of the fight — the market
read is a genuine input, not the outcome mechanism. This keeps two things
true simultaneously: the core product (AI combat + spectator betting) stays
the distinctive, legible pitch, and the DreamDEX integration is technically
substantive rather than cosmetic.

Trading of the real Event Contract is intentionally **out of scope** —
spectators bet on beast outcomes only, via the app's own contract. The real
market is read-only. This keeps the integration surface honest and
achievable within the hackathon window rather than duplicating DreamDEX's
own trading UI.

## What makes a beast's "AI" real

Combat decisions are made by an LLM call per turn, given the full battle
state (both beasts' HP, stats, perks, active market modifier, and turn
history so far) and asked to choose and justify an action. This is the same
design discipline applied to the Salvus Dispatcher Reasoning Assistant: use
an LLM only where genuine multi-state reasoning is required, not by default.
A static formula could pick "attack" every turn — the point of using an LLM
here is that beast personality, perk timing, and battle-state awareness
produce genuinely varied, non-deterministic play.

## Judging fit

| Criterion | Weight | How this project addresses it |
|---|---|---|
| Innovation & Originality | 20% | Combat as a presentation layer over real market data is a genuinely new angle — not a reskinned swap clone or generic agent demo |
| Technical Implementation | 25% | Real `@somnia-chain/markets-sdk` integration (market discovery, on-chain status gating, order book reads), LLM-reasoned combat, custom escrow contract, Firebase-backed real-time state |
| UX & Design | 20% | Open browse/spectate with no wallet wall, two-tone disciplined design system, clear pending→live battle states, legible Market Pulse mechanic |
| Business & Ecosystem Impact | 20% | Gives Event Contract data a second surface and audience beyond direct traders; a believable "why would this outlive the hackathon" story (prediction-market gamification is a real, recurring pattern — see Winning Patterns doc, Part 4, Web3/Crypto section) |
| Presentation & Demo | 15% | Money-shot candidate: countdown lock → Market Pulse reveal → live combat turn resolving, all in one continuous sequence |

## Deliberate scope cuts (hackathon window)

- Auto-matchmaking: UI-visible, disabled, "coming soon"
- Beast creation: fully manual stat allocation, no AI-assisted personality-to-
  stat translation
- Market binding: optional, BTC/ETH only, no other assets
- Real Event Contract: read-only, never traded in-app
- Perk system: a small, well-balanced set rather than a large roster (tight
  scope beats broad scope per hackathon-winning-patterns.md, Part 6)

## What happens after the hackathon (sustainability story)

More assets beyond BTC/ETH as DreamDEX adds Event Contract markets; auto-
matchmaking; a wider perk/stat meta as the beast roster grows; potential for
real Event Contract trading to be surfaced in-app as a follow-on integration
once the read-only mechanic is validated with real users.
