import { PATROL_SLOTS } from "../constants";
import { GameEngine } from "../engine";
import { PlayerState } from "../types";

export const getHeroLimit = (
  $: GameEngine,
  P: PlayerState,
): number => {
  if (hasUsableTechBuilding($, P, 3)) {
    return 3;
  }

  const hasUsableHeroHall = false as boolean;

  if (hasUsableTechBuilding($, P, 2)) {
    return hasUsableHeroHall ? 3 : 2;
  }

  return hasUsableHeroHall ? 2 : 1;
};

export function *getOpponents(
  $: GameEngine,
  P: PlayerState | null,
): Iterable<PlayerState> {
  if (P == null) {
    return;
  }

  for (const pid in $.state.players) {
    if (Object.prototype.hasOwnProperty.call($.state.players, pid)) {
      if (pid === P.id) {
        continue;
      }
      yield $.state.players[pid];
    }
  }
}

export const hasEmptyPatrolSlot = (
  P: PlayerState | null,
): boolean => {
  if (P == null) {
    return false;
  }
  for (const slot of PATROL_SLOTS) {
    if (P.patrol[slot] == null) {
      return true;
    }
  }
  return false;
};

const hasUsableTechBuilding = (
  $: GameEngine,
  P: PlayerState,
  tech: number,
): boolean => {
  const techBuilding = $.getInstance(P.techBuildings[tech - 1]);
  return techBuilding != null
    && !techBuilding.arrivalFatigue
    && techBuilding.readyState === "READY";
};
