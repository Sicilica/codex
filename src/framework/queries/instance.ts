import { lookupCard } from "../../data";

import {
  Instance,
} from "../types";

import { getKeywordValue } from "./abilities";
import { isUnit } from "./common";

export const getCurrentArmor = (
  I: Instance,
): number => {
  return getKeywordValue(I, "ARMOR");
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
  if (isUnit(card)) {
    return card.health;
  }

  throw new Error("TODO get health for this instance type");
};
