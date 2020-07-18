import { performAction } from "../framework/actions";
import { makeInstance } from "../framework/actions/helpers";
import {
  GameState,
  PlayerID,
  PlayerState,
  Spec,
} from "../framework/types";

export const P1 = "P1";
export const P2 = "P2";

export const initDummyGameState: () => GameState = () => {
  const $: GameState = {
    firstPlayer: P1,
    round: 1,
    activePlayer: P1,
    turnPhase: "MAIN",
    instances: {},
    nextID: 100,
    players: {},
  };

  $.players = {
    [P1]: generatePlayer($, P1, [ "ANARCHY", "BLOOD", "FIRE" ], true),
    [P2]: generatePlayer($, P2, [ "BALANCE", "FERAL", "GROWTH" ]),
  };

  return $;
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

const generatePlayer = (
  $: GameState,
  pid: string,
  specs: [Spec, Spec, Spec],
  first = false
): PlayerState => {
  const base = makeInstance($, pid, "$BASE");

  return {
    id: pid,
    addon: null,
    techLabSpec: null,
    base: base.id,
    workers: first ? 4 : 5,
    gold: 0,
    specs,
    mainSpec: null,
    hand: [],
    discard: [],
    deck: [],
    canSkipTech: false,
    hasShuffledThisTurn: false,
    hasBuiltWorkerThisTurn: false,
    patrol: {
      squadLeader: null,
      elite: null,
      scavenger: null,
      technician: null,
      lookout: null,
    },
    techBuildings: [ null, null, null ],
    purchasedTechBuildings: 0,
  };
};
