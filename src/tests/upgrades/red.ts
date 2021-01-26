import { expect } from "chai";

import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { InstanceState, PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";

import {
  debugAction,
  debugGotoNextTurn,
  makeDefaultGame,
} from "../testhelper";

describe("upgrades", () => {
  describe("red", () => {
    let $: GameEngine;
    let P: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
    });

    describe("Bloodburn", () => {
      let I: InstanceState;

      beforeEach(() => {
        I = createInstance($, P, $.data.lookupCard("Bloodburn"));
      });

      it("can't be used on its first turn because it doesn't have " +
        "haste", () => {
        expect(I.arrivalFatigue).to.equal(true);

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
    });
  });
});
