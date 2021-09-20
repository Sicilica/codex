import { expect } from "chai";
import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { InstanceState, PlayerState } from "../../framework/types";
import { P1, P2, makeDefaultGame } from "../testhelper";

describe("heroes", () => {
  describe("Master Midori", () => {
    let $: GameEngine;
    let P: PlayerState;
    let midori: InstanceState;
    let oppP: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = $.state.players[P1];
      midori = createInstance($, P, $.data.lookupCard("Master Midori"));
      oppP = $.state.players[P2];
    });

    describe("midband", () => {
      it.skip(
        "should give +1/+1 to all friendly units with no abilities",
        () => {
          expect(midori).to.equal(midori);
          expect(oppP).to.equal(oppP);
          // Tiger cub vs panda
          // Sanity check that it doesn't benefit enemies
          // Sanity check that it still works on an enemy's turn
        }
      );

      it.skip(
        "should not give +1/+1 to a friendly unit who has gained an ability" +
          " through another effect",
        () => {
          // Calamandra midband
          // Sanity check that it still works on an enemy's turn
          // Sanity check that Calamandra's going away gives the +1/+1 back
        }
      );
    });

    describe("maxband", () => {
      it.skip("should grant Midori flying on his turn", () => {
        // Check flying
        // End turn, check that flying goes away
        // Check that flying comes back on next turn
      });
    });
  });
});
