import { lookupCard } from "../../data";

import {
  Ability,
  GameState,
  Instance,
} from "../types";

import { isUnit } from "./common";

export const getCostToTarget = (
  $: GameState,
  I: Instance,
): number => {
  // TODO
  // const abilities = getInstanceAbilities(I);
  return 0;
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
