import { PATROL_SLOTS } from "../constants";
import { GameEngine } from "../engine";
import { PatrolSlot, PlayerState } from "../types";

export const getEmptyPatrolSlots = (
  P: PlayerState | null,
): Array<PatrolSlot> => {
  if (P == null) {
    return [];
  }
  return PATROL_SLOTS.filter(slot => P.patrol[slot] == null);
};

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
  return getFirstEmptyPatrolSlot(P) != null;
};

const getFirstEmptyPatrolSlot = (
  P: PlayerState | null,
): PatrolSlot | null => {
  // eslint-disable-next-line no-unreachable-loop
  for (const slot of getEmptyPatrolSlots(P)) {
    return slot;
  }
  return null;
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
