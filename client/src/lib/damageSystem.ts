/*
  DAMAGE SYSTEM
  - Warcraft 3 style damage and armor type interactions
  - Damage multipliers based on attack type vs armor type
*/

import { DamageType, ArmorType } from './gameTypes';

// Damage multiplier table (Warcraft 3 inspired)
// Format: damageMultipliers[attackType][armorType] = multiplier
export const damageMultipliers: Record<DamageType, Record<ArmorType, number>> = {
  // Normal damage: Good vs Medium/Light, weak vs Heavy/Fortified
  normal: {
    heavy: 0.75,      // 75% damage to heavy armor (knights, tanks)
    medium: 1.0,      // 100% damage to medium armor (standard units)
    light: 1.5,       // 150% damage to light armor (fast units, archers)
    unarmored: 1.0,   // 100% damage to unarmored (casters)
    fortified: 0.5,   // 50% damage to fortified (buildings, towers)
  },
  
  // Pierce damage: Excellent vs Light/Unarmored, weak vs Heavy
  pierce: {
    heavy: 0.5,       // 50% damage to heavy armor
    medium: 0.75,     // 75% damage to medium armor
    light: 2.0,       // 200% damage to light armor
    unarmored: 1.5,   // 150% damage to unarmored
    fortified: 0.35,  // 35% damage to fortified
  },
  
  // Magic damage: Good vs Light/Medium, excellent vs Heavy, weak vs Unarmored
  magic: {
    heavy: 1.25,      // 125% damage to heavy armor
    medium: 1.0,      // 100% damage to medium armor
    light: 1.0,       // 100% damage to light armor
    unarmored: 0.75,  // 75% damage to unarmored (magic resistance)
    fortified: 0.5,   // 50% damage to fortified
  },
  
  // Siege damage: Devastating vs Fortified, weak vs everything else
  siege: {
    heavy: 0.5,       // 50% damage to heavy armor
    medium: 1.0,      // 100% damage to medium armor
    light: 0.5,       // 50% damage to light armor
    unarmored: 0.5,   // 50% damage to unarmored
    fortified: 2.5,   // 250% damage to fortified (building killer)
  },
  
  // Hero damage: Consistent against all types, slightly better vs Medium
  hero: {
    heavy: 1.0,       // 100% damage to heavy armor
    medium: 1.0,      // 100% damage to medium armor
    light: 1.0,       // 100% damage to light armor
    unarmored: 1.0,   // 100% damage to unarmored
    fortified: 0.5,   // 50% damage to fortified
  },
};

/**
 * Calculate final damage after applying armor type multiplier
 */
export function calculateDamage(baseDamage: number, damageType: DamageType, armorType: ArmorType): number {
  const multiplier = damageMultipliers[damageType][armorType];
  return Math.round(baseDamage * multiplier);
}

/**
 * Get damage effectiveness description for UI
 */
export function getDamageEffectiveness(damageType: DamageType, armorType: ArmorType): string {
  const multiplier = damageMultipliers[damageType][armorType];
  
  if (multiplier >= 2.0) return 'Devastating';
  if (multiplier >= 1.5) return 'Very Effective';
  if (multiplier >= 1.25) return 'Effective';
  if (multiplier > 1.0) return 'Good';
  if (multiplier === 1.0) return 'Normal';
  if (multiplier >= 0.75) return 'Reduced';
  if (multiplier >= 0.5) return 'Poor';
  return 'Very Poor';
}
