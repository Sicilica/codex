import { expect } from "chai";
import { getAttribute } from "../../framework/accessors";
import { MAX_HAND_SIZE } from "../../framework/constants";

import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { InstanceState, PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";

import {
  P2,
  debugAction,
  debugAutoResolve,
  debugGotoNextTurn,
  debugValidateEffects,
  makeDefaultGame,
} from "../testhelper";

describe("units", () => {
  describe("Moss Sentinels", () => {
    let $: GameEngine;
    let P: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
    });

    describe("Ironbark Treant", () => {
      let I: InstanceState;

      beforeEach(() => {
        I = createInstance($, P, $.data.lookupCard("Ironbark Treant"));
      });

      it("has -2 attack / +2 armor while patrolling", () => {
        expect(getAttribute($, I, "ATTACK")).to.equal(3);
        expect(getAttribute($, I, "ARMOR")).to.equal(0);

        debugGotoNextTurn($, P2);

        expect(getAttribute($, I, "ATTACK")).to.equal(3);
        expect(getAttribute($, I, "ARMOR")).to.equal(0);

        // WIP
        // continuousModifiers are not fully supported

        // P.patrol["SQUAD_LEADER"] = I.id;

        // expect(getAttribute($, I, "ATTACK")).to.equal(1);
        // expect(getAttribute($, I, "ARMOR")).to.equal(3);
      });
    });

    describe("Merfolk Prospector", () => {
      let I: InstanceState;

      beforeEach(() => {
        I = createInstance($, P, $.data.lookupCard("Merfolk Prospector"));
      });

      it("grants one gold when exhausted", () => {
        I.arrivalFatigue = false;
        const before = P.gold;

        debugAction(
          $,
          {
            type: "ACTIVATE_ABILITY",
            instance: I.id,
            ability: `${I.card} #1`,
          }
        );

        expect(P.gold).to.equal(before + 1);
        expect(I.readyState).to.equal("EXHAUSTED");
      });
    });

    describe("Spore Shambler", () => {
      let I: InstanceState;

      beforeEach(() => {
        I = createInstance($, P, $.data.lookupCard("Spore Shambler"));
        I.arrivalFatigue = false;
        debugAutoResolve($);
      });

      it("arrives with 2 +1/+1 runes", () => {
        expect(I.plusMinusRunes).to.equal(2);
      });

      it("can give a +1/+1 rune to an ally unit by exhausting", () => {
        const I2 = createInstance($, P, $.data.lookupCard("Tiger Cub"));

        debugAction(
          $,
          {
            type: "ACTIVATE_ABILITY",
            instance: I.id,
            ability: `${I.card} #1`,
          }
        );

        debugValidateEffects($);
        expect($.state.unresolvedEffects.length).to.equal(1);
        const effectID = $.state.unresolvedEffects[0].id;

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID,
          params: {
            target: I2.id,
          },
        });

        expect(I.plusMinusRunes).to.equal(1);
        expect(I.readyState).to.equal("EXHAUSTED");
        expect(I2.plusMinusRunes).to.equal(1);
      });

      it("can give a +1/+1 rune to an ally unit by paying gold", () => {
        const I2 = createInstance($, P, $.data.lookupCard("Tiger Cub"));

        debugAction(
          $,
          {
            type: "ACTIVATE_ABILITY",
            instance: I.id,
            ability: `${I.card} #2`,
          }
        );

        debugValidateEffects($);
        expect($.state.unresolvedEffects.length).to.equal(1);
        const effectID = $.state.unresolvedEffects[0].id;

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID,
          params: {
            target: I2.id,
          },
        });

        expect(P.gold).to.equal(3);
        expect(I.plusMinusRunes).to.equal(1);
        expect(I.readyState).to.equal("READY");
        expect(I2.plusMinusRunes).to.equal(1);

        // Can trigger more than once:

        debugAction(
          $,
          {
            type: "ACTIVATE_ABILITY",
            instance: I.id,
            ability: `${I.card} #2`,
          }
        );

        debugValidateEffects($);
        expect($.state.unresolvedEffects.length).to.equal(1);
        const effectID2 = $.state.unresolvedEffects[0].id;

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID2,
          params: {
            target: I2.id,
          },
        });

        expect(P.gold).to.equal(2);
        expect(I.plusMinusRunes).to.equal(0);
        expect(I.readyState).to.equal("READY");
        expect(I2.plusMinusRunes).to.equal(2);
      });

      it("cannot give +1/+1 runes to heroes", () => {
        const I2 = createInstance($, P, $.data.lookupCard("Master Midori"));
        createInstance($, P, $.data.lookupCard("Tiger Cub"));

        debugAction(
          $,
          {
            type: "ACTIVATE_ABILITY",
            instance: I.id,
            ability: `${I.card} #1`,
          }
        );

        debugValidateEffects($);
        expect($.state.unresolvedEffects.length).to.equal(1);
        const effectID = $.state.unresolvedEffects[0].id;

        expect(() => debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID,
          params: {
            target: I2.id,
          },
        })).to.throw("invalid params for effect: invalid param [target]");
      });
    });

    describe("Young Treant", () => {
      let oppP: PlayerState;
      let I: InstanceState;
      let oppI: InstanceState;

      beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        oppP = $.getPlayer(P2)!;
        I = createInstance($, P, $.data.lookupCard("Young Treant"));
        oppI = createInstance($, oppP, $.data.lookupCard("Tiger Cub"));
        I.arrivalFatigue = false;
        debugAutoResolve($);
      });

      it("causes the player to draw a card upon being played", () => {
        expect(P.hand.length).to.equal(MAX_HAND_SIZE + 1);
      });

      it("cannot attack", () => {
        expect(() => debugAction($, {
          type: "ATTACK",
          attacker: I.id,
          defender: oppI.id,
        })).to.throw("instance is not allowed to attack");
      });

      it("can counter attack", () => {
        I.plusMinusRunes = 1;

        debugGotoNextTurn($, P2);

        debugAction($, {
          type: "ATTACK",
          attacker: oppI.id,
          defender: I.id,
        });

        expect(oppI.damage).to.equal(1);
      });
    });
  });
});
