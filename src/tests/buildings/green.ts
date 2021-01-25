import { expect } from "chai";
import { GameEngine } from "../../framework/engine";
import { PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";
import {
  P1,
  debugAction,
  debugGotoNextTurn,
  debugPlayCard,
  debugPlayUnit,
  makeDefaultGame,
} from "../testhelper";

describe("buildings", () => {
  describe("Moss Sentinels", () => {
    let $: GameEngine;
    let P: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
    });

    describe("Verdant Tree", () => {
      it.skip("should apply to existing tech buildings", () => {
        P.workers = 6;

        debugAction($, {
          type: "PURCHASE_TECH_BUILDING",
        });

        expect(
          () => debugPlayCard($, "Gemscout Owl")
        ).to.throw("tech building is still being built");

        const tree = debugPlayUnit($, "Verdant Tree");
        tree.arrivalFatigue = false;

        debugAction($, {
          type: "ACTIVATE_ABILITY",
          instance: tree.id,
          ability: `${tree.card} #1`,
        });

        // debugValidateEffects($);

        expect(() => debugPlayCard($, "Gemscout Owl")).to.not.throw();
      });

      it.skip(
        "should apply to tech buildings purchased after its ability has " +
          "been used",
        () => {
          P.workers = 6;

          const tree = debugPlayUnit($, "Verdant Tree");
          tree.arrivalFatigue = false;

          expect(
            () => debugPlayCard($, "Gemscout Owl")
          ).to.throw("missing tech building");

          debugAction($, {
            type: "ACTIVATE_ABILITY",
            instance: tree.id,
            ability: `${tree.card} #1`,
          });

          // debugValidateEffects($);

          debugAction($, {
            type: "PURCHASE_TECH_BUILDING",
          });

          expect(() => debugPlayCard($, "Gemscout Owl")).to.not.throw();
        }
      );

      it.skip(
        "should continue to apply even if it is removed from play",
        () => {
          expect(false).to.equal(true);

          /**
           * There has been a nontrivial amount of discussion about this case.
           * We may need to entirely rethink how we are doing this action. At
           * the very least, it is worth considering setting a property on the
           * base's memory. A combination of the tree setting haste on tech
           * buildings already in play and the base having a special
           * ON_OTHER_ARRIVES that grants haste when a particular value is in
           * the base's memory sounds like it would suffice, but it also
           * sounds potentially unnecessarily complicated. Revisit this
           * behavior once the engine is more fully implemented.
           *
           * https://discord.com/channels/697950475902779432
           *  /730947872903921665/803325381415272448
           */
        }
      );

      it("should have Healing 1", () => {
        debugPlayCard($, "Verdant Tree");
        const tiger = debugPlayUnit($, "Tiger Cub");

        tiger.damage = 1;

        debugGotoNextTurn($, P1);

        expect(tiger.damage).to.equal(0);
      });
    });
  });
});
