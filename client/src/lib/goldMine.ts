/*
  GOLD MINE SYSTEM
  - Purchase gold mines for increased income
  - Cost increases exponentially
*/

import { GAME_CONSTANTS, GameState } from './gameTypes';

export function getGoldMineCost(currentMines: number): number {
  return Math.floor(
    GAME_CONSTANTS.GOLD_MINE_BASE_COST * 
    Math.pow(GAME_CONSTANTS.GOLD_MINE_COST_MULTIPLIER, currentMines)
  );
}

export function canPurchaseGoldMine(state: GameState): boolean {
  const cost = getGoldMineCost(state.playerGoldMines);
  return state.playerGold >= cost && state.playerGoldMineCooldown <= 0;
}

export function purchaseGoldMine(state: GameState): GameState {
  if (!canPurchaseGoldMine(state)) {
    return state;
  }
  
  const cost = getGoldMineCost(state.playerGoldMines);
  
  return {
    ...state,
    playerGold: state.playerGold - cost,
    playerGoldMines: state.playerGoldMines + 1,
    playerGoldMineCooldown: GAME_CONSTANTS.GOLD_MINE_COOLDOWN,
  };
}
