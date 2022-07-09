import { expect } from "chai";
import { hasArrivalFatigue } from "../../framework/accessors";

import { GameEngine } from "../../framework/engine";
import { createInstance, dealDamage } from "../../framework/mutators";
import { InstanceState, PlayerState } from "../../framework/types";
import {
  requireActivePlayer,
} from "../../game/helpers";

import {
  P2,
  debugAction,
  debugAutoResolve,
  debugGotoNextTurn,
  debugValidateEffects,
  makeDefaultGame,
} from "../testhelper";

describe("upgrades", () => {
  describe("red", () => {
    let $: GameEngine;
    let P: PlayerState;
    let oppP: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
      oppP = $.state.players[P2];
    });

    describe("Bloodburn", () => {
      let I: InstanceState;

      beforeEach(() => {
        I = createInstance($, P, $.data.lookupCard("Bloodburn"));
      });

      describe("active ability", () => {
        it("can't be used on its first turn because it doesn't have " +
          "haste", () => {
          expect(hasArrivalFatigue($, I)).to.equal(true);

          I.customRunes.BLOOD = 2;

          expect(
            () => debugAction($, {
              type: "ACTIVATE_ABILITY",
              instance: I.id,
              ability: "Bloodburn #1",
            }),
          ).to.throw("instance cannot attack on the turn it arrived");

          debugGotoNextTurn($, P.id);

          expect(
            () => debugAction($, {
              type: "ACTIVATE_ABILITY",
              instance: I.id,
              ability: "Bloodburn #1",
            }),
          ).not.to.throw();
        });

        it("can't be used without enough blood tokens", () => {
          debugGotoNextTurn($, P.id);
          I.customRunes.BLOOD = 0;

          expect(
            () => debugAction($, {
              type: "ACTIVATE_ABILITY",
              instance: I.id,
              ability: "Bloodburn #1",
            }),
          ).to.throw("insufficient runes");

          I.customRunes.BLOOD = 1;

          expect(
            () => debugAction($, {
              type: "ACTIVATE_ABILITY",
              instance: I.id,
              ability: "Bloodburn #1",
            }),
          ).to.throw("insufficient runes");

          I.customRunes.BLOOD = 2;

          expect(
            () => debugAction($, {
              type: "ACTIVATE_ABILITY",
              instance: I.id,
              ability: "Bloodburn #1",
            }),
          ).not.to.throw();
        });

        it("consumes two blood tokens upon use", () => {
          debugGotoNextTurn($, P.id);
          I.customRunes.BLOOD = 2;

          expect(
            () => debugAction($, {
              type: "ACTIVATE_ABILITY",
              instance: I.id,
              ability: "Bloodburn #1",
            }),
          ).not.to.throw();

          expect(I.customRunes.BLOOD).to.equal(0);
        });

        it("cannot be used twice in one turn", () => {
          const I2 = createInstance(
            $,
            P,
            $.data.lookupCard("Careless Musketeer")
          );

          debugGotoNextTurn($, P.id);
          I.customRunes.BLOOD = 4;

          expect(
            () => debugAction($, {
              type: "ACTIVATE_ABILITY",
              instance: I.id,
              ability: "Bloodburn #1",
            }),
          ).not.to.throw();

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

          expect(
            () => debugAction($, {
              type: "ACTIVATE_ABILITY",
              instance: I.id,
              ability: "Bloodburn #1",
            }),
          ).to.throw("instance is not ready");
        });

        it("should deal one damage to its target", () => {
          const I2 = createInstance(
            $,
            P,
            $.data.lookupCard("Careless Musketeer")
          );

          debugGotoNextTurn($, P.id);
          I.customRunes.BLOOD = 2;

          debugAction($, {
            type: "ACTIVATE_ABILITY",
            instance: I.id,
            ability: "Bloodburn #1",
          });

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

          expect(I2.damage).to.equal(1);
        });

        it.skip("should count as a target effect", () => {
          debugGotoNextTurn($, P.id);
          I.customRunes.BLOOD = 2;

          debugAction($, {
            type: "ACTIVATE_ABILITY",
            instance: I.id,
            ability: "Bloodburn #1",
          });
        });
      });

      describe("passive rune generation", () => {
        let I2: InstanceState;
        let I3: InstanceState;

        beforeEach(() => {
          I = createInstance($, P, $.data.lookupCard("Bloodburn"));
          I2 = createInstance($, P, $.data.lookupCard("Mad Man"));
          I3 = createInstance($, oppP, $.data.lookupCard("Tiger Cub"));
        });

        it("should trigger on ally death", () => {
          dealDamage($, I2, 1, null);
          debugAutoResolve($);

          expect(I.customRunes.BLOOD).to.equal(1);
        });

        it("should trigger on enemy death", () => {
          dealDamage($, I3, 2, null);
          debugAutoResolve($);

          expect(I.customRunes.BLOOD).to.equal(1);
        });

        it("should not grant more than 4 blood runes", () => {
          I.customRunes.BLOOD = 3;

          dealDamage($, I2, 1, null);
          dealDamage($, I3, 2, null);
          debugAutoResolve($);

          expect(I.customRunes.BLOOD).to.equal(4);
        });
      });
    });
  });
});
