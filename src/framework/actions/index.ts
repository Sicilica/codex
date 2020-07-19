import { CardID, GameState } from "../types";

import { playCard } from "./hand";
import { endTurn, techCards } from "./turn";
import { buyWorker } from "./base";

export type Action = {
  type: "BUY_WORKER";
  cardID: string;
} | {
  type: "PLAY_CARD";
  cardID: string;
  boost: boolean;
} | {
  type: "TECH";
  cards: Array<CardID>;
} | {
  type: "END_TURN";
}

export const performAction = (
  $: GameState,
  action: Action,
): void => {
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
  case "TECH":
    techCards($, action.cards);
    break;
  default:
    throw new Error(
      `Unrecognized action type: ${(action as { type: unknown }).type}`,
    );
  }
};
