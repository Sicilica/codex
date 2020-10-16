import { lookupCard } from "../../data";
import {
  LOOKOUT_ABILITY,
} from "../../data/patrol";

import {
  Ability,
  GameState,
  Instance,
  SimpleKeywordAbility,
  ValuedKeywordAbility,
} from "../types";

import {
  getPlayer,
  isBuilding,
  isHero,
  isUnit,
} from "./common";
import { getHeroBand } from "./heroes";

export const getCostToTarget = (
  $: GameState,
  I: Instance,
): number => {
  return getKeywordValue($, I, "RESIST");
};

export const getInstanceAbilities = (
  $: GameState,
  I: Instance,
): Array<Ability> => {
  const abilities = [ ...getCardAbilities(I) ];

  const P = getPlayer($, I.controller);
  if (P != null && P.id !== $.activePlayer) {
    if (P.patrol.lookout === I.id) {
      abilities.push(LOOKOUT_ABILITY);
    }
  }

  return abilities;
};

export const getKeywordValue = (
  $: GameState,
  I: Instance,
  kw: ValuedKeywordAbility["keyword"],
): number => {
  return getInstanceAbilities($, I)
    .filter(a => a.type === "VALUED_KEYWORD" && a.keyword === kw)
    .map(a => (a as ValuedKeywordAbility).value)
    .reduce((a, b) => a + b, 0);
};

export const hasSimpleKeyword = (
  $: GameState,
  I: Instance,
  kw: SimpleKeywordAbility["keyword"],
): boolean => {
  return getInstanceAbilities($, I)
    .some(a => a.type === "SIMPLE_KEYWORD" && a.keyword === kw);
};

const getCardAbilities = (
  I: Instance,
): Array<Ability> => {
  const card = lookupCard(I.card);
  if (isHero(card)) {
    const band = getHeroBand(I);
    return card.bands
      .slice(0, band + 1)
      .map(b => b.abilities)
      .reduce((a, b) => a.concat(b));
  } else if (isBuilding(card) || isUnit(card)) {
    return card.abilities;
  }

  throw new Error("TODO get abilities for this instance type");
};
