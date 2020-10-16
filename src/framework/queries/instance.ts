import { lookupCard } from "../../data";

import {
  GameState,
  Instance,
} from "../types";

import { getKeywordValue } from "./abilities";
import { isBuilding, isHero, isUnit } from "./common";
import { getHeroBand } from "./heroes";

export const getCurrentArmor = (
  $: GameState,
  I: Instance,
): number => {
  return getKeywordValue($, I, "ARMOR");
};

export const getCurrentAttack = (
  $: GameState,
  I: Instance,
): number => {
  return getBaseAttack(I) + getKeywordValue($, I, "FRENZY");
};

export const getCurrentHealth = (
  I: Instance,
): number => {
  return getBaseHealth(I) - I.damage;
};

const getBaseAttack = (
  I: Instance,
): number => {
  const card = lookupCard(I.card);
  if (isUnit(card)) {
    return card.attack;
  }
  if (isHero(card)) {
    return card.bands[getHeroBand(I)].attack;
  }
  return 0;
};

const getBaseHealth = (
  I: Instance,
): number => {
  const card = lookupCard(I.card);
  if (isBuilding(card) || isUnit(card)) {
    return card.health;
  }
  if (isHero(card)) {
    return card.bands[getHeroBand(I)].health;
  }
  return 0;
};
