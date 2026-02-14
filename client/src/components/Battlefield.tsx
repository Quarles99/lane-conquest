/*
  BATTLEFIELD RENDERER
  - Visualizes two lanes with units
  - Shows unit positions and health bars
*/

import { GameState, Lane, Tower, Unit } from '@/lib/gameTypes';
import type { HeroUnit } from '@/lib/gameTypes';
import { getAnimationManager } from '@/lib/gameEngine';
import AttackEffects from './AttackEffects';

interface BattlefieldProps {
  gameState: GameState;
}

export default function Battlefield({ gameState }: BattlefieldProps) {
  const animationManager = getAnimationManager();
  const projectiles = animationManager.getProjectiles();
  const effects = animationManager.getEffects();
  const renderLane = (lane: Lane) => {
    const playerUnits = gameState.playerUnits.filter(u => u.lane === lane && !u.isDead);
    const aiUnits = gameState.aiUnits.filter(u => u.lane === lane && !u.isDead);
    const playerHero = gameState.playerHeroUnit && gameState.playerHeroUnit.lane === lane && !gameState.playerHeroUnit.isDead ? gameState.playerHeroUnit : null;
    const aiHero = gameState.aiHeroUnit && gameState.aiHeroUnit.lane === lane && !gameState.aiHeroUnit.isDead ? gameState.aiHeroUnit : null;
    
    return (
      <div className="relative h-32 bg-gradient-to-r from-primary/10 via-muted/5 to-destructive/10 border-2 border-muted/30 overflow-hidden">
        {/* Lane label */}
        <div className="absolute top-2 left-2 text-xs font-ui text-muted-foreground uppercase tracking-wider">
          {lane === 'top' ? 'North Lane' : 'South Lane'}
        </div>
        
        {/* Player base marker */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50" />
        
        {/* AI base marker */}
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-destructive/50" />
        
        {/* Middle line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-muted/20" />
        
        {/* Render player units */}
        {playerUnits.map(unit => (
          <UnitMarker key={unit.id} unit={unit} />
        ))}
        
        {/* Render AI units */}
        {aiUnits.map(unit => (
          <UnitMarker key={unit.id} unit={unit} />
        ))}
        
        {/* Render heroes */}
        {playerHero && <HeroMarker key={playerHero.id} hero={playerHero} />}
        {aiHero && <HeroMarker key={aiHero.id} hero={aiHero} />}
        
        {/* Render towers */}
        {gameState.playerTowers
          .filter(t => t.lane === lane && !t.isDead)
          .map(tower => (
            <TowerMarker key={tower.id} tower={tower} />
          ))}
        {gameState.aiTowers
          .filter(t => t.lane === lane && !t.isDead)
          .map(tower => (
            <TowerMarker key={tower.id} tower={tower} />
          ))}
      </div>
    );
  };
  
  return (
    <div className="flex-1 flex flex-col gap-6 justify-center relative">
      {renderLane('top')}
      {renderLane('bottom')}
      
      {/* Attack effects overlay */}
      <AttackEffects projectiles={projectiles} effects={effects} />
    </div>
  );
}

interface UnitMarkerProps {
  unit: Unit;
}

function UnitMarker({ unit }: UnitMarkerProps) {
  const healthPercent = (unit.health / unit.maxHealth) * 100;
  const isPlayer = unit.faction === 'human';
  
  return (
    <div
      className="absolute transition-all duration-100"
      style={{
        left: `${unit.position}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Unit icon */}
      <div 
        className={`w-8 h-8 border-2 flex items-center justify-center text-xs font-ui font-bold shadow-lg transition-all hover:scale-110 ${
          isPlayer 
            ? 'bg-primary/90 border-primary text-primary-foreground' 
            : 'bg-destructive/90 border-destructive text-destructive-foreground'
        }`}
        title={`${unit.type} - ${Math.floor(unit.health)}/${unit.maxHealth} HP`}
      >
        {unit.type.charAt(0).toUpperCase()}
      </div>
      
      {/* Health bar */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-black/50">
        <div 
          className={`h-full transition-all ${isPlayer ? 'bg-primary' : 'bg-destructive'}`}
          style={{ width: `${healthPercent}%` }}
        />
      </div>
    </div>
  );
}

interface TowerMarkerProps {
  tower: Tower;
}

function TowerMarker({ tower }: TowerMarkerProps) {
  const healthPercent = (tower.health / tower.maxHealth) * 100;
  const isPlayer = tower.faction === 'human';
  
  return (
    <div
      className="absolute transition-all duration-100"
      style={{
        left: `${tower.position}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Tower structure */}
      <div 
        className={`w-10 h-12 border-2 flex items-center justify-center text-xs font-ui font-bold shadow-lg ${
          isPlayer 
            ? 'bg-primary/70 border-primary/90' 
            : 'bg-destructive/70 border-destructive/90'
        }`}
        title={`Tower - ${Math.floor(tower.health)}/${tower.maxHealth} HP`}
        style={{
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
        }}
      >
        <div className="text-foreground">⚔</div>
      </div>
      
      {/* Health bar */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-black/50">
        <div 
          className={`h-full transition-all ${isPlayer ? 'bg-primary' : 'bg-destructive'}`}
          style={{ width: `${healthPercent}%` }}
        />
      </div>
    </div>
  );
}

interface HeroMarkerProps {
  hero: HeroUnit;
}

function HeroMarker({ hero }: HeroMarkerProps) {
  const healthPercent = (hero.health / hero.maxHealth) * 100;
  const isPlayer = hero.faction === 'human';
  
  return (
    <div
      className="absolute transition-all duration-100"
      style={{
        left: `${hero.position}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Hero icon - larger and more prominent */}
      <div 
        className={`w-12 h-12 border-3 flex items-center justify-center text-base font-display font-bold shadow-xl transition-all hover:scale-110 ${
          isPlayer 
            ? 'bg-gradient-to-br from-primary to-primary/70 border-primary text-primary-foreground' 
            : 'bg-gradient-to-br from-destructive to-destructive/70 border-destructive text-destructive-foreground'
        }`}
        title={`${hero.heroType} (Hero) Lv.${hero.level} - ${Math.floor(hero.health)}/${hero.maxHealth} HP`}
        style={{
          borderRadius: '50%',
          borderWidth: '3px',
        }}
      >
        <span className="text-xl">★</span>
      </div>
      
      {/* Health bar */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-1.5 bg-black/50 border border-black/30">
        <div 
          className={`h-full transition-all ${isPlayer ? 'bg-primary' : 'bg-destructive'}`}
          style={{ width: `${healthPercent}%` }}
        />
      </div>
      
      {/* Level indicator */}
      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent border-2 border-accent-foreground flex items-center justify-center">
        <span className="text-[10px] font-bold text-accent-foreground">{hero.level}</span>
      </div>
    </div>
  );
}
