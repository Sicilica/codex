
import { expect } from "chai";

import { GameEngine } from "../../framework/engine";
import { PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";

import {
  debugAction,
  debugEffect,
  makeDefaultGame,
} from "../testhelper";

describe("basic", () => {
  describe("base", () => {
    let $: GameEngine;
    let P: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
    });

    it("ends the game when killed", () => {
      const base = $.getInstance(P.base);
      if (base == null) {
        throw new Error("failed to find base");
      }

      expect($.state.turnPhase).to.equal("MAIN");

      debugEffect($, {
        type: "DAMAGE",
        sourceCard: null,
        sourceInstance: null,
        target: base.id,
        amount: 20,
      });

      expect($.state.turnPhase).to.equal("GAME_OVER");
    });

    describe("buyWorker()", () => {
      it("should work under normal circumstances", () => {
        const cid = P.hand[0];
        debugAction($, {
          type: "BUY_WORKER",
          card: cid,
        });

        expect(P.workers).to.equal(5);
        expect(P.gold).to.equal(3);
        expect(P.hand.length).to.equal(4);
        expect(P.hand.includes(cid)).to.equal(false);
        expect(P.deck.includes(cid)).to.equal(false);
        expect(P.discard.length).to.equal(0);
        expect(P.hasBuiltWorkerThisTurn).to.equal(true);
      });

      it("should not work without enough gold", () => {
        const cid = P.hand[0];
        P.gold = 0;

        expect(() => debugAction($, {
          type: "BUY_WORKER",
          card: cid,
        })).to.throw("not enough gold");
        expect(P.hasBuiltWorkerThisTurn).to.equal(false);
      });

      it("should not work without the chosen card", () => {
        const cid = P.deck[0];

        expect(() => debugAction($, {
          type: "BUY_WORKER",
          card: cid,
        })).to.throw("card not in hand");
        expect(P.hasBuiltWorkerThisTurn).to.equal(false);
      });

      it("should not work twice per turn", () => {
        const card1 = P.hand[0];
        debugAction($, {
          type: "BUY_WORKER",
          card: card1,
        });

        const card2 = P.hand[0];
        expect(() => debugAction($, {
          type: "BUY_WORKER",
          card: card2,
        })).to.throw("only one worker may be built per turn");
        expect(P.workers).to.equal(5);
      });
    });
  });
});
