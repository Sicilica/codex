import { GameState } from "../types";

export const endTurn = (
  $: GameState,
): void => {
  const pids = Object.keys($.players);
  const currentIndex = pids.indexOf($.activePlayer);
  $.activePlayer = pids[(currentIndex + 1) % pids.length];

  for (const I of Object.values($.instances)) {
    I.arrivalFatigue = false;
  }
};
