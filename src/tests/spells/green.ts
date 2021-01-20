import { expect } from "chai";
import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { InstanceState, PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";
import {
  P2,
  debugAction,
  debugPlayCard,
  makeDefaultGame,
} from "../testhelper";

describe("spells", () => {
  describe("Moss Sentinels", () => {
    let $: GameEngine;
    let P: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
    });

    describe("Forest's Favor", () => {
      let midori: InstanceState;

      beforeEach(() => {
        midori = createInstance(
          $,
          P,
          $.data.lookupCard("Master Midori")
        );
      });

      it(
        "should only work on units who do not currently have a +1/+1 rune",
        () => {
          const tiger = createInstance($, P, $.data.lookupCard("Tiger Cub"));

          debugPlayCard($, "Forest's Favor", false);
          expect($.state.unresolvedEffects.length).to.equal(1);
          let eid = $.state.unresolvedEffects[0].id;

          debugAction($, {
            type: "RESOLVE_EFFECT",
            effect: eid,
            params: {
              target: tiger.id,
            },
          });

          expect(tiger.plusMinusRunes).to.equal(1);

          debugPlayCard($, "Forest's Favor", false);
          expect($.state.unresolvedEffects.length).to.equal(1);
          eid = $.state.unresolvedEffects[0].id;

          expect(() => {
            debugAction($, {
              type: "RESOLVE_EFFECT",
              effect: eid,
              params: {
                target: tiger.id,
              },
            });
          }).to.throw("invalid params for effect: invalid param [target]");

          expect(tiger.plusMinusRunes).to.equal(1);
        }
      );

      it(
        "should only work on heroes who do not currently have a +1/+1 rune",
        () => {
          debugPlayCard($, "Forest's Favor", false);
          expect($.state.unresolvedEffects.length).to.equal(1);
          let eid = $.state.unresolvedEffects[0].id;

          debugAction($, {
            type: "RESOLVE_EFFECT",
            effect: eid,
            params: {
              target: midori.id,
            },
          });

          expect(midori.plusMinusRunes).to.equal(1);

          debugPlayCard($, "Forest's Favor", false);
          expect($.state.unresolvedEffects.length).to.equal(1);
          eid = $.state.unresolvedEffects[0].id;

          expect(() => {
            debugAction($, {
              type: "RESOLVE_EFFECT",
              effect: eid,
              params: {
                target: midori.id,
              },
            });
          }).to.throw("invalid params for effect: invalid param [target]");

          expect(midori.plusMinusRunes).to.equal(1);
        }
      );

      it("should not be playable on buildings or upgrades", () => {
        const building = createInstance(
          $,
          P,
          $.data.lookupCard("Verdant Tree")
        );
        const upgrade = createInstance($, P, $.data.lookupCard("Rich Earth"));

        debugPlayCard($, "Forest's Favor", false);
        expect($.state.unresolvedEffects.length).to.equal(1);
        const eid = $.state.unresolvedEffects[0].id;

        expect(() => {
          debugAction($, {
            type: "RESOLVE_EFFECT",
            effect: eid,
            params: {
              target: building.id,
            },
          });
        }).to.throw("invalid params for effect: invalid param [target]");

        expect(() => {
          debugAction($, {
            type: "RESOLVE_EFFECT",
            effect: eid,
            params: {
              target: upgrade.id,
            },
          });
        }).to.throw("invalid params for effect: invalid param [target]");
      });

      it("should not be playable on opponent units", () => {
        const oppP = $.state.players[P2];
        const tiger = createInstance($, oppP, $.data.lookupCard("Tiger Cub"));

        debugPlayCard($, "Forest's Favor", false);
        expect($.state.unresolvedEffects.length).to.equal(1);
        const eid = $.state.unresolvedEffects[0].id;

        expect(() => {
          debugAction($, {
            type: "RESOLVE_EFFECT",
            effect: eid,
            params: {
              target: tiger.id,
            },
          });
        }).to.throw("invalid params for effect: invalid param [target]");
      });
    });
  });
});
