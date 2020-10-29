import { MAX_GOLD } from "../constants";
import {
  CardID,
  PlayerState,
} from "../types";

export const giveGold = (
  P: PlayerState,
  amount: number,
): void => {
  P.gold = Math.min(P.gold + amount, MAX_GOLD);
};

export const reduceGold = (
  P: PlayerState,
  amount: number,
): void => {
  P.gold = Math.max(P.gold - amount, 0);
};

export const removeCardFromHand = (
  P: PlayerState,
  cid: CardID,
): void => {
  const indexInHand = P.hand.indexOf(cid);
  if (indexInHand < 0) {
    return;
  }

  P.hand.splice(indexInHand, 1);
};
