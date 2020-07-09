import { GameState } from "../../framework/types";
import { P1, initDummyGameState } from "../testhelper";
import {
  discardAll,
  discardCard,
  drawCard,
} from "../../framework/actions/hand";
import { expect } from "chai";

describe("basic", () => {
  describe("hand", () => {
    let $: GameState;
    beforeEach(() => {
      $ = initDummyGameState();
      $.players[P1].hand = [ "Nautical Dog", "Mad Man", "Bombaster" ];
      $.players[P1].deck = [
        "Careless Musketeer",
        "Bloodrage Ogre",
        "Makeshift Rambaster",
      ];
    });

    describe("discardAll()", () => {
      it("should discard all of the player's hand into the discard", () => {
        discardAll($);

        expect($.players[P1].hand.length).to.equal(0);
        expect($.players[P1].discard.length).to.equal(3);
      });

      it("should not get rid of existing discarded cards", () => {
        $.players[P1].discard = [ "Nautical Dog" ];

        discardAll($);

        expect($.players[P1].hand.length).to.equal(0);
        expect($.players[P1].discard.length).to.equal(4);
      });

      it("should not fail if the player's hand is empty", () => {
        $.players[P1].hand = [];

        discardAll($);

        expect($.players[P1].hand.length).to.equal(0);
        expect($.players[P1].discard.length).to.equal(0);
      });
    });

    describe("discardCard()", () => {
      it("moves cards from hand to discard pile when discarding", () => {
        discardCard($, "Nautical Dog");

        expect($.players[P1].hand.length).to.equal(2);
        expect($.players[P1].hand.indexOf("Nautical Dog")).to.equal(-1);
        expect($.players[P1].discard.length).to.equal(1);
        expect($.players[P1].discard.indexOf("Nautical Dog")).to.equal(0);
      });

      it("should only move one copy of the specified card", () => {
        $.players[P1].hand = [ "Nautical Dog", "Nautical Dog" ];

        discardCard($, "Nautical Dog");

        expect($.players[P1].hand.length).to.equal(1);
        expect($.players[P1].hand.indexOf("Nautical Dog")).to.equal(0);
        expect($.players[P1].discard.length).to.equal(1);
        expect($.players[P1].discard.indexOf("Nautical Dog")).to.equal(0);
      });

      it("fails to discard when card is not in the player's hand", () => {
        expect(() =>
          discardCard($, "Careless Musketeer")).to.throw("card not in hand");

        expect($.players[P1].hand.length).to.equal(3);
      });

      it("successfully discards even when no card is specified", () => {
        discardCard($);

        expect($.players[P1].hand.length).to.equal(2);
        expect($.players[P1].discard.length).to.equal(1);
        expect(
          $.players[P1].hand.indexOf($.players[P1].discard[0])
        ).to.equal(-1);
      });

      it("works with repeated specified calls", () => {
        discardCard($, "Nautical Dog");
        discardCard($, "Mad Man");
        discardCard($, "Bombaster");

        expect($.players[P1].hand.length).to.equal(0);
        expect($.players[P1].discard.length).to.equal(3);
      });

      it("works with repeated unspecified calls", () => {
        discardCard($);
        discardCard($);
        discardCard($);

        expect($.players[P1].hand.length).to.equal(0);
        expect($.players[P1].discard.length).to.equal(3);
      });

      it("fails to discard when the player's hand is empty", () => {
        discardCard($);
        discardCard($);
        discardCard($);

        expect(() => discardCard($)).to.throw("hand is empty");
        expect(() => discardCard($, "Mad Man")).to.throw("hand is empty");
      });
    });

    describe("drawCard()", () => {
      it("should work under standard circumstances", () => {
        drawCard($);

        expect($.players[P1].hand.length).to.equal(4);
        expect($.players[P1].hand.indexOf("Careless Musketeer")).to.equal(3);
        expect($.players[P1].deck.length).to.equal(2);
        expect($.players[P1].deck.indexOf("Careless Musketeer")).to.equal(-1);
      });

      it("should fail if the deck is empty", () => {
        drawCard($);
        drawCard($);
        drawCard($);

        expect(() => drawCard($)).to.throw("deck is empty");
      });

      it("should trigger a shuffle once if the discard is not empty", () => {
        $.players[P1].discard = [ "Bloodburn" ];

        drawCard($);
        drawCard($);
        drawCard($);

        expect($.players[P1].deck.length).to.equal(0);

        drawCard($);

        expect($.players[P1].hand.length).to.equal(7);
        expect($.players[P1].hand.indexOf("Bloodburn")).to.equal(6);
        expect($.players[P1].hasShuffledThisTurn).to.equal(true);
      });

      it("should not allow two shuffles in one turn", () => {
        $.players[P1].discard = [ "Bloodburn" ];
        $.players[P1].hasShuffledThisTurn = true;

        drawCard($);
        drawCard($);
        drawCard($);

        expect(() => drawCard($)).to.throw("deck is empty");
      });
    });
  });
});
