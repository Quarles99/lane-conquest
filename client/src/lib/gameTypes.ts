/*
  CORE GAME TYPES
  - Unit definitions, combat stats, game state
*/

export type Faction = 'human' | 'undead';
export type Lane = 'top' | 'bottom';
export type UnitType = 'footman' | 'archer' | 'knight' | 'priest' | 'zombie' | 'skeleton' | 'ghoul' | 'necromancer';
export type HeroType = 'paladin' | 'deathknight';

export interface Unit {
  id: string;
  type: UnitType;
  faction: Faction;
  lane: Lane;
  position: number; // 0-100, 0 = own base, 100 = enemy base
  health: number;
  maxHealth: number;
  attack: number;
  attackSpeed: number; // attacks per second
  moveSpeed: number; // units per second
  range: number; // attack range
  lastAttackTime: number;
  target: string | null; // target unit ID
  isDead: boolean;
}

export interface Hero {
  type: HeroType;
  faction: Faction;
  level: number;
  xp: number;
  health: number;
  maxHealth: number;
  attack: number;
  attackSpeed: number;
  abilities: HeroAbility[];
}

export interface HeroUnit extends Unit {
  heroType: HeroType;
  level: number;
  xp: number;
  abilities: HeroAbility[];
  isHero: true;
}

export type AbilityType = 'heal' | 'damage' | 'buff';

export interface HeroAbility {
  id: AbilityType;
  name: string;
  cooldown: number;
  lastUsed: number;
  manaCost: number;
  description: string;
}

export interface Building {
  faction: Faction;
  health: number;
  maxHealth: number;
  attack: number;
  attackSpeed: number;
  range: number;
  lastAttackTime: number;
  isDead: boolean;
}

export interface Tower {
  id: string;
  faction: Faction;
  lane: Lane;
  position: number;
  health: number;
  maxHealth: number;
  attack: number;
  attackSpeed: number;
  range: number;
  lastAttackTime: number;
  isDead: boolean;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  matchTime: number;
  winner: Faction | null;
  
  // Player resources
  playerGold: number;
  playerTechTier: number;
  playerHero: Hero;
  playerHeroUnit: HeroUnit | null;
  playerHeroRespawnTime: number;
  playerUnits: Unit[];
  playerBuilding: Building;
  playerTowers: Tower[];
  
  // AI resources
  aiGold: number;
  aiTechTier: number;
  aiHero: Hero;
  aiHeroUnit: HeroUnit | null;
  aiHeroRespawnTime: number;
  aiUnits: Unit[];
  aiBuilding: Building;
  aiTowers: Tower[];
  
  // Middle control
  middleControlFaction: Faction | null;
  middleControlProgress: number; // -100 to 100
}

export interface UnitStats {
  health: number;
  attack: number;
  attackSpeed: number;
  moveSpeed: number;
  range: number;
  cost: number;
  tierRequired: number;
}

export const UNIT_STATS: Record<UnitType, UnitStats> = {
  // Human units
  footman: {
    health: 150,
    attack: 12,
    attackSpeed: 1.0,
    moveSpeed: 3,
    range: 1,
    cost: 50,
    tierRequired: 1,
  },
  archer: {
    health: 80,
    attack: 15,
    attackSpeed: 1.2,
    moveSpeed: 3.5,
    range: 6,
    cost: 75,
    tierRequired: 1,
  },
  knight: {
    health: 250,
    attack: 20,
    attackSpeed: 0.8,
    moveSpeed: 4,
    range: 1,
    cost: 120,
    tierRequired: 2,
  },
  priest: {
    health: 100,
    attack: 8,
    attackSpeed: 1.5,
    moveSpeed: 3,
    range: 5,
    cost: 100,
    tierRequired: 2,
  },
  
  // Undead units
  zombie: {
    health: 180,
    attack: 10,
    attackSpeed: 0.9,
    moveSpeed: 2.5,
    range: 1,
    cost: 50,
    tierRequired: 1,
  },
  skeleton: {
    health: 70,
    attack: 14,
    attackSpeed: 1.3,
    moveSpeed: 3.5,
    range: 6,
    cost: 75,
    tierRequired: 1,
  },
  ghoul: {
    health: 220,
    attack: 22,
    attackSpeed: 1.0,
    moveSpeed: 4.5,
    range: 1,
    cost: 120,
    tierRequired: 2,
  },
  necromancer: {
    health: 90,
    attack: 18,
    attackSpeed: 1.2,
    moveSpeed: 3,
    range: 5,
    cost: 100,
    tierRequired: 2,
  },
};

export const HERO_STATS = {
  paladin: {
    baseHealth: 500,
    baseAttack: 25,
    attackSpeed: 1.0,
    healthPerLevel: 50,
    attackPerLevel: 3,
  },
  deathknight: {
    baseHealth: 450,
    baseAttack: 30,
    attackSpeed: 1.1,
    healthPerLevel: 45,
    attackPerLevel: 4,
  },
};

export const GAME_CONSTANTS = {
  GOLD_PER_SECOND: 5,
  GOLD_BONUS_MIDDLE_CONTROL: 3,
  XP_PER_KILL_BASE: 10,
  XP_PER_LEVEL: 100,
  MAX_HERO_LEVEL: 10,
  HERO_RESPAWN_TIME: 30, // seconds
  TECH_TIER_2_COST: 200,
  TECH_TIER_3_COST: 400,
  BUILDING_MAX_HEALTH: 2000,
  BUILDING_ATTACK: 50,
  BUILDING_ATTACK_SPEED: 0.5,
  BUILDING_RANGE: 15,
  TOWER_MAX_HEALTH: 800,
  TOWER_ATTACK: 30,
  TOWER_ATTACK_SPEED: 1.0,
  TOWER_RANGE: 20,
  MIDDLE_CONTROL_SPEED: 5, // points per second
  LANE_LENGTH: 100,
};
