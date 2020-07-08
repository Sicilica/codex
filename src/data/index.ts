import {
  Card,
  Color,
  HeroCard,
  Spec,
} from '../framework/types';

import * as rawData from './data.json';

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
  type: 'BUILDING',
  color: Color,
  spec: Spec,
  tech: number,
  health: number,
  tags: Array<string>,
  legendary: boolean,
} | {
  type: 'HERO',
  color: Color,
  spec: Spec,
  levelBands: [RawHeroBand, RawHeroBand, RawHeroBand],
} | {
  type: 'SPELL',
  color: Color,
  spec: Spec,
  tags: Array<string>,
  ultimate: boolean,
  ongoing: boolean,
} | {
  type: 'UNIT',
  color: Color,
  spec: Spec,
  tech: number,
  attack: number,
  health: number,
  tags: Array<string>,
  legendary: boolean,
} | {
  type: 'UPGRADE',
  color: Color,
  spec: Spec,
  tech: number,
  legendary: boolean,
  tags: Array<string>,
});

const loadBand = (
  rawCard: RawCard & { type: 'HERO' },
  index: number,
): HeroCard['bands'][0] => ({
  ...rawCard.levelBands[index],
  nextLevel: index < 2 ? rawCard.levelBands[index + 1].level : null,
  abilities: ['TODO'],
});

const loadCard = (
  rawCard: RawCard,
): Card | null => {
  switch (rawCard.type) {
  case 'BUILDING':
    return {
      ...rawCard,
      abilities: ['TODO'],
      boostCost: null,  // TODO
    };
  case 'HERO':
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
  case 'SPELL':
    return {
      ...rawCard,
      type: 'INSTANT_SPELL',  // TODO
      effects: ['TODO'],
      boostCost: null,  // TODO
    };
  case 'UNIT':
    return {
      ...rawCard,
      token: false,
      abilities: ['TODO'],
      boostCost: null,  // TODO
    };
  case 'UPGRADE':
    return {
      ...rawCard,
      abilities: ['TODO'],
      boostCost: null,  // TODO
    };
  default:
    return null;
  }
};

// Load cards when this file is first required. A loop like this is necessary because
// of the nature of importing a JSON array directly.
const cardMap: Record<string, Card | null> = {};
for (let i = 0; rawData[i] != null; i++) {
  const rawCard = rawData[i] as RawCard;
  cardMap[rawCard.name] = loadCard(rawCard);
}
