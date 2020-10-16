import { lookupCard } from "../../data";

import {
  Card,
  Instance,
} from "../types";

import { isHero } from "./common";

export const getHeroBand = (
  I: Instance,
): number => {
  const card = lookupCard(I.card);
  if (!isHero(card)) {
    throw new Error("instance is not a hero");
  }
  for (let i = 0; i < card.bands.length; i++) {
    const band = card.bands[i];
    if (band.nextLevel == null || I.level < band.nextLevel) {
      return i;
    }
  }
  throw new Error("failed to determine current band");
};

export const getMaxLevel = (
  card: Card,
): number => {
  if (!isHero(card)) {
    return 1;
  }
  const midBand = card.bands[1];
  if (midBand.nextLevel == null) {
    throw new Error("malformed hero card");
  }
  return midBand.nextLevel;
};

export const isMaxBand = (
  I: Instance,
): boolean => {
  const card = lookupCard(I.card);
  return getMaxLevel(card) <= I.level;
};
