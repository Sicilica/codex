import { expect } from "chai";

import { canAttack } from "../../framework/queries/combat";
import { GameState } from "../../framework/types";

import {
  debugPlayUnit,
  initDummyGameState,
} from "../testhelper";

describe("abilities", () => {
  describe("value_keywords", () => {
    let $: GameState;

    beforeEach(() => {
      $ = initDummyGameState();
    });

    describe("ARMOR", () => {
      it.skip("takes damage before health");

      it.skip("replenishes during each ready phase");
    });

    describe("RESIST", () => {
      it.skip("costs money to target the unit");

      it.skip("prevents targeting the unit without sufficient gold");
    });
  });
});
