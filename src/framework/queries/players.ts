import { GameState, PlayerID } from "../types";

export const getOpponents = (
  $: GameState,
  pid: PlayerID,
): Array<PlayerID> => {
  return Object.keys($.players).filter(opponentPID => opponentPID !== pid);
};
