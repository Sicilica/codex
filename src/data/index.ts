import {
  AbilityFn,
  AbilityFnID,
  Card,
  CardID,
  Color,
  DataSource,
  HeroCardBand,
  Spec,
  TechLevel,
} from "../framework/types";

import rawData from "./data.json";

import { getBuildingProperties } from "./buildings";
import { CORE_CARDS } from "./core";
import { getHeroBandProperties } from "./hero";
import { getSpellBoostCost, getSpellDetails } from "./spells";
import { getUnitBoostCost, getUnitProperties } from "./units";
import { getUpgradeProperties } from "./upgrades";

export class CachedDataSource implements DataSource {

  private abilityFns: Array<AbilityFn<unknown>> = [];

  private cards: Record<CardID, Card> = {};

  public constructor(cards: Array<Card>) {
    for (const card of cards) {
      this.cards[card.id] = card;
    }
  }

  public *allCards(): Iterable<Card> {
    for (const cid in this.cards) {
      if (Object.prototype.hasOwnProperty.call(this.cards, cid)) {
        yield this.cards[cid];
      }
    }
  }

  public lookupAbilityFn(aid: AbilityFnID): AbilityFn<unknown> {
    return this.abilityFns[aid];
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
  (Array.from(rawData) as Array<RawCard>)
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
      boostCost: getSpellBoostCost(commonFields.id),
      tags: rawCard.tags,
      ultimate: rawCard.ultimate,
      ...getSpellDetails(commonFields.id),
    };
  case "UNIT":
    return {
      ...commonFields,
      type: "UNIT",
      boostCost: getUnitBoostCost(commonFields.id),
      tech: rawCard.tech,
      tags: rawCard.tags,
      token: false,
      ...getUnitProperties(commonFields.id, rawCard.health, rawCard.attack),
    };
  case "UPGRADE":
    return {
      ...commonFields,
      type: "UPGRADE",
      boostCost: null,
      tech: rawCard.tech,
      tags: rawCard.tags,
      ...getUpgradeProperties(commonFields.id, null, null),
    };
  default:
    return null;
  }
};

const loadBand = (
  rawCard: RawCard & { type: "HERO" },
  index: 0 | 1 | 2,
): HeroCardBand => {
  const prevBand = index > 0 ? rawCard.levelBands[index - 1] : null;
  const nextBand = index < 2 ? rawCard.levelBands[index + 1] : null;
  return {
    nextLevel: nextBand?.level ?? null,
    ...getHeroBandProperties(
      rawCard.name,
      index,
      rawCard.levelBands[index].health - (prevBand?.health ?? 0),
      rawCard.levelBands[index].attack - (prevBand?.attack ?? 0),
    ),
  };
};
