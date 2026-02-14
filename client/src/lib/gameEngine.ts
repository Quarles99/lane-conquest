/*
  GAME ENGINE
  - Main game loop, combat resolution, unit movement
  - Runs at 60 FPS, updates all game state
*/

import { nanoid } from 'nanoid';
import {
  Faction,
  GAME_CONSTANTS,
  GameState,
  HERO_STATS,
  Hero,
  HeroType,
  Lane,
  Unit,
  UNIT_STATS,
  UnitType,
} from './gameTypes';
import { updateAI } from './aiOpponent';

export function createInitialGameState(): GameState {
  return {
    isPlaying: false,
    isPaused: false,
    matchTime: 0,
    winner: null,
    
    playerGold: 100,
    playerTechTier: 1,
    playerHero: createHero('paladin', 'human'),
    playerUnits: [],
    playerBuilding: {
      faction: 'human',
      health: GAME_CONSTANTS.BUILDING_MAX_HEALTH,
      maxHealth: GAME_CONSTANTS.BUILDING_MAX_HEALTH,
      isDead: false,
    },
    
    aiGold: 100,
    aiTechTier: 1,
    aiHero: createHero('deathknight', 'undead'),
    aiUnits: [],
    aiBuilding: {
      faction: 'undead',
      health: GAME_CONSTANTS.BUILDING_MAX_HEALTH,
      maxHealth: GAME_CONSTANTS.BUILDING_MAX_HEALTH,
      isDead: false,
    },
    
    middleControlFaction: null,
    middleControlProgress: 0,
  };
}

function createHero(type: HeroType, faction: Faction): Hero {
  const stats = HERO_STATS[type];
  return {
    type,
    faction,
    level: 1,
    xp: 0,
    health: stats.baseHealth,
    maxHealth: stats.baseHealth,
    attack: stats.baseAttack,
    attackSpeed: stats.attackSpeed,
    abilities: [],
  };
}

export function spawnUnit(
  state: GameState,
  unitType: UnitType,
  faction: Faction,
  lane: Lane
): GameState {
  const stats = UNIT_STATS[unitType];
  const cost = stats.cost;
  
  // Check if player has enough gold
  if (faction === 'human') {
    if (state.playerGold < cost) return state;
    state.playerGold -= cost;
  } else {
    if (state.aiGold < cost) return state;
    state.aiGold -= cost;
  }
  
  const unit: Unit = {
    id: nanoid(),
    type: unitType,
    faction,
    lane,
    position: faction === 'human' ? 5 : 95,
    health: stats.health,
    maxHealth: stats.health,
    attack: stats.attack,
    attackSpeed: stats.attackSpeed,
    moveSpeed: stats.moveSpeed,
    range: stats.range,
    lastAttackTime: 0,
    target: null,
    isDead: false,
  };
  
  if (faction === 'human') {
    state.playerUnits.push(unit);
  } else {
    state.aiUnits.push(unit);
  }
  
  return state;
}

export function updateGameState(state: GameState, deltaTime: number): GameState {
  if (!state.isPlaying || state.isPaused || state.winner) return state;
  
  // Update match time
  state.matchTime += deltaTime;
  
  // Generate gold
  const goldGain = GAME_CONSTANTS.GOLD_PER_SECOND * deltaTime;
  state.playerGold += goldGain;
  state.aiGold += goldGain;
  
  // Bonus gold for middle control
  if (state.middleControlFaction === 'human') {
    state.playerGold += GAME_CONSTANTS.GOLD_BONUS_MIDDLE_CONTROL * deltaTime;
  } else if (state.middleControlFaction === 'undead') {
    state.aiGold += GAME_CONSTANTS.GOLD_BONUS_MIDDLE_CONTROL * deltaTime;
  }
  
  // Update middle control
  state = updateMiddleControl(state, deltaTime);
  
  // Update AI
  state = updateAI(state);
  
  // Move units
  state = moveUnits(state, deltaTime);
  
  // Combat
  state = resolveCombat(state, deltaTime);
  
  // Remove dead units
  state.playerUnits = state.playerUnits.filter(u => !u.isDead);
  state.aiUnits = state.aiUnits.filter(u => !u.isDead);
  
  // Check win condition
  if (state.playerBuilding.health <= 0) {
    state.winner = 'undead';
    state.playerBuilding.isDead = true;
  } else if (state.aiBuilding.health <= 0) {
    state.winner = 'human';
    state.aiBuilding.isDead = true;
  }
  
  return state;
}

function updateMiddleControl(state: GameState, deltaTime: number): GameState {
  // Count units near middle (position 45-55)
  const playerUnitsMiddle = state.playerUnits.filter(
    u => u.position >= 45 && u.position <= 55 && !u.isDead
  ).length;
  
  const aiUnitsMiddle = state.aiUnits.filter(
    u => u.position >= 45 && u.position <= 55 && !u.isDead
  ).length;
  
  const diff = playerUnitsMiddle - aiUnitsMiddle;
  
  if (diff > 0) {
    state.middleControlProgress += GAME_CONSTANTS.MIDDLE_CONTROL_SPEED * deltaTime;
  } else if (diff < 0) {
    state.middleControlProgress -= GAME_CONSTANTS.MIDDLE_CONTROL_SPEED * deltaTime;
  }
  
  // Clamp progress
  state.middleControlProgress = Math.max(-100, Math.min(100, state.middleControlProgress));
  
  // Update control faction
  if (state.middleControlProgress >= 100) {
    state.middleControlFaction = 'human';
  } else if (state.middleControlProgress <= -100) {
    state.middleControlFaction = 'undead';
  } else {
    state.middleControlFaction = null;
  }
  
  return state;
}

function moveUnits(state: GameState, deltaTime: number): GameState {
  const allUnits = [...state.playerUnits, ...state.aiUnits];
  
  for (const unit of allUnits) {
    if (unit.isDead) continue;
    
    // Find enemies in same lane
    const enemies = allUnits.filter(
      u => u.faction !== unit.faction && u.lane === unit.lane && !u.isDead
    );
    
    // Find closest enemy
    let closestEnemy: Unit | null = null;
    let closestDistance = Infinity;
    
    for (const enemy of enemies) {
      const distance = Math.abs(unit.position - enemy.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }
    
    if (closestEnemy) {
      // Move towards enemy if out of range
      if (closestDistance > unit.range) {
        const direction = unit.faction === 'human' ? 1 : -1;
        unit.position += direction * unit.moveSpeed * deltaTime;
        unit.position = Math.max(0, Math.min(100, unit.position));
        unit.target = null;
      } else {
        // In range, set target
        unit.target = closestEnemy.id;
      }
    } else {
      // No enemies, move to enemy base
      const direction = unit.faction === 'human' ? 1 : -1;
      unit.position += direction * unit.moveSpeed * deltaTime;
      unit.position = Math.max(0, Math.min(100, unit.position));
      unit.target = null;
      
      // Attack enemy building if reached
      if (unit.faction === 'human' && unit.position >= 95) {
        if (state.matchTime - unit.lastAttackTime >= 1 / unit.attackSpeed) {
          state.aiBuilding.health -= unit.attack;
          unit.lastAttackTime = state.matchTime;
        }
      } else if (unit.faction === 'undead' && unit.position <= 5) {
        if (state.matchTime - unit.lastAttackTime >= 1 / unit.attackSpeed) {
          state.playerBuilding.health -= unit.attack;
          unit.lastAttackTime = state.matchTime;
        }
      }
    }
  }
  
  return state;
}

function resolveCombat(state: GameState, deltaTime: number): GameState {
  const allUnits = [...state.playerUnits, ...state.aiUnits];
  
  for (const unit of allUnits) {
    if (unit.isDead || !unit.target) continue;
    
    const target = allUnits.find(u => u.id === unit.target);
    if (!target || target.isDead) {
      unit.target = null;
      continue;
    }
    
    // Check if can attack
    const timeSinceLastAttack = state.matchTime - unit.lastAttackTime;
    const attackCooldown = 1 / unit.attackSpeed;
    
    if (timeSinceLastAttack >= attackCooldown) {
      // Deal damage
      target.health -= unit.attack;
      unit.lastAttackTime = state.matchTime;
      
      if (target.health <= 0) {
        target.isDead = true;
        unit.target = null;
        
        // Award XP to hero
        if (unit.faction === 'human') {
          state.playerHero.xp += GAME_CONSTANTS.XP_PER_KILL_BASE;
          state = checkHeroLevelUp(state, 'human');
        } else {
          state.aiHero.xp += GAME_CONSTANTS.XP_PER_KILL_BASE;
          state = checkHeroLevelUp(state, 'undead');
        }
      }
    }
  }
  
  return state;
}

function checkHeroLevelUp(state: GameState, faction: Faction): GameState {
  const hero = faction === 'human' ? state.playerHero : state.aiHero;
  
  while (hero.xp >= GAME_CONSTANTS.XP_PER_LEVEL && hero.level < GAME_CONSTANTS.MAX_HERO_LEVEL) {
    hero.xp -= GAME_CONSTANTS.XP_PER_LEVEL;
    hero.level += 1;
    
    const stats = HERO_STATS[hero.type];
    hero.maxHealth += stats.healthPerLevel;
    hero.health = hero.maxHealth;
    hero.attack += stats.attackPerLevel;
  }
  
  return state;
}

export function upgradeTechTier(state: GameState, faction: Faction): GameState {
  const currentTier = faction === 'human' ? state.playerTechTier : state.aiTechTier;
  const gold = faction === 'human' ? state.playerGold : state.aiGold;
  
  if (currentTier === 1) {
    if (gold >= GAME_CONSTANTS.TECH_TIER_2_COST) {
      if (faction === 'human') {
        state.playerGold -= GAME_CONSTANTS.TECH_TIER_2_COST;
        state.playerTechTier = 2;
      } else {
        state.aiGold -= GAME_CONSTANTS.TECH_TIER_2_COST;
        state.aiTechTier = 2;
      }
    }
  } else if (currentTier === 2) {
    if (gold >= GAME_CONSTANTS.TECH_TIER_3_COST) {
      if (faction === 'human') {
        state.playerGold -= GAME_CONSTANTS.TECH_TIER_3_COST;
        state.playerTechTier = 3;
      } else {
        state.aiGold -= GAME_CONSTANTS.TECH_TIER_3_COST;
        state.aiTechTier = 3;
      }
    }
  }
  
  return state;
}
