import {
  Card,
  CardID,
  Color,
  DataSource,
  HeroCardBand,
  Spec,
  TechLevel,
} from "../framework/types";

import * as rawData from "./data.json";

import { getBuildingProperties } from "./buildings";
import { CORE_CARDS } from "./core";
import { getHeroBandProperties } from "./hero";
import { getSpellBoostCost, getSpellDetails } from "./spells";
import { getUnitBoostCost, getUnitProperties } from "./units";
import { getUpgradeProperties } from "./upgrades";

export class CachedDataSource implements DataSource {

  private cards: Record<CardID, Card>;

  public constructor(cards: Array<Card>) {
    this.cards = {};
    for (const card of cards) {
      this.cards[card.id] = card;
    }
  }

  public lookupCard(cid: CardID): Card {
    const card = this.cards[cid];
    if (card == null) {
      throw new Error(`unrecognized card: ${cid}`);
    }
    return card;
  }

}

export const loadCards = (): Array<Card> =>
  (rawData as Array<RawCard>)
    .map(loadCard)
    .filter(card => card != null)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map(card => card!)
    .concat(CORE_CARDS);

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
  tech: TechLevel,
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
  tech: TechLevel,
  attack: number,
  health: number,
  tags: Array<string>,
  legendary: boolean,
} | {
  type: "UPGRADE",
  color: Color,
  spec: Spec,
  tech: TechLevel,
  legendary: boolean,
  tags: Array<string>,
});

interface RawHeroBand {
  level: number;
  attack: number;
  health: number;
  bandText: string;
}

const loadCard = (
  rawCard: RawCard,
): Card | null => {
  const commonFields = {
    id: rawCard.name,
    color: rawCard.color,
    spec: rawCard.spec,
    cost: rawCard.cost,
  };

  switch (rawCard.type) {
  case "BUILDING":
    return {
      ...commonFields,
      type: "BUILDING",
      boostCost: null,
      tech: rawCard.tech,
      tags: rawCard.tags,
      baseComponent: false,
      ...getBuildingProperties(commonFields.id, rawCard.health, null),
    };
  case "HERO":
    return {
      ...commonFields,
      type: "HERO",
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
      ...commonFields,
      tags: rawCard.tags,
      ultimate: rawCard.ultimate,
      boostCost: getSpellBoostCost(commonFields.id),
      ...getSpellDetails(commonFields.id),
    };
  case "UNIT":
    return {
      ...commonFields,
      type: "UNIT",
      token: false,
      boostCost: getUnitBoostCost(commonFields.id),
      ...getUnitProperties(commonFields.id, rawCard.health, rawCard.attack),
    };
  case "UPGRADE":
    return {
      ...commonFields,
      type: "UPGRADE",
      ...getUpgradeProperties(commonFields.id, null, null),
      boostCost: null,
    };
  default:
    return null;
  }
};

const loadBand = (
  rawCard: RawCard & { type: "HERO" },
  index: 0 | 1 | 2,
): HeroCardBand => ({
  nextLevel: index < 2 ? rawCard.levelBands[index + 1].level : null,
  ...getHeroBandProperties(
    rawCard.name,
    index,
    rawCard.levelBands[index].health,
    rawCard.levelBands[index].attack,
  ),
});
