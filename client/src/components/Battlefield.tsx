/*
  BATTLEFIELD RENDERER
  - Visualizes two lanes with units
  - Shows unit positions and health bars
*/

import { GameState, Lane, Unit } from '@/lib/gameTypes';

interface BattlefieldProps {
  gameState: GameState;
}

export default function Battlefield({ gameState }: BattlefieldProps) {
  const renderLane = (lane: Lane) => {
    const playerUnits = gameState.playerUnits.filter(u => u.lane === lane && !u.isDead);
    const aiUnits = gameState.aiUnits.filter(u => u.lane === lane && !u.isDead);
    
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
      </div>
    );
  };
  
  return (
    <div className="flex-1 flex flex-col gap-6 justify-center">
      {renderLane('top')}
      {renderLane('bottom')}
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
