import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Battle, CombatTurn, Beast, MarketPulse } from '@/lib/types';
import { resolveBattleOnChain } from '@/lib/services/escrowService';

interface TacticalAction {
  name: string;
  type: 'attack' | 'special' | 'counter' | 'defense';
  basePowerMultiplier: number;
  narrativeTemplate: (attacker: string, defender: string, damage: number, reason: string) => string;
}

const TACTICAL_ACTIONS: TacticalAction[] = [
  {
    name: 'HYDRAULIC CRUSH',
    type: 'attack',
    basePowerMultiplier: 1.2,
    narrativeTemplate: (atk, def, dmg) => 
      `${atk} locks hydraulic servos and detonates a crushing forward blow into ${def}, shattering tactical plating for ${dmg} damage.`,
  },
  {
    name: 'PLASMA OVERCHARGE',
    type: 'special',
    basePowerMultiplier: 1.4,
    narrativeTemplate: (atk, def, dmg) => 
      `Channeling core energy, ${atk} releases a concentrated thermal burst that engulfs ${def}, inflicting ${dmg} catastrophic damage.`,
  },
  {
    name: 'COUNTER-KINETIC STRIKE',
    type: 'counter',
    basePowerMultiplier: 1.1,
    narrativeTemplate: (atk, def, dmg) => 
      `${atk} deflects an incoming charge and counters with extreme velocity, exploiting ${def}'s overextension for ${dmg} precision damage.`,
  },
  {
    name: 'SEISMIC GROUND POUND',
    type: 'attack',
    basePowerMultiplier: 1.25,
    narrativeTemplate: (atk, def, dmg) => 
      `${atk} drives reinforced appendages into the arena substrate, creating a kinetic shockwave that staggers ${def} for ${dmg} damage.`,
  },
  {
    name: 'TITANIUM RUSH',
    type: 'attack',
    basePowerMultiplier: 1.15,
    narrativeTemplate: (atk, def, dmg) => 
      `Exploiting pure speed advantage, ${atk} closes the distance instantly and delivers a series of reinforced impacts for ${dmg} damage.`,
  },
  {
    name: 'APEX OVERDRIVE',
    type: 'special',
    basePowerMultiplier: 1.5,
    narrativeTemplate: (atk, def, dmg) => 
      `${atk} triggers maximum combat overclocking, unleashing a relentless sequence that bypasses ${def}'s defensive barrier for ${dmg} massive damage.`,
  },
];

function getEffectiveStats(beast: Beast, currentHp: number, pulse?: MarketPulse | null) {
  let { power, defense, speed, special } = beast.stats;

  for (const perkId of beast.perks) {
    if (perkId === 'iron_hide') defense += 2;
    if (perkId === 'adrenaline_rush' && currentHp <= 40) speed += 3;
    if (perkId === 'frenzy' && currentHp <= 50) power += 3;
    if (perkId === 'titanium_claws') power += 2;
    if (perkId === 'kinetic_barrier') special += 2;
  }

  if (pulse?.modifier) {
    const bonus = pulse.modifier.percentageBonus !== undefined
      ? pulse.modifier.percentageBonus / 100
      : (pulse.modifier.value ?? 0) / 10;
    if (pulse.modifier.stat === 'power') power = Math.round(power * (1 + bonus));
    if (pulse.modifier.stat === 'defense') defense = Math.round(defense * (1 + bonus));
    if (pulse.modifier.stat === 'speed') speed = Math.round(speed * (1 + bonus));
    if (pulse.modifier.stat === 'special') special = Math.round(special * (1 + bonus));
  }

  return { power, defense, speed, special };

}

/**
 * Calls Gemini API to generate LLM combat simulation with strict turn alternation and dual-beast context
 */
async function generateGeminiCombatSimulation(battle: Battle): Promise<{ turns: CombatTurn[]; winner: 'beastA' | 'beastB' } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const statsA_init = getEffectiveStats(battle.beastA, 100, battle.marketPulseA);
  const statsB_init = getEffectiveStats(battle.beastB, 100, battle.marketPulseB);
  const initialActor: 'beastA' | 'beastB' = statsA_init.speed >= statsB_init.speed ? 'beastA' : 'beastB';
  const secondActor: 'beastA' | 'beastB' = initialActor === 'beastA' ? 'beastB' : 'beastA';

  const pulseDescA = battle.marketPulseA?.modifier?.description || 'UNBOUND (No market modifier)';
  const pulseDescB = battle.marketPulseB?.modifier?.description || 'UNBOUND (No market modifier)';

  const prompt = `You are the Apex Tactical Combat Reasoner for Animal Fight Club, an agentic Web3 arena on Somnia.
Simulate a turn-by-turn duel between two autonomous beasts:

COMBATANT A (beastA):
- Name: ${battle.beastA.name}
- Stats: Power ${statsA_init.power}, Defense ${statsA_init.defense}, Speed ${statsA_init.speed}, Special ${statsA_init.special}
- Active Perks: ${battle.beastA.perks.length > 0 ? battle.beastA.perks.join(', ') : 'None'}
- Locked Market Modifier: ${pulseDescA}

COMBATANT B (beastB):
- Name: ${battle.beastB.name}
- Stats: Power ${statsB_init.power}, Defense ${statsB_init.defense}, Speed ${statsB_init.speed}, Special ${statsB_init.special}
- Active Perks: ${battle.beastB.perks.length > 0 ? battle.beastB.perks.join(', ') : 'None'}
- Locked Market Modifier: ${pulseDescB}

CRITICAL RULES FOR COMBAT RESOLUTION:
1. STRICT TURN ALTERNATION: Possession of the turn MUST alternate strictly between combatants every single round.
   - Turn 1 actor: "${initialActor}" (${initialActor === 'beastA' ? battle.beastA.name : battle.beastB.name})
   - Turn 2 actor: "${secondActor}" (${secondActor === 'beastA' ? battle.beastA.name : battle.beastB.name})
   - Turn 3 actor: "${initialActor}"
   - Turn 4 actor: "${secondActor}"
   - (and so on until exactly one combatant reaches 0 HP).
   UNDER NO CIRCUMSTANCES should the same combatant take consecutive turns.

2. DUAL-BEAST MATCHUP REASONING: On each turn, the tactical reasoner must evaluate BOTH combatants' full current state:
   - The acting combatant's remaining HP, offensive stats, perks, and its OWN locked market modifier.
   - The defending combatant's remaining HP, defensive stats, and armor/perks.
   - Example: If Kurama is low on HP, the opponent presses advantage; if Lion Heart has a Defense buff, attacks face damage mitigation.

3. MARKET MODIFIER ISOLATION:
   - When beastA acts, ONLY apply beastA's locked modifier (${pulseDescA}).
   - When beastB acts, ONLY apply beastB's locked modifier (${pulseDescB}).
   - Never bleed beastA's modifier into beastB's actions or vice-versa.

4. HEALTH AND DAMAGE:
   - Both combatants start at 100 HP.
   - Each turn deals 7 to 15 damage (up to 18 on critical/special hits) to the DEFENDER's HP only.
   - Combat develops through a suspenseful, tactical duel typically lasting 9 to 15 turns until exactly one combatant's HP drops to 0.

Output ONLY a JSON object matching this exact structure with no markdown formatting:
{
  "winner": "beastA" or "beastB",
  "turns": [
    {
      "turnNumber": 1,
      "actor": "${initialActor}",
      "actionName": "UPPERCASE ACTION NAME",
      "damageDealt": number,
      "beastAHp": number,
      "beastBHp": number,
      "combatNarrative": "2 sentences describing attacker hitting defender with specific mechanical detail.",
      "reasoning": "1 sentence explaining why this tactical action was chosen based on both combatants' current HP and the acting combatant's own market pulse."
    }
  ]
}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    if (parsed.turns && Array.isArray(parsed.turns) && parsed.turns.length >= 2) {
      // Validate and enforce strict alternation on returned turns
      let valid = true;
      for (let i = 1; i < parsed.turns.length; i++) {
        if (parsed.turns[i].actor === parsed.turns[i - 1].actor) {
          valid = false;
          break;
        }
      }

      let finalTurns: CombatTurn[] = parsed.turns;
      if (!valid) {
        let curHpA = 100;
        let curHpB = 100;
        finalTurns = parsed.turns.map((t: CombatTurn, idx: number) => {
          const actor: 'beastA' | 'beastB' = idx % 2 === 0 ? initialActor : secondActor;
          const dmg = typeof t.damageDealt === 'number' && t.damageDealt > 0 ? t.damageDealt : 22;
          if (actor === 'beastA') {
            curHpB = Math.max(0, curHpB - dmg);
          } else {
            curHpA = Math.max(0, curHpA - dmg);
          }
          return {
            ...t,
            turnNumber: idx + 1,
            actor,
            damageDealt: dmg,
            beastAHp: curHpA,
            beastBHp: curHpB,
          };
        });
      }

      const last = finalTurns[finalTurns.length - 1];
      const determinedWinner: 'beastA' | 'beastB' = last.beastAHp > last.beastBHp ? 'beastA' : 'beastB';

      const turnsWithTimestamps = finalTurns.map((t: CombatTurn, i: number) => ({
        ...t,
        timestamp: Date.now() + i * 1000,
      }));

      return {
        winner: determinedWinner,
        turns: turnsWithTimestamps,
      };
    }
  } catch (err) {
    console.warn('Gemini API call fallback to deterministic combat engine:', err);
  }

  return null;
}

/**
 * Deterministic tactical simulation engine with strict turn alternation and dual-beast state evaluation
 */
function simulateDeterministicCombat(battle: Battle): { turns: CombatTurn[]; winner: 'beastA' | 'beastB' } {
  const turns: CombatTurn[] = [];
  let hpA = 100;
  let hpB = 100;
  let turnNumber = 1;

  // Faster combatant seizes initial initiative on Turn 1
  const statsA_init = getEffectiveStats(battle.beastA, 100, battle.marketPulseA);
  const statsB_init = getEffectiveStats(battle.beastB, 100, battle.marketPulseB);
  let currentAttacker: 'beastA' | 'beastB' = statsA_init.speed >= statsB_init.speed ? 'beastA' : 'beastB';

  while (hpA > 0 && hpB > 0 && turnNumber <= 24) {
    const statsA = getEffectiveStats(battle.beastA, hpA, battle.marketPulseA);
    const statsB = getEffectiveStats(battle.beastB, hpB, battle.marketPulseB);

    const attackerSide = currentAttacker;
    const attacker = attackerSide === 'beastA' ? battle.beastA : battle.beastB;
    const defender = attackerSide === 'beastA' ? battle.beastB : battle.beastA;
    const atkStats = attackerSide === 'beastA' ? statsA : statsB;
    const defStats = attackerSide === 'beastA' ? statsB : statsA;
    const atkHp = attackerSide === 'beastA' ? hpA : hpB;
    const defHp = attackerSide === 'beastA' ? hpB : hpA;
    const atkPulse = attackerSide === 'beastA' ? battle.marketPulseA : battle.marketPulseB;

    const actionIndex = (turnNumber + Math.floor(Math.random() * TACTICAL_ACTIONS.length)) % TACTICAL_ACTIONS.length;
    const action = TACTICAL_ACTIONS[actionIndex];

    const rawDamage = Math.round(
      (atkStats.power * 1.2 + atkStats.special * 0.5) * action.basePowerMultiplier - (defStats.defense * 0.55) + (Math.random() * 4)
    );
    const isCrit = action.basePowerMultiplier > 1.25 || Math.random() < (atkStats.special * 0.05);
    const damageDealt = isCrit 
      ? Math.max(10, Math.min(18, Math.round(rawDamage * 1.2)))
      : Math.max(7, Math.min(15, rawDamage));

    if (attackerSide === 'beastA') {
      hpB = Math.max(0, hpB - damageDealt);
    } else {
      hpA = Math.max(0, hpA - damageDealt);
    }

    // Contextual dual-beast reasoning: attacker state vs defender state + attacker's own market pulse
    let pulseContext = '';
    if (atkPulse?.modifier) {
      pulseContext = `leveraging ${atkPulse.modifier.description}`;
    } else {
      pulseContext = `channeling baseline kinetic power (Unbound — no market edge)`;
    }

    let matchupContext = '';
    if (defHp <= 35) {
      matchupContext = `exploiting ${defender.name}'s critical integrity (${defHp} HP remaining)`;
    } else if (defStats.defense > atkStats.power) {
      matchupContext = `overriding ${defender.name}'s fortified defense barrier`;
    } else {
      matchupContext = `pressing offensive tempo against ${defender.name}`;
    }

    const reasoning = `Tactical neural core selected ${action.name} to ${matchupContext} while ${pulseContext}.`;
    const narrative = action.narrativeTemplate(attacker.name, defender.name, damageDealt, reasoning);

    turns.push({
      turnNumber,
      actor: attackerSide,
      actionName: action.name,
      damageDealt,
      isCritical: action.basePowerMultiplier > 1.25 || Math.random() < (atkStats.special * 0.05),
      beastAHp: hpA,
      beastBHp: hpB,
      combatNarrative: narrative,
      reasoning,
      timestamp: Date.now() + turnNumber * 1000,
    });



    // STRICT ALTERNATION: possession flips to the opposing combatant for the next round
    currentAttacker = currentAttacker === 'beastA' ? 'beastB' : 'beastA';
    turnNumber++;
  }

  const winner: 'beastA' | 'beastB' = hpA > 0 ? 'beastA' : 'beastB';
  return { turns, winner };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { battleId, battle: clientBattle, callerAddress } = body as { 
      battleId?: string; 
      battle?: Battle; 
      callerAddress?: string;
    };

    let battle = clientBattle;

    if (!battle && battleId) {
      const snap = await getDoc(doc(db, 'battles', battleId));
      if (snap.exists()) {
        battle = snap.data() as Battle;
      }
    }

    if (!battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    // Strict combatant owner authorization
    const ownerA = battle.beastA.ownerAddress?.toLowerCase();
    const ownerB = battle.beastB.ownerAddress?.toLowerCase();
    const normalizedCaller = callerAddress?.toLowerCase();

    if (ownerA && ownerB && normalizedCaller) {
      if (normalizedCaller !== ownerA && normalizedCaller !== ownerB) {
        return NextResponse.json(
          { error: 'Unauthorized: Only the owners of the combatants can trigger combat simulation.' },
          { status: 403 }
        );
      }
    }

    // 1. Try Gemini LLM first, falling back to deterministic combat engine
    const geminiResult = await generateGeminiCombatSimulation(battle);
    const { turns, winner } = geminiResult || simulateDeterministicCombat(battle);

    const winningBeast = winner === 'beastA' ? battle.beastA : battle.beastB;
    const losingBeast = winner === 'beastA' ? battle.beastB : battle.beastA;

    const winBeastRef = doc(db, 'beasts', winningBeast.id);
    const loseBeastRef = doc(db, 'beasts', losingBeast.id);

    const updatedWinningRecord = {
      wins: (winningBeast.record?.wins || 0) + 1,
      losses: winningBeast.record?.losses || 0,
    };
    const updatedLosingRecord = {
      wins: losingBeast.record?.wins || 0,
      losses: (losingBeast.record?.losses || 0) + 1,
    };

    const resolvedBeastA: Beast = {
      ...battle.beastA,
      record: winner === 'beastA' ? updatedWinningRecord : updatedLosingRecord,
    };
    const resolvedBeastB: Beast = {
      ...battle.beastB,
      record: winner === 'beastB' ? updatedWinningRecord : updatedLosingRecord,
    };

    const resolvedBattle: Battle = {
      ...battle,
      beastA: resolvedBeastA,
      beastB: resolvedBeastB,
      status: 'completed',
      winner,
      combatLog: turns,
    };

    // Update Firestore in background
    try {
      if (battle.id) {
        const battleDocRef = doc(db, 'battles', battle.id);
        await updateDoc(battleDocRef, {
          status: 'completed',
          winner,
          combatLog: turns,
          beastA: resolvedBeastA,
          beastB: resolvedBeastB,
        });

        // Update Beast records
        await updateDoc(winBeastRef, { 'record.wins': increment(1) });
        await updateDoc(loseBeastRef, { 'record.losses': increment(1) });

        // Resolve on-chain in escrow contract
        resolveBattleOnChain(battle.id, winner).catch((err) => {
          console.warn('On-chain escrow resolveBattle error:', err);
        });
      }
    } catch (err) {
      console.warn('Firestore battle settlement update error:', err);
    }

    return NextResponse.json({
      success: true,
      battle: resolvedBattle,
      winner,
      turns,
    });
  } catch (error) {
    console.error('Combat engine error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve combat turns' },
      { status: 500 }
    );
  }
}
