import { GameState } from "../framework/types";
import { createInitialGameState } from "../framework/state/gamestate";
import { startGame } from "../framework/actions/turn";

export const P1 = "P1";
export const P2 = "P2";

export const initDummyGameState = (): GameState => {
  const gameState = createInitialGameState([
    {
      starterDeckSpec: "ANARCHY",
      otherSpecs: [ "BLOOD", "FIRE" ],
    }, {
      starterDeckSpec: "BALANCE",
      otherSpecs: [ "FERAL", "GROWTH" ],
    },
  ]);

  startGame(gameState);

  return gameState;
};
