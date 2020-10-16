import { lookupCard } from "../../data";

import {
  GameState,
  Instance,
} from "../types";

import { getKeywordValue } from "./abilities";
import { isBuilding, isUnit } from "./common";

export const getCurrentArmor = (
  $: GameState,
  I: Instance,
): number => {
  return getKeywordValue($, I, "ARMOR");
};

export const getCurrentHealth = (
  I: Instance,
): number => {
  return getBaseHealth(I) - I.damage;
};

const getBaseHealth = (
  I: Instance,
): number => {
  const card = lookupCard(I.card);
  if (isBuilding(card) || isUnit(card)) {
    return card.health;
  }

  throw new Error("TODO get health for this instance type");
};
