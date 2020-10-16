import { MAX_GOLD } from "../constants";
import { getCostToTarget } from "../queries/abilities";
import { getPlayer } from "../queries/common";
import {
  CardID,
  GameState,
  Instance,
  InstanceID,
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
    level: 0,
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
  attacker?: InstanceID,
): void => {
  // TODO
};
