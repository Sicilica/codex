import { lookupCard } from "../../../data";
import { GameState } from "../types";
import { makeInstance } from "./helpers";

export const playCard = (
  $: GameState,
  cid: string,
  boost: boolean,
) => {
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

  // TODO perform card effect
  switch (card.type) {
    case 'UNIT': {
      makeInstance($, $.activePlayer, cid);
    } break;
    default:
      throw new Error("unexpected card type");
  }
};
