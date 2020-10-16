import {
  dealDamage,
  targetInstance,
} from "../actions/helpers";
import {
  findInstance,
  getInstance,
  getPlayer,
} from "../queries/common";
import {
  getPatrollingSlot,
  hasEmptyPatrolSlot,
} from "../queries/patrol";
import {
  GameState,
  InstanceID,
  PatrolSlot,
  PromptRequest,
  PromptResponse,
} from "../types";

const resolveZaneMaxBand = (
  $: GameState,
  iid: InstanceID,
  destSlot: PatrolSlot,
): void => {
  const zane = findInstance($, {
    card: "Captain Zane",
    player: $.activePlayer,
  });
  if (zane == null) {
    throw new Error("zane not found");
  }

  const I = getInstance($, iid);
  if (I == null) {
    throw new Error("unknown target");
  }
  const currSlot = getPatrollingSlot($, I);
  if (currSlot == null) {
    throw new Error("target is not patrolling");
  }

  const P = getPlayer($, I.controller);
  if (P == null) {
    throw new Error("failed to find controller");
  }
  if (currSlot === destSlot) {
    // TODO Ruling: Even if all slots are full, you still have to deal 1 damage to a
    // patroller because of "do everything you can".
    if (hasEmptyPatrolSlot(P)) {
      throw new Error("must shove target to empty slot");
    }
  } else if (P.patrol[destSlot] != null) {
    throw new Error("destination is not empty");
  }

  // Target the instance
  targetInstance($, I);

  // Move to the new slot
  P.patrol[currSlot] = null;
  P.patrol[destSlot] = I.id;

  // Deal 1 damage
  // TODO Ruling: This counts as Zane dealing damage (though spells e.g. do not).
  dealDamage($, I, 1, zane.id);
};

export const resolvePrompt = (
  $: GameState,
  req: PromptRequest,
  res: PromptResponse,
): void => {
  if (req.type !== res.type) {
    throw new Error("prompt type mismatch");
  }

  switch (res.type) {
  case "ZANE_MAX_BAND":
    resolveZaneMaxBand($, res.instance, res.slot);
    break;
  default:
    throw new Error(`unrecognized prompt type "${res.type}"`);
  }
};
