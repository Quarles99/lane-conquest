/*
  ATTACK EFFECTS OVERLAY
  - Renders projectiles and impact effects
*/

import { AttackEffect, Projectile } from '@/lib/attackAnimations';
import { memo } from 'react';

interface AttackEffectsProps {
  projectiles: Projectile[];
  effects: AttackEffect[];
}

function AttackEffects({ projectiles, effects }: AttackEffectsProps) {
  // Limit rendered effects to prevent performance issues
  const visibleProjectiles = projectiles.slice(0, 50);
  const visibleEffects = effects.slice(0, 30);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Render projectiles */}
      {visibleProjectiles.map(proj => {
        const currentX = proj.fromX + (proj.toX - proj.fromX) * proj.progress;
        const currentY = proj.fromY + (proj.toY - proj.fromY) * proj.progress;
        
        return (
          <div
            key={proj.id}
            className="absolute transition-none"
            style={{
              left: `${currentX}%`,
              top: `${currentY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {proj.type === 'arrow' && (
              <div className={`w-3 h-1 ${proj.faction === 'human' ? 'bg-primary' : 'bg-destructive'} opacity-80`} />
            )}
            {proj.type === 'magic' && (
              <div className={`w-2 h-2 rounded-full ${proj.faction === 'human' ? 'bg-primary' : 'bg-destructive'} shadow-lg animate-pulse`} />
            )}
            {proj.type === 'melee' && (
              <div className="text-xl opacity-60">⚔</div>
            )}
          </div>
        );
      })}
      
      {/* Render impact effects */}
      {visibleEffects.map(effect => (
        <div
          key={effect.id}
          className="absolute animate-ping"
          style={{
            left: `${effect.x}%`,
            top: `${effect.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {effect.type === 'hit' && (
            <div className={`w-4 h-4 rounded-full ${effect.faction === 'human' ? 'bg-primary/50' : 'bg-destructive/50'}`} />
          )}
          {effect.type === 'death' && (
            <div className="text-destructive text-2xl font-bold">✕</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default memo(AttackEffects);
