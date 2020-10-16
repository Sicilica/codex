import { expect } from "chai";

import { canAttack } from "../../framework/queries/combat";
import { GameState } from "../../framework/types";

import {
  debugPlayUnit,
  initDummyGameState,
} from "../testhelper";

describe("abilities", () => {
  describe("simple_keywords", () => {
    let $: GameState;

    beforeEach(() => {
      $ = initDummyGameState();
    });

    describe("HASTE", () => {
      it("lets units attack on the turn they are played", () => {
        const I = debugPlayUnit($, "Mad Man");
        expect(canAttack($, I.id)).to.equal(true);
      });
    });
  });
});
