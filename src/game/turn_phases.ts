import { MAX_HAND_SIZE, PATROL_SLOTS } from "../framework/constants";
import { GameEngine } from "../framework/engine";
import {
  giveGold,
  rebuildTechBuildings,
} from "../framework/mutators";
import { executeEffect } from "./effects";

import { requireActivePlayer } from "./helpers";

export const gotoReadyPhase = (
  $: GameEngine,
): void => {
  $.state.turnPhase = "READY";

  const P = requireActivePlayer($);

  for (const I of $.queryInstances({
    player: P.id,
  })) {
    if (I.readyState === "DISABLED") {
      I.readyState = "EXHAUSTED";
    } else {
      I.readyState = "READY";
    }
    I.arrivalFatigue = false;
    I.levelAtTurnStart = I.level;
  }

  for (const slot of PATROL_SLOTS) {
    P.patrol[slot] = null;
  }

  rebuildTechBuildings($, P);

  for (const cid in P.heroes) {
    if (Object.prototype.hasOwnProperty.call(P.heroes, cid)) {
      if (P.heroes[cid] === "DIED_THIS_TURN") {
        P.heroes[cid] = "DIED_BEFORE_THIS_TURN";
      }
    }
  }
};

export const gotoUpkeepPhase = (
  $: GameEngine,
): void => {
  $.state.turnPhase = "UPKEEP";

  const P = requireActivePlayer($);
  giveGold(P, P.workers);

  $.fireGlobalTrigger({
    type: "UPKEEP",
  });
};

export const gotoDrawPhase = (
  $: GameEngine,
): void => {
  $.state.turnPhase = "DRAW";

  const P = requireActivePlayer($);

  const discardCount = P.hand.length;

  executeEffect($, {
    type: "DISCARD",
    sourceCard: null,
    sourceInstance: null,
    player: {
      type: "PLAYER",
      value: P.id,
    },
    amount: {
      type: "CONSTANT",
      value: discardCount,
    },
  }, {});
  executeEffect($, {
    type: "DRAW",
    sourceCard: null,
    sourceInstance: null,
    player: {
      type: "PLAYER",
      value: P.id,
    },
    amount: {
      type: "CONSTANT",
      value: Math.min(discardCount + 2, MAX_HAND_SIZE),
    },
  }, {});

  for (const cid in P.heroes) {
    if (Object.prototype.hasOwnProperty.call(P.heroes, cid)) {
      if (P.heroes[cid] === "DIED_BEFORE_THIS_TURN") {
        P.heroes[cid] = "AVAILABLE";
      }
    }
  }
};

export const gotoEndOfTurnPhase = (
  $: GameEngine,
): void => {
  $.state.turnPhase = "END_OF_TURN";

  $.fireGlobalTrigger({
    type: "END_OF_TURN",
  });
};

export const gotoMainPhase = (
  $: GameEngine,
): void => {
  $.state.turnPhase = "MAIN";

  const P = requireActivePlayer($);
  P.hasBuiltWorkerThisTurn = false;
  P.hasShuffledThisTurn = false;
};

export const gotoTechPhase = (
  $: GameEngine,
): void => {
  $.state.turnPhase = "TECH";

  for (const I of $.queryInstances({})) {
    I.memory = {};
  }

  const pids = Object.keys($.state.players);
  if (pids.length > 2) {
    throw new Error(
      "turn order not currently implemented for more than 2 players",
    );
  }
  const nextPlayer = pids.find(pid => pid !== $.state.activePlayer);
  if (nextPlayer == null) {
    throw new Error("failed to determine next player");
  }
  $.state.activePlayer = nextPlayer;

  $.state.earliestAllowedRewind = $.state.time;

  const P = requireActivePlayer($);

  if (P.isFirstPlayer) {
    $.state.round++;
  }

  if ($.state.round === 1) {
    gotoReadyPhase($);
  }
};
