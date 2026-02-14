/*
  SOUND EFFECTS (Placeholder)
  - In a full implementation, these would play actual audio
  - For now, they serve as hooks for future audio integration
*/

export function playUnitSpawnSound(faction: 'human' | 'undead') {
  // Placeholder for unit spawn sound
  console.debug(`[SFX] Unit spawned for ${faction}`);
}

export function playCombatSound() {
  // Placeholder for combat hit sound
  console.debug('[SFX] Combat hit');
}

export function playVictorySound() {
  // Placeholder for victory fanfare
  console.debug('[SFX] Victory!');
}

export function playDefeatSound() {
  // Placeholder for defeat sound
  console.debug('[SFX] Defeat');
}

export function playTechUpgradeSound() {
  // Placeholder for tech upgrade sound
  console.debug('[SFX] Tech upgraded');
}

export function playGoldSound() {
  // Placeholder for gold collection sound
  console.debug('[SFX] Gold collected');
}
