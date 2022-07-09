import { expect } from "chai";
import { getAttribute, hasArrivalFatigue } from "../../framework/accessors";

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

    describe("Bombaster", () => {
      let I: InstanceState;

      beforeEach(() => {
        I = createInstance($, P, $.data.lookupCard("Bombaster"));
      });

      it("is a pirate", () => {
        // eslint-disable-next-line no-unused-expressions
        expect(
          $.findInstance({
            player: P.id,
            tags: [ "PIRATE" ],
          })
        ).to.not.be.null;
      });

      describe("active ability", () => {
        it("requires enough gold", () => {
          P.gold = 0;

          expect(
            () => debugAction($, {
              type: "ACTIVATE_ABILITY",
              instance: I.id,
              ability: `${I.card} #1`,
            })
          ).to.throw("not enough gold");
        });

        it("works as expected", () => {
          const I2 = createInstance($, oppP, $.data.lookupCard("Tiger Cub"));

          const startingGold = P.gold;

          oppP.patrol.ELITE = I2.id;

          debugAction($, {
            type: "ACTIVATE_ABILITY",
            instance: I.id,
            ability: `${I.card} #1`,
          });

          debugAutoResolve($);

          expect(P.gold).to.equal(startingGold - 1);
          expect(I2.damage).to.equal(2);

          // eslint-disable-next-line no-unused-expressions
          expect($.getInstance(I.id)).to.be.undefined;
        });

        it("can only target patrolling units", () => {
          const oppI = createInstance($, oppP, $.data.lookupCard("Tiger Cub"));
          const oppI2 =
            createInstance($, oppP, $.data.lookupCard("Tiger Cub"));
          const oppI3 =
            createInstance($, oppP, $.data.lookupCard("Tiger Cub"));
          oppP.patrol.ELITE = oppI2.id;
          oppP.patrol.SCAVENGER = oppI3.id;

          const startingGold = P.gold;

          debugAction($, {
            type: "ACTIVATE_ABILITY",
            instance: I.id,
            ability: `${I.card} #1`,
          });

          expect($.state.unresolvedEffects.length).to.equal(2);
          const eid = $.state.unresolvedEffects[1].id;

          expect(
            () => debugAction($, {
              type: "RESOLVE_EFFECT",
              effect: eid,
              params: {
                target: oppI.id,
              },
            })
          ).to.throw("invalid params for effect");

          debugAction($, {
            type: "RESOLVE_EFFECT",
            effect: eid,
            params: {
              target: oppI2.id,
            },
          });

          debugAutoResolve($);

          expect(P.gold).to.equal(startingGold - 1);
          expect(oppI.damage).to.equal(0);
          expect(oppI2.damage).to.equal(2);
          expect(oppI3.damage).to.equal(0);

          // eslint-disable-next-line no-unused-expressions
          expect($.getInstance(I.id)).to.be.undefined;
        });

        it.skip("triggers targeting effects");
      });
    });

    describe("Nautical Dog", () => {
      let I: InstanceState;

      beforeEach(() => {
        I = createInstance($, P, $.data.lookupCard("Nautical Dog"));
      });

      it("has +1 ATK on your turn", () => {
        expect(getAttribute($, I, "ATTACK")).to.equal(2);

        debugGotoNextTurn($, P2);

        expect(getAttribute($, I, "ATTACK")).to.equal(1);
      });
    });
  });
});
