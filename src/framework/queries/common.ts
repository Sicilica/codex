import { lookupCard } from "../../data";

import {
  Card,
  CardID,
  GameState,
  HeroCard,
  Instance,
  InstanceID,
  PlayerID,
  PlayerState,
  UnitCard,
} from "../types";

export const getInstance = (
  $: GameState,
  iid: InstanceID | null,
): Instance | null => {
  return iid == null ? null : $.instances[iid];
};

export const getPlayer = (
  $: GameState,
  pid: PlayerID | null,
): PlayerState | null => {
  return pid == null ? null : $.players[pid];
};

export const isHero = (
  card: Card,
): card is HeroCard => {
  return card.type === "HERO";
};

export const isUnit = (
  card: Card,
): card is UnitCard => {
  return card.type === "UNIT";
};

export interface InstanceQuery {
  card?: CardID,
  player?: PlayerID,
  tags?: Array<string>,
}

export const queryInstances = (
  $: GameState,
  query: InstanceQuery,
): Array<InstanceID> => {
  return Object.entries($.instances).filter(entry => {
    const I = entry[1];
    const card = lookupCard(I.card);

    if (query.card != null && I.card !== query.card) {
      return false;
    }

    if (query.player != null && I.controller !== query.player) {
      return false;
    }

    if (query.tags?.some(tag => !card.tags.includes(tag))) {
      return false;
    }

    return true;
  }).map(entry => entry[0]);
};
