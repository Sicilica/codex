import { lookupCard } from "../data";
import { performAction } from "../framework/actions";
import { startGame } from "../framework/actions/turn";
import { findInstance } from "../framework/queries/common";
import { createInitialGameState } from "../framework/state/gamestate";
import {
  CardID,
  GameState,
  Instance,
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

export const debugPlayCard = (
  $: GameState,
  cid: CardID,
): void => {
  const card = lookupCard(cid);
  $.players[$.activePlayer].gold += card.cost;
  $.players[$.activePlayer].hand.push(cid);
  performAction($, {
    type: "PLAY_CARD",
    cardID: cid,
    boost: false,
  });
};

export const debugPlayUnit = (
  $: GameState,
  cid: CardID,
): Instance => {
  debugPlayCard($, cid);
  const I = findInstance($, {
    card: cid,
  });
  if (I == null) {
    throw new Error("failed to find played unit");
  }
  return I;
};
