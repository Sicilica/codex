import { CardID, GameState } from "../types";

import { playCard } from "./hand";
import { endTurn, techCards } from "./turn";

export type Action = {
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
