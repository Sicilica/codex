import { MAX_GOLD } from "../constants";
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
    id: `${$.nextID++}`,
    owner: pid,
    controller: pid,
    card: cid,
    damage: 0,
    plusMinusTokens: 0,
    level: 0,
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
