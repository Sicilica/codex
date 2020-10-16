import { lookupCard } from "../../data";

import {
  AttachmentSpellCard,
  BuildingCard,
  Card,
  CardID,
  GameState,
  HeroCard,
  Instance,
  InstanceID,
  InstantSpellCard,
  OngoingSpellCard,
  PlayerID,
  PlayerState,
  Spec,
  UnitCard,
  UpgradeCard,
} from "../types";

import { isPatrolling } from "./patrol";

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

export const isBuilding = (
  card: Card,
): card is BuildingCard => {
  return card.type === "BUILDING";
};

export const isHero = (
  card: Card,
): card is HeroCard => {
  return card.type === "HERO";
};

export const isSpell = (
  card: Card,
): card is AttachmentSpellCard | InstantSpellCard | OngoingSpellCard => {
  return card.type === "ATTACHMENT_SPELL"
    || card.type === "INSTANT_SPELL"
    || card.type === "ONGOING_SPELL";
};

export const isUnit = (
  card: Card,
): card is UnitCard => {
  return card.type === "UNIT";
};

export const isUpgrade = (
  card: Card,
): card is UpgradeCard => {
  return card.type === "UPGRADE";
};

export interface InstanceQuery {
  card?: CardID,
  patrolling?: boolean,
  player?: PlayerID,
  spec?: Spec | Array<Spec>,
  tags?: Array<string>,
  type?: Card["type"] | Array<Card["type"]>,
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

    if (query.patrolling != null && isPatrolling($, I) !== query.patrolling) {
      return false;
    }

    if (query.player != null && I.controller !== query.player) {
      return false;
    }

    if (query.spec != null) {
      if (card.spec == null) {
        return false;
      }

      if (typeof query.spec === "string") {
        if (card.spec !== query.spec) {
          return false;
        }
      } else if (!query.spec.includes(card.spec)) {
        return false;
      }
    }

    if (query.tags?.some(tag => !card.tags.includes(tag))) {
      return false;
    }

    if (query.type != null) {
      if (typeof query.type === "string") {
        if (card.type !== query.type) {
          return false;
        }
      } else if (!query.type.includes(card.type)) {
        return false;
      }
    }

    return true;
  }).map(entry => entry[0]);
};

export const findInstance = (
  $: GameState,
  query: InstanceQuery,
): Instance | null => {
  return getInstance($, queryInstances($, query)[0]);
};
