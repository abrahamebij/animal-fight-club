import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Battle, CombatTurn, Beast, MarketPulse } from '@/lib/types';

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
    const bonus = pulse.modifier.percentageBonus / 100;
    if (pulse.modifier.stat === 'power') power = Math.round(power * (1 + bonus));
    if (pulse.modifier.stat === 'defense') defense = Math.round(defense * (1 + bonus));
    if (pulse.modifier.stat === 'speed') speed = Math.round(speed * (1 + bonus));
    if (pulse.modifier.stat === 'special') special = Math.round(special * (1 + bonus));
  }

  return { power, defense, speed, special };
}

/**
 * Calls Gemini API to generate LLM combat simulation
 */
async function generateGeminiCombatSimulation(battle: Battle): Promise<{ turns: CombatTurn[]; winner: 'beastA' | 'beastB' } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are the Apex Tactical Combat Reasoner for Animal Fight Club, an agentic Web3 arena on Somnia.
Two combatants are clashing in a turn-by-turn duel:
- Combatant A: ${battle.beastA.name} (Power: ${battle.beastA.stats.power}, Defense: ${battle.beastA.stats.defense}, Speed: ${battle.beastA.stats.speed}, Special: ${battle.beastA.stats.special}, Perks: ${battle.beastA.perks.join(', ')}, Market Modifier: ${battle.marketPulseA?.modifier?.description || 'UNBOUND'})
- Combatant B: ${battle.beastB.name} (Power: ${battle.beastB.stats.power}, Defense: ${battle.beastB.stats.defense}, Speed: ${battle.beastB.stats.speed}, Special: ${battle.beastB.stats.special}, Perks: ${battle.beastB.perks.join(', ')}, Market Modifier: ${battle.marketPulseB?.modifier?.description || 'UNBOUND'})

Simulate a thrilling 4 to 7 round combat encounter where each combatant starts with 100 HP.
Each turn must deplete one combatant's HP until exactly one reaches 0 HP.

Output ONLY a JSON object matching this exact TypeScript structure with no markdown backticks:
{
  "winner": "beastA" or "beastB",
  "turns": [
    {
      "turnNumber": 1,
      "actor": "beastA" or "beastB",
      "actionName": "UPPERCASE ACTION NAME",
      "damageDealt": number (between 14 and 34),
      "beastAHp": number (remaining HP for A, min 0),
      "beastBHp": number (remaining HP for B, min 0),
      "combatNarrative": "2 sentences describing the dramatic tactical attack and hit.",
      "reasoning": "1 sentence explaining why this tactical action was selected by the neural agent based on attributes and market pulse."
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
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    if (parsed.turns && Array.isArray(parsed.turns) && (parsed.winner === 'beastA' || parsed.winner === 'beastB')) {
      const turnsWithTimestamps = parsed.turns.map((t: CombatTurn, i: number) => ({
        ...t,
        timestamp: Date.now() + i * 1000,
      }));
      return {
        winner: parsed.winner,
        turns: turnsWithTimestamps,
      };
    }
  } catch (err) {
    console.warn('Gemini API call fallback to deterministic combat engine:', err);
  }

  return null;
}

/**
 * Deterministic tactical simulation engine fallback
 */
function simulateDeterministicCombat(battle: Battle): { turns: CombatTurn[]; winner: 'beastA' | 'beastB' } {
  const turns: CombatTurn[] = [];
  let hpA = 100;
  let hpB = 100;
  let turnNumber = 1;

  while (hpA > 0 && hpB > 0 && turnNumber <= 12) {
    const statsA = getEffectiveStats(battle.beastA, hpA, battle.marketPulseA);
    const statsB = getEffectiveStats(battle.beastB, hpB, battle.marketPulseB);

    const initiativeA = statsA.speed * 2 + Math.floor(Math.random() * 10);
    const initiativeB = statsB.speed * 2 + Math.floor(Math.random() * 10);

    const attackerSide: 'beastA' | 'beastB' = initiativeA >= initiativeB ? 'beastA' : 'beastB';
    const attacker = attackerSide === 'beastA' ? battle.beastA : battle.beastB;
    const defender = attackerSide === 'beastA' ? battle.beastB : battle.beastA;
    const atkStats = attackerSide === 'beastA' ? statsA : statsB;
    const defStats = attackerSide === 'beastA' ? statsB : statsA;
    const atkPulse = attackerSide === 'beastA' ? battle.marketPulseA : battle.marketPulseB;

    const actionIndex = (turnNumber + Math.floor(Math.random() * TACTICAL_ACTIONS.length)) % TACTICAL_ACTIONS.length;
    const action = TACTICAL_ACTIONS[actionIndex];

    const rawDamage = Math.round(
      (atkStats.power * 2.8 + atkStats.special * 1.2) * action.basePowerMultiplier - (defStats.defense * 1.2) + (Math.random() * 8)
    );
    const damageDealt = Math.max(14, Math.min(36, rawDamage));

    if (attackerSide === 'beastA') {
      hpB = Math.max(0, hpB - damageDealt);
    } else {
      hpA = Math.max(0, hpA - damageDealt);
    }

    const pulseContext = atkPulse?.modifier 
      ? `leveraging ${atkPulse.modifier.description}`
      : `capitalizing on base ${attacker.stats.power >= defender.stats.defense ? 'power superiority' : 'speed agility'}`;

    const reasoning = `Tactical neural core selected ${action.name} to maximize damage while ${pulseContext}.`;
    const narrative = action.narrativeTemplate(attacker.name, defender.name, damageDealt, reasoning);

    turns.push({
      turnNumber,
      actor: attackerSide,
      actionName: action.name,
      damageDealt,
      beastAHp: hpA,
      beastBHp: hpB,
      combatNarrative: narrative,
      reasoning,
      timestamp: Date.now() + turnNumber * 1000,
    });

    turnNumber++;
  }

  const winner: 'beastA' | 'beastB' = hpA > 0 ? 'beastA' : 'beastB';
  return { turns, winner };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { battleId, battle: clientBattle } = body as { battleId?: string; battle?: Battle };

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

    // 1. Try Gemini LLM first, falling back to deterministic combat engine
    const geminiResult = await generateGeminiCombatSimulation(battle);
    const { turns, winner } = geminiResult || simulateDeterministicCombat(battle);

    const winningBeast = winner === 'beastA' ? battle.beastA : battle.beastB;
    const losingBeast = winner === 'beastA' ? battle.beastB : battle.beastA;

    const resolvedBattle: Battle = {
      ...battle,
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
        });

        // Update Beast records
        const winBeastRef = doc(db, 'beasts', winningBeast.id);
        await updateDoc(winBeastRef, { 'record.wins': increment(1) });

        const loseBeastRef = doc(db, 'beasts', losingBeast.id);
        await updateDoc(loseBeastRef, { 'record.losses': increment(1) });
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
