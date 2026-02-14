/*
  AI OPPONENT
  - Makes strategic decisions about unit spawning and tech upgrades
  - Balances aggression with economy
*/

import { GameState, Lane, UNIT_STATS, UnitType } from './gameTypes';
import { addToFormation, upgradeTechTier } from './gameEngine';

const AI_DECISION_INTERVAL = 2; // Make decisions every 2 seconds
const AI_GOLD_RESERVE = 50; // Keep this much gold in reserve

interface AIState {
  lastDecisionTime: number;
}

const aiState: AIState = {
  lastDecisionTime: 0,
};

export function updateAI(gameState: GameState): GameState {
  if (!gameState.isPlaying || gameState.isPaused || gameState.winner) {
    return gameState;
  }

  // Make decisions at intervals
  if (gameState.matchTime - aiState.lastDecisionTime < AI_DECISION_INTERVAL) {
    return gameState;
  }

  aiState.lastDecisionTime = gameState.matchTime;

  // Decision priority:
  // 1. Upgrade tech tier if affordable and beneficial
  // 2. Spawn units based on strategy

  // Check tech upgrade
  if (shouldUpgradeTech(gameState)) {
    gameState = upgradeTechTier(gameState, 'undead');
  }

  // Spawn units
  gameState = spawnUnits(gameState);

  return gameState;
}

function shouldUpgradeTech(gameState: GameState): boolean {
  const { aiGold, aiTechTier } = gameState;

  // Don't upgrade if already max tier
  if (aiTechTier >= 3) return false;

  // Upgrade to tier 2 if we have enough gold and it's mid-game
  if (aiTechTier === 1 && aiGold >= 250 && gameState.matchTime > 60) {
    return true;
  }

  // Upgrade to tier 3 if we have enough gold and it's late game
  if (aiTechTier === 2 && aiGold >= 500 && gameState.matchTime > 180) {
    return true;
  }

  return false;
}

function spawnUnits(gameState: GameState): GameState {
  const { aiGold, aiTechTier, aiUnits, playerUnits } = gameState;

  // Calculate available gold (keep reserve)
  const availableGold = aiGold - AI_GOLD_RESERVE;
  if (availableGold < 50) return gameState;

  // Count units in each lane
  const aiTopUnits = aiUnits.filter(u => u.lane === 'top' && !u.isDead).length;
  const aiBottomUnits = aiUnits.filter(u => u.lane === 'bottom' && !u.isDead).length;
  const playerTopUnits = playerUnits.filter(u => u.lane === 'top' && !u.isDead).length;
  const playerBottomUnits = playerUnits.filter(u => u.lane === 'bottom' && !u.isDead).length;

  // Determine which lane needs reinforcement
  const topPressure = playerTopUnits - aiTopUnits;
  const bottomPressure = playerBottomUnits - aiBottomUnits;

  let targetLane: Lane;
  if (topPressure > bottomPressure) {
    targetLane = 'top'; // Defend top lane
  } else if (bottomPressure > topPressure) {
    targetLane = 'bottom'; // Defend bottom lane
  } else {
    // Equal pressure, alternate lanes
    targetLane = Math.random() > 0.5 ? 'top' : 'bottom';
  }

  // Choose unit type based on tech tier and strategy
  const unitType = chooseUnitType(gameState, availableGold);
  if (!unitType) return gameState;

  // Add unit to formation
  return addToFormation(gameState, unitType, 'undead', targetLane);
}

function chooseUnitType(gameState: GameState, availableGold: number): UnitType | null {
  const { aiTechTier, matchTime } = gameState;

  // Get available units for current tech tier
  const availableUnits: UnitType[] = [];

  if (aiTechTier >= 1) {
    availableUnits.push('zombie', 'skeleton');
  }
  if (aiTechTier >= 2) {
    availableUnits.push('ghoul', 'necromancer');
  }
  if (aiTechTier >= 3) {
    availableUnits.push('catapult');
  }

  // Filter by affordability
  const affordableUnits = availableUnits.filter(
    unitType => UNIT_STATS[unitType].cost <= availableGold
  );

  if (affordableUnits.length === 0) return null;

  // Strategy: Early game - spam cheap units, late game - mix of units
  if (matchTime < 120) {
    // Early game: prefer zombies (cheap melee)
    return affordableUnits.includes('zombie') ? 'zombie' : affordableUnits[0];
  } else if (matchTime < 300) {
    // Mid game: mix of melee and ranged
    const weights: Record<string, number> = {
      zombie: 2,
      skeleton: 3,
      ghoul: 2,
      necromancer: 1,
      catapult: 1,
    };

    const weightedUnits = affordableUnits.flatMap(unit =>
      Array(weights[unit] || 1).fill(unit)
    );

    return weightedUnits[Math.floor(Math.random() * weightedUnits.length)] as UnitType;
  } else {
    // Late game: prefer high-tier units
    if (affordableUnits.includes('catapult')) return 'catapult';
    if (affordableUnits.includes('ghoul')) return 'ghoul';
    if (affordableUnits.includes('necromancer')) return 'necromancer';
    return affordableUnits[affordableUnits.length - 1];
  }
}

export function resetAI() {
  aiState.lastDecisionTime = 0;
}
