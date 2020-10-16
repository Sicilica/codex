import { lookupCard } from "../../data";

import {
  Ability,
  GameState,
  Instance,
  SimpleKeywordAbility,
  ValuedKeywordAbility,
} from "../types";

import { isUnit } from "./common";

export const getCostToTarget = (
  I: Instance,
): number => {
  return getKeywordValue(I, "RESIST");
};

export const getInstanceAbilities = (
  I: Instance,
): Array<Ability> => {
  const card = lookupCard(I.card);
  if (isUnit(card)) {
    return card.abilities;
  }

  throw new Error("TODO get abilities for this instance type");
};

export const getKeywordValue = (
  I: Instance,
  kw: ValuedKeywordAbility["keyword"],
): number => {
  return getInstanceAbilities(I)
    .filter(a => a.type === "VALUED_KEYWORD" && a.keyword === kw)
    .map(a => (a as ValuedKeywordAbility).value)
    .reduce((a, b) => a + b, 0);
};

export const hasSimpleKeyword = (
  I: Instance,
  kw: SimpleKeywordAbility["keyword"],
): boolean => {
  return getInstanceAbilities(I)
    .some(a => a.type === "SIMPLE_KEYWORD" && a.keyword === kw);
};
