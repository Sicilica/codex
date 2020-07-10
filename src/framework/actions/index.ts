import {
  GameState,
  Spec,
} from "../types";

import { playCard } from "./hand";
import { endTurn } from "./turn";
import { purchaseTechBuilding } from "./buildings";

export type Action = {
  type: "END_TURN";
} | {
  type: "PLAY_CARD";
  cardID: string;
  boost: boolean;
} | {
  type: "PURCHASE_TECH_BUILDING";
  spec?: Spec;
};

export const performAction = (
  $: GameState,
  action: Action,
): void => {
  switch (action.type) {
  case "PURCHASE_TECH_BUILDING":
    purchaseTechBuilding($, action.spec);
    break;
  case "END_TURN":
    endTurn($);
    break;
  case "PLAY_CARD":
    playCard($, action.cardID, action.boost);
    break;
  default:
    throw new Error(
      `Unrecognized action type: ${(action as { type: unknown }).type}`,
    );
  }
};
