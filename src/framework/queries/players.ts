import { GameState, PlayerID } from "../types";

import { findInstance } from "./common";

export const getOpponents = (
  $: GameState,
  pid: PlayerID,
): Array<PlayerID> => {
  return Object.keys($.players).filter(opponentPID => opponentPID !== pid);
};

export const hasDetection = (
  $: GameState,
  pid: PlayerID,
): boolean => {
  return findInstance($, {
    keywords: [ "DETECTOR" ],
    player: pid,
  }) != null;
};
