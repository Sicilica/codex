import { lookupCard } from "../../data";

import { GameState } from "../types";

import { makeInstance } from "./helpers";

/**
 *
 * @param $
 * @param cid when omitted, the card discarded from the player's hand will be
 * random
 */
export const discardCard = (
  $: GameState,
  cid: string|undefined = undefined
): void => {
  const P = $.players[$.activePlayer];

  if (P.hand.length <= 0) {
    throw new Error("hand is empty");
  }

  const discardID = cid || P.hand[Math.floor(Math.random() * P.hand.length)];
  const indexInHand = P.hand.indexOf(discardID);
  if (indexInHand < 0) {
    throw new Error("card not in hand");
  }

  P.hand = P.hand.slice(0, indexInHand).concat(P.hand.slice(indexInHand + 1));
  P.discard.push(discardID);
};

export const playCard = (
  $: GameState,
  cid: string,
  boost: boolean,
): void => {
  const card = lookupCard(cid);
  const P = $.players[$.activePlayer];

  const indexInHand = P.hand.indexOf(cid);
  if (indexInHand < 0) {
    throw new Error("card not in hand");
  }

  if (boost) {
    if (card.boostCost == null) {
      throw new Error("card not boostable");
    }
    if (P.gold < card.cost + card.boostCost) {
      throw new Error("not enough money");
    }
    P.gold -= card.cost + card.boostCost;
  } else {
    if (P.gold < card.cost) {
      throw new Error("not enough money");
    }
    P.gold -= card.cost;
  }

  P.hand = P.hand.slice(0, indexInHand).concat(P.hand.slice(indexInHand + 1));

  switch (card.type) {
  case "UNIT":
    makeInstance($, $.activePlayer, cid);
    break;
  default:
    throw new Error("unexpected card type");
  }
};
