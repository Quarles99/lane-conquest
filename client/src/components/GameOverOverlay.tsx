/*
  GAME OVER OVERLAY
  - Victory/Defeat screen with match statistics
*/

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Faction, MatchStatistics } from '@/lib/gameTypes';

interface GameOverOverlayProps {
  winner: Faction;
  playerFaction: Faction;
  matchTime: number;
  playerStats: MatchStatistics;
  aiStats: MatchStatistics;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function GameOverOverlay({
  winner,
  playerFaction,
  matchTime,
  playerStats,
  aiStats,
  onPlayAgain,
  onMainMenu,
}: GameOverOverlayProps) {
  const isVictory = winner === playerFaction;
  const minutes = Math.floor(matchTime / 60);
  const seconds = Math.floor(matchTime % 60);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="bg-gradient-to-b from-amber-950/95 to-stone-900/95 border-2 border-amber-700/50 p-8 max-w-2xl w-full mx-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 
            className={`text-5xl font-bold mb-2 ${
              isVictory 
                ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]' 
                : 'text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]'
            }`}
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {isVictory ? 'VICTORY!' : 'DEFEAT'}
          </h1>
          <p className="text-amber-200/80 text-lg">
            {isVictory 
              ? 'The enemy fortress has fallen!' 
              : 'Your fortress has been destroyed...'}
          </p>
        </div>

        {/* Match Duration */}
        <div className="text-center mb-6">
          <p className="text-amber-300/70 text-sm">Match Duration</p>
          <p className="text-amber-100 text-2xl font-semibold">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Player Stats */}
          <div className="space-y-3">
            <h3 className="text-amber-400 font-semibold text-center border-b border-amber-700/50 pb-2">
              Your Performance
            </h3>
            <StatRow label="Units Killed" value={playerStats.unitsKilled} />
            <StatRow label="Damage Dealt" value={Math.floor(playerStats.damageDealt)} />
            <StatRow label="Gold Earned" value={Math.floor(playerStats.goldEarned)} />
            <StatRow label="Towers Destroyed" value={playerStats.towersDestroyed} />
            <StatRow label="Hero Level" value={playerStats.heroLevel} />
          </div>

          {/* AI Stats */}
          <div className="space-y-3">
            <h3 className="text-red-400 font-semibold text-center border-b border-red-700/50 pb-2">
              Enemy Performance
            </h3>
            <StatRow label="Units Killed" value={aiStats.unitsKilled} />
            <StatRow label="Damage Dealt" value={Math.floor(aiStats.damageDealt)} />
            <StatRow label="Gold Earned" value={Math.floor(aiStats.goldEarned)} />
            <StatRow label="Towers Destroyed" value={aiStats.towersDestroyed} />
            <StatRow label="Hero Level" value={aiStats.heroLevel} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={onPlayAgain}
            className="bg-amber-700 hover:bg-amber-600 text-amber-100 px-8 py-6 text-lg font-semibold border-2 border-amber-600"
          >
            Play Again
          </Button>
          <Button
            onClick={onMainMenu}
            variant="outline"
            className="bg-stone-800/50 hover:bg-stone-700/50 text-amber-200 px-8 py-6 text-lg font-semibold border-2 border-amber-700/30"
          >
            Main Menu
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-amber-200/70">{label}:</span>
      <span className="text-amber-100 font-semibold">{value}</span>
    </div>
  );
}
