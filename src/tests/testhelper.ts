import { performAction } from "../framework/actions";
import { startGame } from "../framework/actions/turn";
import { createInitialGameState } from "../framework/state/gamestate";
import {
  GameState,
  PlayerID,
} from "../framework/types";

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

export const debugGotoNextTurn = (
  $: GameState,
  pid: PlayerID,
): void => {
  for (let i = 0; i < Object.keys($.players).length; i++) {
    const P = $.players[$.activePlayer];
    while (P.deck.length < 2) {
      P.deck.push("Nautical Dog");
    }

    performAction($, {
      type: "END_TURN",
    });

    if ($.turnPhase === "TECH") {
      performAction($, {
        type: "TECH",
        cards: [ "Crash Bomber", "Firebat" ],
      });
    }

    if ($.activePlayer === pid) {
      return;
    }
  }
  throw new Error("unknown player");
};
