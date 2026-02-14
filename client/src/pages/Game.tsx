/*
  GRITTY LOW-FANTASY GAME INTERFACE
  - Asymmetric war table layout (battlefield 65% left, controls 35% right)
  - Weathered textures and torn parchment edges
  - Dark medieval color palette
*/

import Battlefield from "@/components/Battlefield";
import UnitTooltip from "@/components/UnitTooltip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { createInitialGameState, addToFormation, updateGameState, upgradeTechTier } from "@/lib/gameEngine";
import { GAME_CONSTANTS, GameState, Lane, UNIT_STATS, UnitType } from "@/lib/gameTypes";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Game() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const lastUpdateRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.winner) {
      return;
    }

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastUpdateRef.current) / 1000, 0.1); // Cap delta time
      lastUpdateRef.current = now;

      setGameState(prevState => updateGameState(prevState, deltaTime));
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.winner]);

  const startGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: true }));
    lastUpdateRef.current = Date.now();
  };

  const handleSpawnUnit = useCallback((unitType: UnitType, lane: Lane) => {
    setGameState(prev => addToFormation({ ...prev }, unitType, 'human', lane));
  }, []);

  useKeyboardControls({
    onSpawnUnit: handleSpawnUnit,
    enabled: gameState.isPlaying && !gameState.isPaused && !gameState.winner,
  });

  const handleUpgradeTier = () => {
    setGameState(prev => upgradeTechTier({ ...prev }, 'human'));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getNextTierCost = () => {
    if (gameState.playerTechTier === 1) return GAME_CONSTANTS.TECH_TIER_2_COST;
    if (gameState.playerTechTier === 2) return GAME_CONSTANTS.TECH_TIER_3_COST;
    return 0;
  };

  const canUpgradeTier = () => {
    return gameState.playerTechTier < 3 && gameState.playerGold >= getNextTierCost();
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden vignette">
      {/* Battlefield background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://private-us-east-1.manuscdn.com/sessionFile/Tk5HoCi3w8SyCtlhgEnaja/sandbox/SEjupRAqVyjm0vxnfBuaIE-img-1_1771051684000_na1fn_YmF0dGxlZmllbGQtYmFja2dyb3VuZA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVGs1SG9DaTN3OFN5Q3RsaGdFbmFqYS9zYW5kYm94L1NFanVwUkFxVnlqbTB2eG5mQnVhSUUtaW1nLTFfMTc3MTA1MTY4NDAwMF9uYTFmbl9ZbUYwZEd4bFptbGxiR1F0WW1GamEyZHliM1Z1WkEucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Y~tTb81ZN9qkF-LeFLpl5VeatMcVRgrLIL6YmTrxNtycAQhkwhunA9kfBM0ep1PyRUdxJ9jb4rPI~FAg~QKPxob0867PgP-1ISVPbwaSsc1gsR~KaXv0rwv39PKUjytph6iWz9UL5ICbI5XrjAadudQH4csYLa1-scSJaWBuFIgzGC5VBKBRaCx52pfRkotHi2a0MsoiW3IelxyB-7ix9Hpl4gApBlvav~QQ8PBlYBJeVUqga2Cmj7zRIKjNh6pNSQFkBv-JLqb2mLyZlLxBnBMF~Yqb~AgbntKlvfE5GTXAmF3YYisd47sysGqedgsXNTMRbPA08zuu2zxbFm~VFw__')",
        }}
      />
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Main game container */}
      <div className="relative z-10 flex h-screen">
        {/* Battlefield view - 65% width */}
        <div className="w-[65%] flex flex-col p-6">
          {/* Top HUD */}
          <div className="flex justify-between items-start mb-4">
            {/* Match info */}
            <Card className="texture-parchment bg-card/90 backdrop-blur-sm border-2 border-primary/30 p-4">
              <div className="flex gap-6 items-center">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-ui">Match Time</div>
                  <div className="text-2xl font-display text-primary">{formatTime(gameState.matchTime)}</div>
                </div>
                <Separator orientation="vertical" className="h-12 bg-border" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-ui">Gold</div>
                  <div className="text-2xl font-display text-accent-foreground">{Math.floor(gameState.playerGold)}</div>
                </div>
                <Separator orientation="vertical" className="h-12 bg-border" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-ui">Fortress</div>
                  <div className="text-sm font-ui text-foreground">
                    {Math.floor(gameState.playerBuilding.health)} / {gameState.playerBuilding.maxHealth}
                  </div>
                  <Progress 
                    value={(gameState.playerBuilding.health / gameState.playerBuilding.maxHealth) * 100} 
                    className="w-24 h-1 mt-1" 
                  />
                </div>
              </div>
            </Card>

            {/* Hero info */}
            <Card className="texture-parchment bg-card/90 backdrop-blur-sm border-2 border-primary/30 p-4">
              <div className="flex gap-4 items-center">
                <div 
                  className="w-16 h-16 bg-cover bg-center border-2 border-primary/50"
                  style={{
                    backgroundImage: "url('https://private-us-east-1.manuscdn.com/sessionFile/Tk5HoCi3w8SyCtlhgEnaja/sandbox/SEjupRAqVyjm0vxnfBuaIE-img-2_1771051710000_na1fn_aHVtYW4taGVyby1wYWxhZGlu.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvVGs1SG9DaTN3OFN5Q3RsaGdFbmFqYS9zYW5kYm94L1NFanVwUkFxVnlqbTB2eG5mQnVhSUUtaW1nLTJfMTc3MTA1MTcxMDAwMF9uYTFmbl9hSFZ0WVc0dGFHVnlieTF3WVd4aFpHbHUucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=iuf9ZxVnHVLW1Daan2FMZaLWIYue1vX0jCZ8JORtErpYd7oSZAyLlG-hmx-JM8D1LwiL-FRN39r1kFM5Hn9P4wBQ9Naxlp1~EX0ZwLuBYgXrlcVXpefx~mSmWYnRI5OUju9myOWTWpz9HCQRBqxhy0uqWrR8ViiAAC~tkVnK~1yGpLWOcHaW21SWmH30F-heBHoNyix3ys1OuTwLs0qfVWLDHXhBCn0i1AiEPXqz8Py9nvBKdsu37qZSK3p~AIwaEpyUFBrygkdhShRDLzYvkfiuXQ~7nCcWHkTbNaVY6QNiIqsLiF3Ca6aiSnmfmZtzUH-P0w37SOIVq~w__')",
                  }}
                />
                <div>
                  <div className="text-sm font-display text-primary">Paladin</div>
                  <div className="text-xs text-muted-foreground font-ui">Level {gameState.playerHero.level}</div>
                  <Progress 
                    value={(gameState.playerHero.xp / GAME_CONSTANTS.XP_PER_LEVEL) * 100} 
                    className="w-24 h-1 mt-1" 
                  />
                  <div className="text-xs text-muted-foreground font-ui mt-1">
                    ATK: {gameState.playerHero.attack} | HP: {Math.floor(gameState.playerHero.health)}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Battlefield lanes */}
          <Battlefield gameState={gameState} />

          {/* Bottom HUD - Middle control */}
          <div className="mt-4">
            <Card className="texture-parchment bg-card/90 backdrop-blur-sm border-2 border-primary/30 p-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-ui mb-2 text-center">
                Middle Control
              </div>
              <div className="relative h-4 bg-muted/30">
                <div 
                  className="absolute top-0 left-0 h-full bg-primary/60 transition-all"
                  style={{ width: `${Math.max(0, gameState.middleControlProgress)}%` }}
                />
                <div 
                  className="absolute top-0 right-0 h-full bg-destructive/60 transition-all"
                  style={{ width: `${Math.max(0, -gameState.middleControlProgress)}%` }}
                />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/50" />
              </div>
              {gameState.middleControlFaction && (
                <div className="text-xs text-center mt-1 font-ui text-accent-foreground">
                  {gameState.middleControlFaction === 'human' ? 'Human Empire' : 'Undead Legion'} controls the middle (+{GAME_CONSTANTS.GOLD_BONUS_MIDDLE_CONTROL} gold/sec)
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Control panel - 35% width */}
        <div className="w-[35%] border-l-4 border-primary/20 bg-card/80 backdrop-blur-md p-6 overflow-y-auto texture-parchment">
          <h1 className="text-4xl font-display text-primary mb-2">Lane Conquest</h1>
          <p className="text-sm text-muted-foreground mb-6 font-body">Human Empire vs Undead Legion</p>

          {!gameState.isPlaying ? (
            <div className="space-y-6">
              <Card className="bg-secondary/50 border-2 border-primary/20 p-6">
                <h2 className="text-xl font-display text-foreground mb-3">Battle Instructions</h2>
                <div className="space-y-2 text-sm text-muted-foreground font-body leading-relaxed">
                  <p>Hire units once to add them to your formation. Each hired unit will automatically spawn every 8 seconds, creating a continuous army production line.</p>
                  <p>Destroy the enemy fortress to claim victory. Upgrade your hero through combat experience and advance through three technology tiers.</p>
                  <p>Control the middle section of the battlefield to gain bonus gold income and strategic advantage.</p>
                </div>
              </Card>

              <Button 
                onClick={startGame}
                size="lg"
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-ui font-bold text-lg border-2 border-primary/50 shadow-lg"
              >
                Begin Battle
              </Button>
            </div>
          ) : gameState.winner ? (
            <div className="space-y-6">
              <Card className="bg-secondary/50 border-2 border-primary/20 p-6 text-center">
                <h2 className="text-3xl font-display mb-4">
                  {gameState.winner === 'human' ? (
                    <span className="text-primary">Victory!</span>
                  ) : (
                    <span className="text-destructive">Defeat</span>
                  )}
                </h2>
                <p className="text-muted-foreground font-body">
                  {gameState.winner === 'human' 
                    ? 'The Human Empire has triumphed over the Undead Legion!' 
                    : 'The Undead Legion has crushed the Human Empire...'}
                </p>
                <div className="mt-4 text-sm text-muted-foreground font-ui">
                  Match Duration: {formatTime(gameState.matchTime)}
                </div>
              </Card>
              <Button 
                onClick={() => {
                  setGameState(createInitialGameState());
                  lastUpdateRef.current = Date.now();
                }}
                size="lg"
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-ui font-bold text-lg border-2 border-primary/50"
              >
                New Battle
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tech tier */}
              <Card className="bg-secondary/50 border-2 border-primary/20 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-ui text-muted-foreground">Technology Tier</span>
                  <span className="text-2xl font-display text-primary">{gameState.playerTechTier}</span>
                </div>
                {gameState.playerTechTier < 3 && (
                  <Button 
                    onClick={handleUpgradeTier}
                    disabled={!canUpgradeTier()}
                    size="sm"
                    variant="outline"
                    className="w-full bg-accent/20 border-accent/40 hover:bg-accent/30 mt-2"
                  >
                    <span className="font-ui">Advance to Tier {gameState.playerTechTier + 1}</span>
                    <span className="ml-auto text-accent-foreground font-ui">{getNextTierCost()} Gold</span>
                  </Button>
                )}
              </Card>

              {/* Formation Queue Display */}
              {gameState.playerFormation.length > 0 && (
                <Card className="bg-secondary/50 border-2 border-primary/20 p-4">
                  <h3 className="text-sm font-ui text-muted-foreground uppercase tracking-wider mb-3">Active Formation</h3>
                  <div className="space-y-2">
                    {gameState.playerFormation.map((slot, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm bg-card/30 p-2 rounded border border-primary/20">
                        <span className="font-ui capitalize">
                          {slot.unitType} ({slot.lane === 'top' ? 'North' : 'South'})
                        </span>
                        <span className="text-xs text-accent-foreground font-ui">
                          Next: {Math.ceil(slot.spawnTimer)}s
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Unit recruitment - North Lane */}
              <div>
                <h3 className="text-lg font-display text-foreground mb-3">Hire Units - North Lane (Q/W/E/R)</h3>
                <div className="space-y-2">
                  {(['footman', 'archer', 'knight', 'priest'] as const).map((unitType, idx) => {
                    const stats = UNIT_STATS[unitType];
                    const canAfford = gameState.playerGold >= stats.cost;
                    const tierUnlocked = gameState.playerTechTier >= stats.tierRequired;
                    const hotkey = ['Q', 'W', 'E', 'R'][idx];
                    
                    return (
                      <UnitTooltip key={unitType} unitType={unitType}>
                        <Button 
                          onClick={() => handleSpawnUnit(unitType, 'top')}
                          disabled={!canAfford || !tierUnlocked}
                          variant="outline" 
                          className="w-full justify-between bg-card/50 border-primary/30 hover:bg-primary/10 text-left"
                        >
                          <span className="font-ui capitalize">
                            [{hotkey}] {unitType}
                            {!tierUnlocked && <span className="text-xs ml-2">(Tier {stats.tierRequired})</span>}
                          </span>
                          <span className="text-accent-foreground font-ui">{stats.cost}g</span>
                        </Button>
                      </UnitTooltip>
                    );
                  })}
                </div>
              </div>

              {/* Unit recruitment - South Lane */}
              <div>
                <h3 className="text-lg font-display text-foreground mb-3">Hire Units - South Lane (A/S/D/F)</h3>
                <div className="space-y-2">
                  {(['footman', 'archer', 'knight', 'priest'] as const).map((unitType, idx) => {
                    const stats = UNIT_STATS[unitType];
                    const canAfford = gameState.playerGold >= stats.cost;
                    const tierUnlocked = gameState.playerTechTier >= stats.tierRequired;
                    const hotkey = ['A', 'S', 'D', 'F'][idx];
                    
                    return (
                      <UnitTooltip key={unitType} unitType={unitType}>
                        <Button 
                          onClick={() => handleSpawnUnit(unitType, 'bottom')}
                          disabled={!canAfford || !tierUnlocked}
                          variant="outline" 
                          className="w-full justify-between bg-card/50 border-primary/30 hover:bg-primary/10 text-left"
                        >
                          <span className="font-ui capitalize">
                            [{hotkey}] {unitType}
                            {!tierUnlocked && <span className="text-xs ml-2">(Tier {stats.tierRequired})</span>}
                          </span>
                          <span className="text-accent-foreground font-ui">{stats.cost}g</span>
                        </Button>
                      </UnitTooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
