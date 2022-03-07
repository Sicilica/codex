import { expect } from "chai";

import { canPerformAttack } from "../../framework/accessors";
import { GameEngine } from "../../framework/engine";

import {
  debugPlayCard,
  debugPlayUnit,
  makeDefaultGame,
} from "../testhelper";

describe("abilities", () => {
  describe("simple_keywords", () => {
    let $: GameEngine;

    beforeEach(() => {
      $ = makeDefaultGame();
    });

    describe("HASTE", () => {
      it("lets units attack on the turn they are played", () => {
        const I = debugPlayUnit($, "Mad Man");
        expect(canPerformAttack($, I)).to.equal(true);
      });

      it("overrides arrival fatigue even when applied on the same turn as " +
          "arriving", () => {
        debugPlayUnit($, "Jaina Stormborne");
        const I = debugPlayUnit($, "Bloodrage Ogre");
        expect(canPerformAttack($, I)).to.equal(false);

        debugPlayCard($, "Charge");
        expect(canPerformAttack($, I)).to.equal(true);
      });
    });
  });
});
