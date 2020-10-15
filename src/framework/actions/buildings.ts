import { TECH_BUILDING_CARDS } from "../../data/core";

import {
  GameState,
  PlayerState,
  Spec,
} from "../types";

import { makeInstance } from "./helpers";


export const purchaseTechBuilding = (
  $: GameState,
  spec?: Spec,
): void => {
  const P = $.players[$.activePlayer];

  const levelToPurchase = P.purchasedTechBuildings;
  const card = TECH_BUILDING_CARDS[levelToPurchase];

  if (card.tech === 2) {
    if (spec == null) {
      throw new Error("failed to declare spec");
    }
  } else if (spec != null) {
    throw new Error("unexpected declared spec");
  }

  if (P.gold < card.cost) {
    throw new Error("not enough gold");
  }

  if (P.workers < card.workerRequirement) {
    throw new Error("not enough workers");
  }

  P.purchasedTechBuildings++;
  P.gold -= card.cost;
  if (spec != null) {
    P.mainSpec = spec;
  }
  rebuildTechBuildings($, P);
};

export const rebuildTechBuildings = (
  $: GameState,
  P: PlayerState,
): void => {
  for (let i = 0; i < P.purchasedTechBuildings; i++) {
    if (P.techBuildings[i] == null) {
      P.techBuildings[i] = makeInstance($, P.id, `$TECH${i + 1}`).id;
    }
  }
};
