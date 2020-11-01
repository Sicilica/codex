import { expect } from "chai";

import { canPatrol, canPerformAttack } from "../../framework/accessors";
import { GameEngine } from "../../framework/engine";

import {
  P1,
  debugGotoNextTurn,
  debugPlayUnit,
  makeDefaultGame,
} from "../testhelper";

describe("basic", () => {
  describe("unit", () => {
    let $: GameEngine;
    beforeEach(() => {
      $ = makeDefaultGame();
    });

    it("can't attack when first played", () => {
      const I = debugPlayUnit($, "Nautical Dog");

      expect(canPerformAttack($, I)).to.equal(false);
    });

    it("can attack the turn after it's played", () => {
      const I = debugPlayUnit($, "Nautical Dog");
      debugGotoNextTurn($, P1);

      expect(canPerformAttack($, I)).to.equal(true);
    });

    it("can patrol when first played", () => {
      const I = debugPlayUnit($, "Nautical Dog");

      expect(canPatrol($, I)).to.equal(true);
    });
  });
});
