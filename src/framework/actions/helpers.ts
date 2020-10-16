import { lookupCard } from "../../data";
import { MAX_GOLD } from "../constants";
import { dispatchEventToInstance, dispatchGlobalEvent } from "../events";
import { getCostToTarget } from "../queries/abilities";
import { getPlayer, isHero, isUnit } from "../queries/common";
import { getMaxLevel, isMaxBand } from "../queries/heroes";
import {
  getCurrentArmor,
  getCurrentHealth,
} from "../queries/instance";
import {
  CardID,
  GameState,
  Instance,
  PatrolSlot,
  PlayerID,
  PlayerState,
} from "../types";

export const makeInstance = (
  $: GameState,
  pid: PlayerID,
  cid: CardID,
): Instance => {
  const I: Instance = {
    id: `I${$.nextInstanceID++}`,
    owner: pid,
    controller: pid,
    card: cid,
    damage: 0,
    plusMinusTokens: 0,
    level: 1,
    startedTurnAtMaxBand: false,
    attachments: [],
    armorDamage: 0,
    specialTokens: [],
    readyState: "READY",
    arrivalFatigue: true,
  };
  $.instances[I.id] = I;

  dispatchEventToInstance($, I, {
    type: "THIS_ARRIVES",
  });

  return I;
};

export const killInstance = (
  $: GameState,
  I: Instance,
): void => {
  dispatchGlobalEvent($, {
    type: "INSTANCE_DIES",
    instance: I,
  });

  dispatchEventToInstance($, I, {
    type: "THIS_DIES",
  });

  delete $.instances[I.id];

  const P = getPlayer($, I.controller);
  if (P != null) {
    for (const slot in P.patrol) {
      if (P.patrol[slot as PatrolSlot] === I.id) {
        P.patrol[slot as PatrolSlot] = null;
      }
    }
    for (const idx in P.techBuildings) {
      if (P.techBuildings[idx] === I.id) {
        P.techBuildings[idx] = null;
      }
    }
  }

  discardInstance($, I);
};

export const discardInstance = (
  $: GameState,
  I: Instance,
): void => {
  const card = lookupCard(I.card);

  if (isHero(card)) {
    // TODO hero should be marked as unavailable
    return;
  }
  if (isUnit(card) && card.token) {
    return;
  }

  const P = getPlayer($, I.owner);
  if (P != null) {
    P.discard.push(I.card);
  }
};

export const returnInstanceToHand = (
  $: GameState,
  I: Instance,
): void => {
  const card = lookupCard(I.card);

  if (isHero(card)) {
    // TODO hero should be marked as available
    return;
  }
  if (isUnit(card) && card.token) {
    return;
  }

  const P = getPlayer($, I.owner);
  if (P != null) {
    P.hand.push(I.card);
  }
};

export const giveGold = (
  P: PlayerState,
  amount: number,
): void => {
  P.gold = Math.min(P.gold + amount, MAX_GOLD);
};

export const reduceGold = (
  P: PlayerState,
  amount: number,
): void => {
  P.gold = Math.max(P.gold - amount, 0);
};

export const targetInstance = (
  $: GameState,
  I: Instance,
): void => {
  const cost = getCostToTarget($, I);
  const P = getPlayer($, $.activePlayer);
  if (P == null || cost > P?.gold) {
    throw new Error("insufficient gold to target instance");
  }
  reduceGold(P, cost);
};

export const dealDamage = (
  $: GameState,
  I: Instance,
  amount: number,
  attacker?: Instance,
): void => {
  const armor = getCurrentArmor($, I);
  if (amount <= armor) {
    I.armorDamage += amount;
    return;
  }

  I.armorDamage += armor;
  I.damage += amount - armor;

  if (getCurrentHealth(I) <= 0) {
    if (attacker != null) {
      dispatchEventToInstance($, attacker, {
        type: "THIS_KILLS_OTHER",
        instance: I,
      });
    }

    killInstance($, I);
  }
};

export const giveLevels = (
  $: GameState,
  I: Instance,
  amount: number,
): void => {
  const initialLevel = I.level;
  I.level = Math.min(I.level + amount, getMaxLevel(lookupCard(I.card)));

  if (initialLevel < I.level && isMaxBand(I)) {
    dispatchEventToInstance($, I, {
      type: "MAX_LEVEL",
    });
  }
};
