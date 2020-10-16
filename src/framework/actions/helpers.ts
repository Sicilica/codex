import { lookupCard } from "../../data";
import { MAX_GOLD } from "../constants";
import { dispatchScopedEvent } from "../events";
import { getCostToTarget } from "../queries/abilities";
import { getPlayer } from "../queries/common";
import { getMaxLevel, isMaxBand } from "../queries/heroes";
import {
  getCurrentArmor,
  getCurrentHealth,
} from "../queries/instance";
import {
  CardID,
  GameState,
  Instance,
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
  return I;
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
  const cost = getCostToTarget(I);
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
  const armor = getCurrentArmor(I);
  if (amount <= armor) {
    I.armorDamage += amount;
    return;
  }

  I.armorDamage += armor;
  I.damage += amount - armor;

  if (getCurrentHealth(I) <= 0) {
    if (attacker != null) {
      dispatchScopedEvent($, attacker, {
        type: "THIS_KILLS_OTHER",
        instance: I,
      });
    }

    delete $.instances[I.id];
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
    dispatchScopedEvent($, I, {
      type: "MAX_LEVEL",
    });
  }
};
