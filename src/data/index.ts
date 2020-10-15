import {
  Card,
  Color,
  HeroCard,
  Spec,
} from "../framework/types";

import * as rawData from "./data.json";

import { getBuildingAbilities } from "./buildings";
import { CORE_CARDS } from "./core";
import { getHeroAbilities } from "./hero";
import { getSpellBoostCost, getSpellDetails } from "./spells";
import { getUnitAbilities, getUnitBoostCost } from "./units";
import { getUpgradeAbilities } from "./upgrades";

const ERROR_ON_FAILED_LOAD = false;

export const lookupCard = (
  name: string,
): Card => {
  const card = cardMap[name];
  if (card == null) {
    throw new Error(`Unrecognized card: ${name}`);
  }
  return card;
};

interface RawHeroBand {
  level: number;
  attack: number;
  health: number;
  bandText: string;
}

type RawCard = {
  name: string,
  image: string,
  cost: number,
  cardText: string,
  cardRulings: Array<string>,
} & ({
  type: "BUILDING",
  color: Color,
  spec: Spec,
  tech: number,
  health: number,
  tags: Array<string>,
  legendary: boolean,
} | {
  type: "HERO",
  color: Color,
  spec: Spec,
  levelBands: [RawHeroBand, RawHeroBand, RawHeroBand],
} | {
  type: "SPELL",
  color: Color,
  spec: Spec,
  tags: Array<string>,
  ultimate: boolean,
  ongoing: boolean,
} | {
  type: "UNIT",
  color: Color,
  spec: Spec,
  tech: number,
  attack: number,
  health: number,
  tags: Array<string>,
  legendary: boolean,
} | {
  type: "UPGRADE",
  color: Color,
  spec: Spec,
  tech: number,
  legendary: boolean,
  tags: Array<string>,
});

const loadBand = (
  rawCard: RawCard & { type: "HERO" },
  index: 0 | 1 | 2,
): HeroCard["bands"][0] => ({
  ...rawCard.levelBands[index],
  nextLevel: index < 2 ? rawCard.levelBands[index + 1].level : null,
  abilities: getHeroAbilities(rawCard.name, index),
});

const loadCard = (
  rawCard: RawCard,
): Card | null => {
  switch (rawCard.type) {
  case "BUILDING":
    return {
      ...rawCard,
      abilities: getBuildingAbilities(rawCard.name),
      boostCost: null,
      baseComponent: false,
    };
  case "HERO":
    return {
      ...rawCard,
      bands: [
        loadBand(rawCard, 0),
        loadBand(rawCard, 1),
        loadBand(rawCard, 2),
      ],
      tags: [],
      boostCost: null,
    };
  case "SPELL":
    return {
      ...rawCard,
      ...getSpellDetails(rawCard.name),
      boostCost: getSpellBoostCost(rawCard.name),
    };
  case "UNIT":
    return {
      ...rawCard,
      token: false,
      abilities: getUnitAbilities(rawCard.name),
      boostCost: getUnitBoostCost(rawCard.name),
    };
  case "UPGRADE":
    return {
      ...rawCard,
      abilities: getUpgradeAbilities(rawCard.name),
      boostCost: null,
    };
  default:
    return null;
  }
};

// Load cards when this file is first required. A loop like this is necessary
// because of the nature of importing a JSON array directly.
const cardMap: Record<string, Card | null> = {
  ...CORE_CARDS,
};
for (let i = 0; rawData[i] != null; i++) {
  const rawCard = rawData[i] as RawCard;
  try {
    cardMap[rawCard.name] = loadCard(rawCard);
  } catch (err) {
    if (ERROR_ON_FAILED_LOAD) {
      throw err;
    }
    cardMap[rawCard.name] = null;
  }
}
