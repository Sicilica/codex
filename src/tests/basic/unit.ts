import { expect } from "chai";

import { canAttack, canPatrol } from "../../framework/queries/combat";
import {
  GameState,
} from "../../framework/types";

import {
  P1,
  debugGotoNextTurn,
  debugPlayUnit,
  initDummyGameState,
} from "../testhelper";

describe("basic", () => {
  describe("unit", () => {
    let $: GameState;
    beforeEach(() => {
      $ = initDummyGameState();
    });

    it("can't attack when first played", () => {
      const I = debugPlayUnit($, "Nautical Dog");

      expect(canAttack($, I.id)).to.equal(false);
    });

    it("can attack the turn after it's played", () => {
      const I = debugPlayUnit($, "Nautical Dog");
      debugGotoNextTurn($, P1);

      expect(canAttack($, I.id)).to.equal(true);
    });

    it("can patrol when first played", () => {
      const I = debugPlayUnit($, "Nautical Dog");

      expect(canPatrol($, I.id)).to.equal(true);
    });
  });
});
