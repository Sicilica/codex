import {
  GameState,
  Instance,
  PlayerID,
  CardID,
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
    readyState: 'READY',
    arrivalFatigue: true,
  };
  $.instances[I.id] = I;
  return I;
};
