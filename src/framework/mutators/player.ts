import { TECH_BUILDING_CARDS } from "../../data/core";

import { MAX_GOLD } from "../constants";
import { GameEngine } from "../engine";
import {
  CardID,
  PlayerState,
} from "../types";

import { createInstance } from "./instance";

export const giveGold = (
  P: PlayerState,
  amount: number,
): void => {
  P.gold = Math.min(P.gold + amount, MAX_GOLD);
};

export const rebuildTechBuildings = (
  $: GameEngine,
  P: PlayerState,
): void => {
  for (let i = 0; i < P.purchasedTechBuildings; i++) {
    if (P.techBuildings[i] == null) {
      P.techBuildings[i] = createInstance($, P, TECH_BUILDING_CARDS[i]).id;
    }
  }
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
