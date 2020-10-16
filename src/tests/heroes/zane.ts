import { expect } from "chai";

import { makeInstance } from "../../framework/actions/helpers";

import { GameState, Instance } from "../../framework/types";

import {
  P1,
  initDummyGameState,
} from "../testhelper";

describe("heroes", () => {
  describe("Captain Zane", () => {
    let $: GameState;
    let zane: Instance;

    beforeEach(() => {
      $ = initDummyGameState();
      zane = makeInstance($, P1, "Captain Zane");
    });

    describe("mid band", () => {
      it.skip("gives gold when killing a scavenger");

      it.skip("gives card draw when killing a technician");
    });

    describe("max band", () => {
      it.skip("moves a patroller to an empty space");

      it.skip("deals 1 damage");

      it.skip("triggers Zane's midband if it kills the target");

      it.skip("counts as a targeted ability");

      it.skip("can't be used if there are no patrollers");

      it.skip("deals damage to a patroller without moving it if the patrol " +
        "zone is full");

      it.skip("can't be used without funds if all targets have resist");
    });
  });
});
