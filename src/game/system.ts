import { GameEngine } from "../framework/engine";

import { resolveEffect } from "./actions";
import { resolveCombat } from "./combat";
import { effectParamsAreValid } from "./effects";
import {
  gotoEndOfTurnPhase,
  gotoMainPhase,
  gotoTechPhase,
  gotoUpkeepPhase,
} from "./turn_phases";

export const simulateUntilIdle = (
  $: GameEngine,
): void => {
  let returnControlToPlayer = false;
  while (!returnControlToPlayer) {
    // TODO if instance was added or removed, recalc continuous effects
    // TODO check validity of all effects

    if ($.state.unresolvedEffects.length === 0) {
      // There are no pending effects. We should automatically advance the
      // game.
      if ($.state.unresolvedCombat == null) {
        switch ($.state.turnPhase) {
        case "TECH":
          // Prompt the player to choose their techs.
          returnControlToPlayer = true;
          break;
        case "READY":
          gotoUpkeepPhase($);
          break;
        case "UPKEEP":
          gotoMainPhase($);
          break;
        case "MAIN":
          // Wait for the player's next action.
          returnControlToPlayer = true;
          break;
        case "DRAW":
          gotoEndOfTurnPhase($);
          break;
        case "END_OF_TURN":
          gotoTechPhase($);
          break;
        case "GAME_OVER":
          returnControlToPlayer = true;
          break;
        }
      } else {
        resolveCombat($, $.state.unresolvedCombat);
        $.state.unresolvedCombat = null;
      }
    } else if ($.state.unresolvedEffects.length === 1
      && effectParamsAreValid($, $.state.unresolvedEffects[0], {})) {
      // There's only one pending effect and it requires no params, so we can
      // just resolve it immediately without needing player input.
      resolveEffect($, $.state.unresolvedEffects[0].id, {});
    } else {
      // There are multiple pending effects to choose from, or we need params.
      returnControlToPlayer = true;
    }
  }
};
