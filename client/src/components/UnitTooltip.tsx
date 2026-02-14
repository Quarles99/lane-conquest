/*
  UNIT TOOLTIP
  - Shows detailed unit stats on hover
*/

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UNIT_STATS, UnitType } from '@/lib/gameTypes';
import { ReactNode } from 'react';

interface UnitTooltipProps {
  unitType: UnitType;
  children: ReactNode;
}

export default function UnitTooltip({ unitType, children }: UnitTooltipProps) {
  const stats = UNIT_STATS[unitType];

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side="left" className="bg-card/95 border-primary/30 p-3 max-w-xs">
        <div className="space-y-2">
          <div className="font-display text-primary capitalize text-base">{unitType}</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-ui">
            <div className="text-muted-foreground">Health:</div>
            <div className="text-foreground">{stats.health}</div>
            
            <div className="text-muted-foreground">Attack:</div>
            <div className="text-foreground">{stats.attack}</div>
            
            <div className="text-muted-foreground">Attack Speed:</div>
            <div className="text-foreground">{stats.attackSpeed.toFixed(1)}/s</div>
            
            <div className="text-muted-foreground">Move Speed:</div>
            <div className="text-foreground">{stats.moveSpeed}</div>
            
            <div className="text-muted-foreground">Range:</div>
            <div className="text-foreground">{stats.range === 1 ? 'Melee' : stats.range}</div>
            
            <div className="text-muted-foreground">Damage Type:</div>
            <div className="text-foreground capitalize">{stats.damageType}</div>
            
            <div className="text-muted-foreground">Armor Type:</div>
            <div className="text-foreground capitalize">{stats.armorType}</div>
            
            <div className="text-muted-foreground">Tier Required:</div>
            <div className="text-foreground">{stats.tierRequired}</div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
