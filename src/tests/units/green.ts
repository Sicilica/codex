import { expect } from "chai";

import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { InstanceState, PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";

import {
  debugAction,
  makeDefaultGame,
} from "../testhelper";

describe("units", () => {
  describe("Moss Sentinels", () => {
    let $: GameEngine;
    let P: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
    });

    describe("Merfolk Prospector", () => {
      let I: InstanceState;

      beforeEach(() => {
        I = createInstance($, P, $.data.lookupCard("Merfolk Prospector"));
      });

      it("grants one gold when exhausted", () => {
        I.arrivalFatigue = false;
        const before = P.gold;

        debugAction(
          $,
          {
            type: "ACTIVATE_ABILITY",
            instance: I.id,
            ability: `${I.card} #1`,
          }
        );

        expect(P.gold).to.equal(before + 1);
        expect(I.readyState).to.equal("EXHAUSTED");
      });
    });
  });
});
