import { PATROL_SLOTS } from "../constants";
import { GameEngine } from "../engine";
import { PlayerState } from "../types";

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
