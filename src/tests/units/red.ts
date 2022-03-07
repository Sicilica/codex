import { expect } from "chai";
import { hasArrivalFatigue } from "../../framework/accessors";

import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { InstanceState, PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";

import {
  P1,
  P2,
  debugAction,
  debugAutoResolve,
  debugGotoNextTurn,
  debugPlayCard,
  makeDefaultGame,
} from "../testhelper";

const inPlay = (
  $: GameEngine,
  I: InstanceState,
): boolean => {
  return $.getInstance(I.id) === I;
};

describe("units", () => {
  describe("red", () => {
    let $: GameEngine;
    let P: PlayerState;
    let oppP: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
      oppP = $.state.players[P2];
    });

    describe("Bloodrage Ogre", () => {
      let I: InstanceState;

      beforeEach(() => {
        I = createInstance($, P, $.data.lookupCard("Bloodrage Ogre"));
      });

      it("returns AFTER the draw/discard phase", () => {
        I._arrivalFatigue = false;

        debugGotoNextTurn($, P2);
        expect(inPlay($, I)).to.equal(false);
        expect(P.hand.length).to.equal(6);
        expect(P.deck.length).to.equal(0);
        expect(P.discard.length).to.equal(5);
        expect(P.hand.includes("Bloodrage Ogre")).to.equal(true);
      });

      it("only returns on its controller's turn", () => {
        debugGotoNextTurn($, P2);
        expect(inPlay($, I)).to.equal(true);

        I._arrivalFatigue = false;
        I.owner = P2;

        debugGotoNextTurn($, P1);
        expect(inPlay($, I)).to.equal(true);

        debugGotoNextTurn($, P2);
        expect(inPlay($, I)).to.equal(false);
      });

      it("doesn't return if it attacks that turn", () => {
        I._arrivalFatigue = false;
        const oppI = createInstance(
          $,
          oppP,
          $.data.lookupCard("Young Treant")
        );
        debugAutoResolve($);

        debugAction($, {
          type: "ATTACK",
          attacker: I.id,
          defender: oppI.id,
        });

        debugGotoNextTurn($, P2);
        expect(inPlay($, I)).to.equal(true);
      });

      it(
        "doesn't return on its first turn if it has haste but doesn't attack",
        () => {
          debugPlayCard($, "Captain Zane");
          debugPlayCard($, "Charge");
          expect(hasArrivalFatigue($, I)).to.equal(false);

          debugGotoNextTurn($, P2);
          expect(inPlay($, I)).to.equal(true);
        }
      );
    });
  });
});
