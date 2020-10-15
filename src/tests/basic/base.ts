import { GameState, PlayerState } from "../../framework/types";
import { initDummyGameState } from "../testhelper";
import { buyWorker } from "../../framework/actions/base";
import { expect } from "chai";

describe("basic", () => {
  describe("base", () => {
    let $: GameState;
    let P: PlayerState;

    beforeEach(() => {
      $ = initDummyGameState();
      P = $.players[$.activePlayer];
    });

    describe("buyWorker()", () => {
      it("should work under normal circumstances", () => {
        const cid = P.hand[0];
        buyWorker($, cid);

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

        expect(() => buyWorker($, cid)).to.throw("cannot afford worker");
        expect(P.hasBuiltWorkerThisTurn).to.equal(false);
      });

      it("should not work without the chosen card", () => {
        const cid = P.deck[0];

        expect(() => buyWorker($, cid)).to.throw("card not in hand");
        expect(P.hasBuiltWorkerThisTurn).to.equal(false);
      });

      it("should not work twice per turn", () => {
        const card1 = P.hand[0];
        buyWorker($, card1);

        const card2 = P.hand[0];
        expect(() => buyWorker($, card2)).to.throw("only one worker per turn");
        expect(P.workers).to.equal(5);
      });
    });
  });
});