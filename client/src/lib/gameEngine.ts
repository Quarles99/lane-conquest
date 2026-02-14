/*
  GAME ENGINE
  - Main game loop, combat resolution, unit movement
  - Runs at 60 FPS, updates all game state
*/

import { nanoid } from 'nanoid';
import {
  Faction,
  FormationSlot,
  GAME_CONSTANTS,
  GameState,
  HERO_STATS,
  Hero,
  HeroAbility,
  HeroType,
  HeroUnit,
  Lane,
  Unit,
  UNIT_STATS,
  UnitType,
} from './gameTypes';
import { updateAI } from './aiOpponent';
import { AttackAnimationManager } from './attackAnimations';
import { soundSystem } from './soundSystem';

// Global animation manager
const animationManager = new AttackAnimationManager();

export function getAnimationManager() {
  return animationManager;
}

export function createInitialGameState(): GameState {
  return {
    isPlaying: false,
    isPaused: false,
    matchTime: 0,
    winner: null,
    gameOver: false,
    playerStats: {
      unitsKilled: 0,
      damageDealt: 0,
      goldEarned: 0,
      towersDestroyed: 0,
      heroLevel: 1,
    },
    aiStats: {
      unitsKilled: 0,
      damageDealt: 0,
      goldEarned: 0,
      towersDestroyed: 0,
      heroLevel: 1,
    },
    
    playerGold: 100,
    playerTechTier: 1,
    playerHero: createHero('paladin', 'human'),
    playerHeroUnit: null,
    playerHeroRespawnTime: 0,
    playerUnits: [],
    playerBuilding: {
      faction: 'human',
      health: GAME_CONSTANTS.BUILDING_MAX_HEALTH,
      maxHealth: GAME_CONSTANTS.BUILDING_MAX_HEALTH,
      attack: GAME_CONSTANTS.BUILDING_ATTACK,
      attackSpeed: GAME_CONSTANTS.BUILDING_ATTACK_SPEED,
      range: GAME_CONSTANTS.BUILDING_RANGE,
      lastAttackTime: 0,
      isDead: false,
    },
    playerTowers: [
      createTower('human', 'top', 20),
      createTower('human', 'bottom', 20),
    ],
    playerFormation: [],
    northLaneWaveTimer: GAME_CONSTANTS.WAVE_SPAWN_INTERVAL,
    southLaneWaveTimer: GAME_CONSTANTS.WAVE_SPAWN_INTERVAL + GAME_CONSTANTS.SOUTH_LANE_DELAY,
    heroWaveCounter: 0,
    playerGoldMines: 0,
    playerGoldMineCooldown: 0,
    
    aiGold: 100,
    aiTechTier: 1,
    aiHero: createHero('deathknight', 'undead'),
    aiHeroUnit: null,
    aiHeroRespawnTime: 0,
    aiUnits: [],
    aiBuilding: {
      faction: 'undead',
      health: GAME_CONSTANTS.BUILDING_MAX_HEALTH,
      maxHealth: GAME_CONSTANTS.BUILDING_MAX_HEALTH,
      attack: GAME_CONSTANTS.BUILDING_ATTACK,
      attackSpeed: GAME_CONSTANTS.BUILDING_ATTACK_SPEED,
      range: GAME_CONSTANTS.BUILDING_RANGE,
      lastAttackTime: 0,
      isDead: false,
    },
    aiTowers: [
      createTower('undead', 'top', 80),
      createTower('undead', 'bottom', 80),
    ],
    aiFormation: [],
    aiGoldMines: 0,
    aiGoldMineCooldown: 0,
    
    middleControlFaction: null,
    middleControlProgress: 0,
  };
}

function createTower(faction: Faction, lane: Lane, position: number) {
  return {
    id: nanoid(),
    faction,
    lane,
    position,
    health: GAME_CONSTANTS.TOWER_MAX_HEALTH,
    maxHealth: GAME_CONSTANTS.TOWER_MAX_HEALTH,
    attack: GAME_CONSTANTS.TOWER_ATTACK,
    attackSpeed: GAME_CONSTANTS.TOWER_ATTACK_SPEED,
    range: GAME_CONSTANTS.TOWER_RANGE,
    lastAttackTime: 0,
    isDead: false,
  };
}

function createHero(type: HeroType, faction: Faction): Hero {
  const stats = HERO_STATS[type];
  const abilities: HeroAbility[] = [];
  
  if (type === 'paladin') {
    abilities.push({
      id: 'heal',
      name: 'Divine Heal',
      cooldown: 20,
      lastUsed: -20,
      manaCost: 0,
      description: 'Heal nearby friendly units',
    });
  } else if (type === 'deathknight') {
    abilities.push({
      id: 'damage',
      name: 'Death Coil',
      cooldown: 15,
      lastUsed: -15,
      manaCost: 0,
      description: 'Deal massive damage to target',
    });
  }
  
  return {
    type,
    faction,
    level: 1,
    xp: 0,
    health: stats.baseHealth,
    maxHealth: stats.baseHealth,
    attack: stats.baseAttack,
    attackSpeed: stats.attackSpeed,
    abilities,
  };
}

function createHeroUnit(hero: Hero, lane: Lane): HeroUnit {
  const stats = HERO_STATS[hero.type];
  return {
    id: nanoid(),
    type: hero.type as UnitType,
    faction: hero.faction,
    lane,
    position: hero.faction === 'human' ? 10 : 90,
    health: hero.health,
    maxHealth: hero.maxHealth,
    attack: hero.attack,
    attackSpeed: hero.attackSpeed,
    moveSpeed: 4,
    range: 2,
    lastAttackTime: 0,
    target: null,
    isDead: false,
    heroType: hero.type,
    level: hero.level,
    xp: hero.xp,
    abilities: hero.abilities,
    isHero: true,
  };
}

function updateHeroSpawning(state: GameState, deltaTime: number): GameState {
  // Heroes don't spawn automatically - they spawn with waves
  // This function only handles death detection and cleanup
  
  // Check if player hero died
  if (state.playerHeroUnit && state.playerHeroUnit.isDead) {
    state.playerHeroUnit = null;
  }
  
  // Check if AI hero died
  if (state.aiHeroUnit && state.aiHeroUnit.isDead) {
    state.aiHeroUnit = null;
  }
  
  return state;
}

// Spawn heroes with waves (called from updateFormationSpawning)
function spawnHeroWithWave(state: GameState, lane: Lane): void {
  // Spawn player hero if not present (only spawn, don't change lane if already exists)
  if (!state.playerHeroUnit) {
    state.playerHeroUnit = createHeroUnit(state.playerHero, lane);
    if (state.matchTime > 1) {
      soundSystem.heroRespawn();
    }
  }
  
  // Spawn AI hero if not present (only spawn, don't change lane if already exists)
  if (!state.aiHeroUnit) {
    state.aiHeroUnit = createHeroUnit(state.aiHero, lane);
    if (state.matchTime > 1) {
      soundSystem.heroRespawn();
    }
  }
}

// Add unit to formation (hire once, spawns automatically)
export function addToFormation(
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
  
  const formationSlot: FormationSlot = {
    unitType,
    lane,
    isActive: true,
  };
  
  if (faction === 'human') {
    state.playerFormation.push(formationSlot);
  } else {
    state.aiFormation.push(formationSlot);
  }
  
  soundSystem.unitSpawn();
  
  return state;
}

// Internal function to spawn a unit from formation
function spawnUnitFromFormation(
  state: GameState,
  unitType: UnitType,
  faction: Faction,
  lane: Lane
): void {
  const stats = UNIT_STATS[unitType];
  
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
  
  soundSystem.unitSpawn();
}

// Update wave timers and spawn units in waves
function updateFormationSpawning(state: GameState, deltaTime: number): GameState {
  // Update north lane wave timer
  state.northLaneWaveTimer -= deltaTime;
  if (state.northLaneWaveTimer <= 0) {
    // Spawn heroes every other wave in north lane (even wave counter)
    if (state.heroWaveCounter % 2 === 0) {
      spawnHeroWithWave(state, 'top');
    }
    
    // Spawn all north lane units from both player and AI formations
    for (const slot of state.playerFormation) {
      if (slot.isActive && slot.lane === 'top') {
        spawnUnitFromFormation(state, slot.unitType, 'human', 'top');
      }
    }
    for (const slot of state.aiFormation) {
      if (slot.isActive && slot.lane === 'top') {
        spawnUnitFromFormation(state, slot.unitType, 'undead', 'top');
      }
    }
    
    state.northLaneWaveTimer = GAME_CONSTANTS.WAVE_SPAWN_INTERVAL;
    state.heroWaveCounter++;
  }
  
  // Update south lane wave timer
  state.southLaneWaveTimer -= deltaTime;
  if (state.southLaneWaveTimer <= 0) {
    // Spawn heroes every other wave in south lane (odd wave counter)
    if (state.heroWaveCounter % 2 === 1) {
      spawnHeroWithWave(state, 'bottom');
    }
    
    // Spawn all south lane units from both player and AI formations
    for (const slot of state.playerFormation) {
      if (slot.isActive && slot.lane === 'bottom') {
        spawnUnitFromFormation(state, slot.unitType, 'human', 'bottom');
      }
    }
    for (const slot of state.aiFormation) {
      if (slot.isActive && slot.lane === 'bottom') {
        spawnUnitFromFormation(state, slot.unitType, 'undead', 'bottom');
      }
    }
    
    state.southLaneWaveTimer = GAME_CONSTANTS.WAVE_SPAWN_INTERVAL;
  }
  
  return state;
}

export function updateGameState(state: GameState, deltaTime: number): GameState {
  // Update animations
  animationManager.update(deltaTime);
  if (!state.isPlaying || state.isPaused || state.winner) return state;
  
  // Create a shallow copy to avoid mutating the input
  state = { ...state };
  
  // Update match time
  state.matchTime += deltaTime;
  
  // Update formation spawning
  state = updateFormationSpawning(state, deltaTime);
  
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
  
  // Gold mine income
  state.playerGold += state.playerGoldMines * GAME_CONSTANTS.GOLD_MINE_INCOME * deltaTime;
  state.aiGold += state.aiGoldMines * GAME_CONSTANTS.GOLD_MINE_INCOME * deltaTime;
  
  // Update gold mine cooldowns
  if (state.playerGoldMineCooldown > 0) {
    state.playerGoldMineCooldown = Math.max(0, state.playerGoldMineCooldown - deltaTime);
  }
  if (state.aiGoldMineCooldown > 0) {
    state.aiGoldMineCooldown = Math.max(0, state.aiGoldMineCooldown - deltaTime);
  }
  
  // Track gold earned for stats
  const playerGoldThisFrame = (GAME_CONSTANTS.GOLD_PER_SECOND + 
    (state.middleControlFaction === 'human' ? GAME_CONSTANTS.GOLD_BONUS_MIDDLE_CONTROL : 0) +
    state.playerGoldMines * GAME_CONSTANTS.GOLD_MINE_INCOME) * deltaTime;
  const aiGoldThisFrame = (GAME_CONSTANTS.GOLD_PER_SECOND + 
    (state.middleControlFaction === 'undead' ? GAME_CONSTANTS.GOLD_BONUS_MIDDLE_CONTROL : 0) +
    state.aiGoldMines * GAME_CONSTANTS.GOLD_MINE_INCOME) * deltaTime;
  state.playerStats.goldEarned += playerGoldThisFrame;
  state.aiStats.goldEarned += aiGoldThisFrame;
  
  // Update middle control
  state = updateMiddleControl(state, deltaTime);
  
  // Update hero spawning and respawning
  state = updateHeroSpawning(state, deltaTime);
  
  // Update AI
  state = updateAI(state);
  
  // Move units
  state = moveUnits(state, deltaTime);
  
  // Combat
  state = resolveCombat(state, deltaTime);
  
  // Tower and building attacks
  state = resolveTowerAttacks(state, deltaTime);
  state = resolveBuildingAttacks(state, deltaTime);
  
  // Remove dead units
  state.playerUnits = state.playerUnits.filter(u => !u.isDead);
  state.aiUnits = state.aiUnits.filter(u => !u.isDead);
  
  // Check win condition
  if (state.playerBuilding.health <= 0 && !state.gameOver) {
    state.winner = 'undead';
    state.gameOver = true;
    state.playerBuilding.isDead = true;
    soundSystem.defeat();
  } else if (state.aiBuilding.health <= 0 && !state.gameOver) {
    state.winner = 'human';
    state.gameOver = true;
    state.aiBuilding.isDead = true;
    soundSystem.victory();
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
  const allUnits: (Unit | HeroUnit)[] = [
    ...state.playerUnits,
    ...state.aiUnits,
    ...(state.playerHeroUnit ? [state.playerHeroUnit] : []),
    ...(state.aiHeroUnit ? [state.aiHeroUnit] : []),
  ];
  
  // Cache units by lane for faster lookups
  const unitsByLane = {
    top: allUnits.filter(u => u.lane === 'top' && !u.isDead),
    bottom: allUnits.filter(u => u.lane === 'bottom' && !u.isDead),
  };
  
  for (const unit of allUnits) {
    if (unit.isDead) continue;
    
    // Get enemies in same lane (from cache)
    const laneUnits = unitsByLane[unit.lane];
    const enemies = laneUnits.filter(u => u.faction !== unit.faction);
    
    if (enemies.length === 0) {
      // No enemies, move to enemy base
      const direction = unit.faction === 'human' ? 1 : -1;
      unit.position += direction * unit.moveSpeed * deltaTime;
      unit.position = Math.max(0, Math.min(100, unit.position));
      unit.target = null;
      continue;
    }
    
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
        // In range, stop moving and set target (no gap-closing)
        unit.target = closestEnemy.id;
        // Don't move when in attack range
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
  const allUnits: (Unit | HeroUnit)[] = [
    ...state.playerUnits,
    ...state.aiUnits,
    ...(state.playerHeroUnit ? [state.playerHeroUnit] : []),
    ...(state.aiHeroUnit ? [state.aiHeroUnit] : []),
  ];
  
  // Create lookup map for faster target finding
  const unitMap = new Map<string, Unit | HeroUnit>();
  for (const unit of allUnits) {
    unitMap.set(unit.id, unit);
  }
  
  for (const unit of allUnits) {
    if (unit.isDead || !unit.target) continue;
    
    const target = unitMap.get(unit.target);
    if (!target || target.isDead) {
      unit.target = null;
      continue;
    }
    
    // Check if can attack
    const timeSinceLastAttack = state.matchTime - unit.lastAttackTime;
    const attackCooldown = 1 / unit.attackSpeed;
    
    if (timeSinceLastAttack >= attackCooldown) {
      // Create attack animation
      const isRanged = unit.range > 2;
      const projectileType = isRanged ? (unit.type === 'archer' || unit.type === 'skeleton' ? 'arrow' : 'magic') : 'melee';
      
      // Play attack sound
      if (projectileType === 'arrow') {
        soundSystem.arrowShot();
      } else if (projectileType === 'magic') {
        soundSystem.magicCast();
      } else {
        soundSystem.swordHit();
      }
      
      // Calculate positions (lane-based Y coordinate)
      const laneY = unit.lane === 'top' ? 25 : 75;
      const targetLaneY = target.lane === 'top' ? 25 : 75;
      
      animationManager.createProjectile(
        unit.position,
        laneY,
        target.position,
        targetLaneY,
        projectileType,
        unit.faction
      );
      
      // Deal damage
      const damageDealt = unit.attack;
      target.health -= damageDealt;
      unit.lastAttackTime = state.matchTime;
      
      // Track damage dealt
      if (unit.faction === 'human') {
        state.playerStats.damageDealt += damageDealt;
      } else {
        state.aiStats.damageDealt += damageDealt;
      }
      
      // Create hit effect
      animationManager.createEffect(target.position, targetLaneY, 'hit', target.faction);
      
      if (target.health <= 0) {
        target.isDead = true;
        unit.target = null;
        
        // Create death effect
        animationManager.createEffect(target.position, targetLaneY, 'death', target.faction);
        
        // Play death sound
        soundSystem.unitDeath();
        
        // Track kills
        if (unit.faction === 'human') {
          state.playerStats.unitsKilled++;
        } else {
          state.aiStats.unitsKilled++;
        }
        
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

function resolveTowerAttacks(state: GameState, deltaTime: number): GameState {
  const allTowers = [...state.playerTowers, ...state.aiTowers];
  const allUnits: (Unit | HeroUnit)[] = [
    ...state.playerUnits,
    ...state.aiUnits,
    ...(state.playerHeroUnit ? [state.playerHeroUnit] : []),
    ...(state.aiHeroUnit ? [state.aiHeroUnit] : []),
  ];
  
  for (const tower of allTowers) {
    if (tower.isDead) continue;
    
    // Find enemies in same lane within range
    const enemies = allUnits.filter(
      u => u.faction !== tower.faction && 
           u.lane === tower.lane && 
           !u.isDead &&
           Math.abs(u.position - tower.position) <= tower.range
    );
    
    if (enemies.length === 0) continue;
    
    // Attack closest enemy
    const closest = enemies.reduce((prev, curr) => {
      const prevDist = Math.abs(prev.position - tower.position);
      const currDist = Math.abs(curr.position - tower.position);
      return currDist < prevDist ? curr : prev;
    });
    
    const timeSinceLastAttack = state.matchTime - tower.lastAttackTime;
    const attackCooldown = 1 / tower.attackSpeed;
    
    if (timeSinceLastAttack >= attackCooldown) {
      // Create tower attack animation
      const laneY = tower.lane === 'top' ? 25 : 75;
      const targetLaneY = closest.lane === 'top' ? 25 : 75;
      
      animationManager.createProjectile(
        tower.position,
        laneY,
        closest.position,
        targetLaneY,
        'arrow',
        tower.faction
      );
      
      soundSystem.towerAttack();
      
      closest.health -= tower.attack;
      tower.lastAttackTime = state.matchTime;
      
      animationManager.createEffect(closest.position, targetLaneY, 'hit', closest.faction);
      
      if (closest.health <= 0) {
        closest.isDead = true;
        animationManager.createEffect(closest.position, targetLaneY, 'death', closest.faction);
        soundSystem.unitDeath();
      }
    }
  }
  
  // Remove dead towers and award gold
  const playerTowersDestroyed = state.playerTowers.filter(t => t.isDead).length;
  const aiTowersDestroyed = state.aiTowers.filter(t => t.isDead).length;
  
  if (playerTowersDestroyed > 0) {
    state.aiGold += playerTowersDestroyed * GAME_CONSTANTS.TOWER_DESTROY_REWARD;
    state.aiStats.towersDestroyed += playerTowersDestroyed;
    state.aiStats.goldEarned += playerTowersDestroyed * GAME_CONSTANTS.TOWER_DESTROY_REWARD;
  }
  if (aiTowersDestroyed > 0) {
    state.playerGold += aiTowersDestroyed * GAME_CONSTANTS.TOWER_DESTROY_REWARD;
    state.playerStats.towersDestroyed += aiTowersDestroyed;
    state.playerStats.goldEarned += aiTowersDestroyed * GAME_CONSTANTS.TOWER_DESTROY_REWARD;
  }
  
  state.playerTowers = state.playerTowers.filter(t => !t.isDead);
  state.aiTowers = state.aiTowers.filter(t => !t.isDead);
  
  return state;
}

function resolveBuildingAttacks(state: GameState, deltaTime: number): GameState {
  const allUnits: (Unit | HeroUnit)[] = [
    ...state.playerUnits,
    ...state.aiUnits,
    ...(state.playerHeroUnit ? [state.playerHeroUnit] : []),
    ...(state.aiHeroUnit ? [state.aiHeroUnit] : []),
  ];
  
  // Player building attacks
  if (!state.playerBuilding.isDead) {
    const enemies = allUnits.filter(
      u => u.faction === 'undead' && 
           !u.isDead &&
           u.position <= state.playerBuilding.range
    );
    
    if (enemies.length > 0) {
      const closest = enemies.reduce((prev, curr) => 
        curr.position < prev.position ? curr : prev
      );
      
      const timeSinceLastAttack = state.matchTime - state.playerBuilding.lastAttackTime;
      const attackCooldown = 1 / state.playerBuilding.attackSpeed;
      
      if (timeSinceLastAttack >= attackCooldown) {
        // Building attack animation
        const targetLaneY = closest.lane === 'top' ? 25 : 75;
        
        animationManager.createProjectile(
          5,
          50,
          closest.position,
          targetLaneY,
          'magic',
          'human'
        );
        
        soundSystem.towerAttack();
        
        closest.health -= state.playerBuilding.attack;
        state.playerBuilding.lastAttackTime = state.matchTime;
        
        animationManager.createEffect(closest.position, targetLaneY, 'hit', closest.faction);
        
        if (closest.health <= 0) {
          closest.isDead = true;
          animationManager.createEffect(closest.position, targetLaneY, 'death', closest.faction);
          soundSystem.unitDeath();
        }
      }
    }
  }
  
  // AI building attacks
  if (!state.aiBuilding.isDead) {
    const enemies = allUnits.filter(
      u => u.faction === 'human' && 
           !u.isDead &&
           u.position >= (100 - state.aiBuilding.range)
    );
    
    if (enemies.length > 0) {
      const closest = enemies.reduce((prev, curr) => 
        curr.position > prev.position ? curr : prev
      );
      
      const timeSinceLastAttack = state.matchTime - state.aiBuilding.lastAttackTime;
      const attackCooldown = 1 / state.aiBuilding.attackSpeed;
      
      if (timeSinceLastAttack >= attackCooldown) {
        // AI Building attack animation
        const targetLaneY = closest.lane === 'top' ? 25 : 75;
        
        animationManager.createProjectile(
          95,
          50,
          closest.position,
          targetLaneY,
          'magic',
          'undead'
        );
        
        soundSystem.towerAttack();
        
        closest.health -= state.aiBuilding.attack;
        state.aiBuilding.lastAttackTime = state.matchTime;
        
        animationManager.createEffect(closest.position, targetLaneY, 'hit', closest.faction);
        
        if (closest.health <= 0) {
          closest.isDead = true;
          animationManager.createEffect(closest.position, targetLaneY, 'death', closest.faction);
          soundSystem.unitDeath();
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
    
    // Update stats
    if (faction === 'human') {
      state.playerStats.heroLevel = hero.level;
    } else {
      state.aiStats.heroLevel = hero.level;
    }
  }
  
  return state;
}

export function upgradeTechTier(state: GameState, faction: Faction): GameState {
  soundSystem.techUpgrade();
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
