import { expect } from "chai";
import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";
import { debugAction, makeDefaultGame } from "../testhelper";

describe("upgrades", () => {
  describe("Moss Sentinels", () => {
    let $: GameEngine;
    let P: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
    });

    describe("Rich Earth", () => {
      it.skip("should allow player to buy workers for free", () => {
        createInstance($, P, $.data.lookupCard("Rich Earth"));

        const startingGold = P.gold;
        const startingWorkers = P.workers;

        debugAction($, {
          type: "BUY_WORKER",
          card: P.hand[0],
        });

        expect(P.gold).to.equal(startingGold);
        expect(P.workers).to.equal(startingWorkers + 1);
      });
    });
  });
});
