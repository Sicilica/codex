import { getCostToTarget } from "../queries/abilities";
import {
  findInstance,
  getInstance,
  getPlayer,
  queryInstances,
} from "../queries/common";
import { getOpponents } from "../queries/players";
import {
  GameState,
  PromptRequest,
} from "../types";

const pushablePatrollerExists = (
  $: GameState,
): boolean => {
  const activePlayerGold = $.players[$.activePlayer].gold;
  for (const pid of getOpponents($, $.activePlayer)) {
    const P = getPlayer($, pid);
    if (P == null) {
      continue;
    }

    const patrollers = queryInstances($, {
      patrolling: true,
      player: P.id,
    });

    for (const iid of patrollers) {
      const I = getInstance($, iid);
      if (I == null || getCostToTarget(I) > activePlayerGold) {
        continue;
      }
      return true;
    }
  }

  return false;
};

const zaneIsAlive = (
  $: GameState,
): boolean => {
  return findInstance($, {
    card: "Captain Zane",
    player: $.activePlayer,
  }) != null;
};

export const isPromptValid = (
  $: GameState,
  req: PromptRequest,
): boolean => {
  switch (req.type) {
  case "ZANE_MAX_BAND":
    return zaneIsAlive($) && pushablePatrollerExists($);
  default:
    throw new Error(`unrecognized prompt type "${req.type}"`);
  }
};
