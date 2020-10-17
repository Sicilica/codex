
import { Action } from "../types/serializable";

import { buyWorker } from "./base";
import { purchaseTechBuilding } from "./buildings";
import { playCard } from "./hand";
import {
  endTurn,
  techCards,
} from "./turn";

export const performAction = (
  $: GameState,
  action: Action,
): void => {
  if (action.type !== "RESPOND_TO_PROMPT" && $.blockingPrompts.length > 0) {
    throw new Error("cannot ignore blocking prompt");
  }

  switch (action.type) {
  case "BUY_WORKER":
    buyWorker($, action.cardID);
    break;
  case "END_TURN":
    endTurn($);
    break;
  case "PLAY_CARD":
    playCard($, action.cardID, action.boost);
    break;
  case "PURCHASE_TECH_BUILDING":
    purchaseTechBuilding($, action.spec);
    break;
  case "RESPOND_TO_PROMPT":
    respondToPrompt($, action.index, action.response);
    break;
  case "TECH":
    techCards($, action.cards);
    break;
  default:
    throw new Error(
      `Unrecognized action type: ${(action as { type: unknown }).type}`,
    );
  }
};
