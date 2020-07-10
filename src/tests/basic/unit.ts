import { expect } from "chai";

import { performAction } from "../../framework/actions";
import { canAttack, canPatrol } from "../../framework/queries/combat";

import {
  GameState,
  PlayerID,
} from "../../framework/types";
import { P1, debugPlayUnit, initDummyGameState } from "../testhelper";

const debugGotoNextTurn = (
  $: GameState,
  pid: PlayerID,
) => {
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

describe("basic", () => {
  let $: GameState;
  beforeEach(() => {
    $ = initDummyGameState();
  });
  describe("unit", () => {
    it("can't attack when first played", () => {
      const iid = debugPlayUnit($, "Nautical Dog");

      expect(canAttack($, iid)).to.equal(false);
    });

    it("can attack the turn after it's played", () => {
      const iid = debugPlayUnit($, "Nautical Dog");
      debugGotoNextTurn($, P1);

      expect(canAttack($, iid)).to.equal(true);
    });

    it("can patrol when first played", () => {
      const iid = debugPlayUnit($, "Nautical Dog");

      expect(canPatrol($, iid)).to.equal(true);
    });
  });
});
