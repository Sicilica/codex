import {
  CardID,
  GameState,
  Instance,
  PlayerID,
} from "../types";

export const makeInstance = (
  $: GameState,
  pid: PlayerID,
  cid: CardID,
): Instance => {
  const I: Instance = {
    id: `I${$.nextID++}`,
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
