
import { lookupCard } from "../../data";

import {
  BuildingCard,
  Card,
  GameState,
  PlayerState,
  Spec,
  UnitCard,
  UpgradeCard,
} from "../types";

import {
  findInstance,
  getInstance,
  isBuilding,
  isSpell,
  isUnit,
  isUpgrade,
  queryInstances,
} from "./common";

export const canPlayCard = (
  $: GameState,
  P: PlayerState,
  card: Card,
  boost: boolean,
): boolean => {
  if (isSpell(card)) {
    if (card.spec == null) {
      // For basic spells, must have any hero
      const hero = findInstance($, {
        player: P.id,
        type: "HERO",
      });
      if (hero == null) {
        return false;
      }
    } else {
      // For non-basic spells, we must have the correct hero
      const hero = findInstance($, {
        player: P.id,
        spec: card.spec,
        type: "HERO",
      });
      if (hero == null) {
        return false;
      }

      // For ultimate spells, hero must have been max band at the start of the
      // turn
      if (card.ultimate) {
        if (!hero.startedTurnAtMaxBand) {
          return false;
        }
      }
    }
  }

  if (hasTechRequirement(card)) {
    // Must have the approriate tech building, and it must be usable (ie, not
    // played this turn)
    if (card.tech >= 1) {
      const techBuilding = getInstance($, P.techBuildings[card.tech - 1]);
      if (techBuilding == null || techBuilding.arrivalFatigue) {
        return false;
      }
    }

    // For Tech 2/3 cards, must have access to the appropriate spec
    if (card.spec != null && card.tech >= 2 && !canAccessSpec(P, card.spec)) {
      return false;
    }
  }

  // Must have enough gold
  const cost = getCardCost($, P, card, boost);
  if (P.gold < cost) {
    return false;
  }

  return true;
};

export const getCardCost = (
  $: GameState,
  P: PlayerState,
  card: Card,
  boost: boolean,
): number => {
  let mustCrossCastBasicSpell = false;
  if (isSpell(card) && card.spec == null) {
    // If all available heroes are of different colors, must pay extra to
    // cross cast
    const heroes = queryInstances($, {
      player: P.id,
      type: "HERO",
    });
    mustCrossCastBasicSpell = heroes.every(iid => {
      const heroI = getInstance($, iid);
      if (heroI == null) {
        return true;
      }

      const heroC = lookupCard(heroI.card);
      return heroC.color !== card.color;
    });
  }

  const boostCost = boost ? card.boostCost : 0;
  if (boostCost == null) {
    throw new Error("cannot boost card with no boost cost");
  }
  const finalCost = card.cost
    + (mustCrossCastBasicSpell ? 1 : 0)
    + boostCost;

  return finalCost;
};

const canAccessSpec = (
  P: PlayerState,
  spec: Spec,
): boolean =>
  P.mainSpec === spec || P.techLabSpec === spec;

const hasTechRequirement = (
  card: Card,
): card is BuildingCard | UnitCard | UpgradeCard => {
  return isBuilding(card) || isUnit(card) || isUpgrade(card);
};
