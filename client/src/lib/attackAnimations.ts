/*
  ATTACK ANIMATIONS
  - Visual projectiles and effects for combat
*/

export interface Projectile {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number; // 0 to 1
  type: 'arrow' | 'magic' | 'melee';
  faction: 'human' | 'undead';
}

export interface AttackEffect {
  id: string;
  x: number;
  y: number;
  type: 'hit' | 'death';
  faction: 'human' | 'undead';
  timestamp: number;
}

export class AttackAnimationManager {
  private projectiles: Projectile[] = [];
  private effects: AttackEffect[] = [];
  private nextId = 0;

  createProjectile(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    type: 'arrow' | 'magic' | 'melee',
    faction: 'human' | 'undead'
  ): string {
    const id = `proj-${this.nextId++}`;
    this.projectiles.push({
      id,
      fromX,
      fromY,
      toX,
      toY,
      progress: 0,
      type,
      faction,
    });
    return id;
  }

  createEffect(
    x: number,
    y: number,
    type: 'hit' | 'death',
    faction: 'human' | 'undead'
  ): void {
    const id = `effect-${this.nextId++}`;
    this.effects.push({
      id,
      x,
      y,
      type,
      faction,
      timestamp: Date.now(),
    });
  }

  update(deltaTime: number): void {
    // Update projectiles
    for (const proj of this.projectiles) {
      proj.progress += deltaTime * 3; // Speed multiplier
    }

    // Remove completed projectiles
    this.projectiles = this.projectiles.filter(p => p.progress < 1);

    // Remove old effects (after 500ms)
    const now = Date.now();
    this.effects = this.effects.filter(e => now - e.timestamp < 500);
  }

  getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  getEffects(): AttackEffect[] {
    return this.effects;
  }

  clear(): void {
    this.projectiles = [];
    this.effects = [];
  }
}
