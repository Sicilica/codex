
import { expect } from "chai";

import { GameEngine } from "../../framework/engine";
import { removeCardFromHand } from "../../framework/mutators";
import { CardID, PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";

import {
  debugEffect,
  makeDefaultGame,
} from "../testhelper";

const discardAll = (
  $: GameEngine,
  P: PlayerState,
): void => {
  debugEffect($, {
    type: "DISCARD",
    sourceCard: null,
    sourceInstance: null,
    player: P.id,
    amount: P.hand.length,
  });
};

const discardCard = (
  $: GameEngine,
  P: PlayerState,
  cid?: CardID,
): void => {
  if (cid == null) {
    debugEffect($, {
      type: "DISCARD",
      sourceCard: null,
      sourceInstance: null,
      player: P.id,
      amount: 1,
    });
  } else {
    debugEffect($, {
      type: "DISCARD_SELECTED",
      sourceCard: null,
      sourceInstance: null,
      player: P.id,
      card: cid,
    });
  }
};

const drawCard = (
  $: GameEngine,
  P: PlayerState,
): boolean => {
  const initialHandSize = P.hand.length;
  debugEffect($, {
    type: "DRAW",
    sourceCard: null,
    sourceInstance: null,
    player: P.id,
    amount: 1,
  });
  return P.hand.length > initialHandSize;
};

describe("basic", () => {
  describe("hand", () => {
    let $: GameEngine;
    let P: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);

      P.hand = [ "Nautical Dog", "Mad Man", "Bombaster" ];
      P.deck = [
        "Makeshift Rambaster",
        "Bloodrage Ogre",
        "Careless Musketeer",
      ];
    });

    describe("discardAll()", () => {
      it("should discard all of the player's hand into the discard", () => {
        discardAll($, P);

        expect(P.hand.length).to.equal(0);
        expect(P.discard.length).to.equal(3);
      });

      it("should not get rid of existing discarded cards", () => {
        P.discard = [ "Nautical Dog" ];

        discardAll($, P);

        expect(P.hand.length).to.equal(0);
        expect(P.discard.length).to.equal(4);
      });

      it("should not fail if the player's hand is empty", () => {
        P.hand = [];

        discardAll($, P);

        expect(P.hand.length).to.equal(0);
        expect(P.discard.length).to.equal(0);
      });
    });

    describe("discardCard()", () => {
      it("moves cards from hand to discard pile when discarding", () => {
        discardCard($, P, "Nautical Dog");

        expect(P.hand.length).to.equal(2);
        expect(P.hand.includes("Nautical Dog")).to.equal(false);
        expect(P.discard.length).to.equal(1);
        expect(P.discard.includes("Nautical Dog")).to.equal(true);
      });

      it("should only move one copy of the specified card", () => {
        P.hand = [ "Nautical Dog", "Nautical Dog" ];

        discardCard($, P, "Nautical Dog");

        expect(P.hand).to.deep.equal([ "Nautical Dog" ]);
        expect(P.discard.length).to.equal(1);
        expect(P.discard.includes("Nautical Dog")).to.equal(true);
      });

      it.skip("fails to discard when card is not in the player's hand", () => {
        expect(
          () => discardCard($, P, "Careless Musketeer"),
        ).to.throw("card not in hand");

        expect(P.hand.length).to.equal(3);
      });

      it("successfully discards even when no card is specified", () => {
        discardCard($, P);

        expect(P.hand.length).to.equal(2);
        expect(P.discard.length).to.equal(1);
        expect(
          P.hand.includes(P.discard[0])
        ).to.equal(false);
      });

      it("works with repeated specified calls", () => {
        discardCard($, P, "Nautical Dog");
        discardCard($, P, "Mad Man");
        discardCard($, P, "Bombaster");

        expect(P.hand.length).to.equal(0);
        expect(P.discard.length).to.equal(3);
      });

      it("works with repeated unspecified calls", () => {
        discardCard($, P);
        discardCard($, P);
        discardCard($, P);

        expect(P.hand.length).to.equal(0);
        expect(P.discard.length).to.equal(3);
      });

      it.skip("fails to discard when the player's hand is empty", () => {
        discardCard($, P);
        discardCard($, P);
        discardCard($, P);

        expect(() => discardCard($, P)).to.throw("hand is empty");
        expect(() => discardCard($, P, "Mad Man")).to.throw("hand is empty");
      });
    });

    describe("drawCard()", () => {
      it("should work under standard circumstances", () => {
        drawCard($, P);

        expect(P.hand.length).to.equal(4);
        expect(P.hand.includes("Careless Musketeer")).to.equal(true);
        expect(P.deck.length).to.equal(2);
        expect(P.deck.includes("Careless Musketeer")).to.equal(false);
      });

      it.skip("should fail if the deck is empty", () => {
        expect(drawCard($, P)).to.equal(true);
        expect(drawCard($, P)).to.equal(true);
        expect(drawCard($, P)).to.equal(true);

        expect(drawCard($, P)).to.equal(false);
      });

      it("should trigger a shuffle once if the discard is not empty", () => {
        P.discard = [ "Bloodburn" ];

        drawCard($, P);
        drawCard($, P);
        drawCard($, P);

        expect(P.deck.length).to.equal(0);

        drawCard($, P);

        expect(P.hand.length).to.equal(7);
        expect(P.hand.includes("Bloodburn")).to.equal(true);
        expect(P.hasShuffledThisTurn).to.equal(true);
      });

      it("should not allow two shuffles in one turn", () => {
        P.discard = [ "Bloodburn" ];
        P.hasShuffledThisTurn = true;

        expect(drawCard($, P)).to.equal(true);
        expect(drawCard($, P)).to.equal(true);
        expect(drawCard($, P)).to.equal(true);

        expect(drawCard($, P)).to.equal(false);
      });
    });

    describe("removeFromHand()", () => {
      it("should remove the given card if it is in hand", () => {
        expect(P.hand.includes("Nautical Dog")).to.equal(true);
        expect(P.hand.length).to.equal(3);

        removeCardFromHand(P, "Nautical Dog");

        expect(P.hand.includes("Nautical Dog")).to.equal(false);
        expect(P.hand.length).to.equal(2);
      });

      it("should fail if the card is not in hand", () => {
        expect(P.hand.includes("Careless Musketeer")).to.equal(false);
        expect(P.hand.length).to.equal(3);

        removeCardFromHand(P, "Careless Musketeer");

        expect(P.hand.includes("Careless Musketeer")).to.equal(false);
        expect(P.hand.length).to.equal(3);
      });
    });
  });
});
