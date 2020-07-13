import { GameState, PlayerState } from "../../framework/types";
import { P1, P2, initDummyGameState } from "../testhelper";
import {
  getHealth,
  getPossibleAttackTargets,
} from "../../framework/queries/combat";

import { expect } from "chai";

const addInstance = (
  $: GameState,
  id: string,
  controller: string,
  card: string,
  damage: number,
  level: number,
): void => {
  if (id in $.instances) {
    throw new Error(`Instance ID ${id}, is already in use.`);
  }
  $.instances[id] = {
    id,
    owner: controller,
    controller,
    card,
    damage,
    plusMinusTokens: 0,
    specialTokens: [],
    attachments: [],
    level,
    readyState: "READY",
    arrivalFatigue: false,
    armorDamage: 0,
  };
};

describe("basic", () => {
  describe("combat", () => {
    let $: GameState;
    let P: PlayerState;

    beforeEach(() => {
      $ = initDummyGameState();
      P = $.players[P1];

      P.hand = [ "Nautical Dog", "Mad Man", "Bombaster" ];
      P.deck = [
        "Careless Musketeer",
        "Bloodrage Ogre",
        "Makeshift Rambaster",
      ];
    });
    describe("queries", () => {
      describe("getHealth()", () => {
        it("should fail if instance id doesn't exist", () => {
          expect(() => getHealth($, "this_id_shouldnt_exist"))
            .to.throw("id this_id_shouldnt_exist is not an instance");
        });

        it("should fail if instance is not a hero, unit, or building", () => {
          addInstance($, "test", P1, "Hotter Fire", 0, 0);

          expect(() => getHealth($, "test"))
            .to.throw("must be a hero, unit, or building to get health");
        });

        it("should return health minus damage for building", () => {
          addInstance($, "test", P1, "Sanatorium", 3, 0);

          expect(getHealth($, "test")).to.equal(1);
        });

        it("should return health minus damage for unit", () => {
          addInstance($, "test", P1, "Nautical Dog", 1, 0);

          expect(getHealth($, "test")).to.equal(0);
        });

        it("should return health minus damage for hero", () => {
          addInstance($, "test", P1, "Captain Zane", 2, 5);

          expect(getHealth($, "test")).to.equal(1);
        });
      });

      describe("getPossibleAttackTargets()", () => {
        it("can only target squad leader if available", () => {
          addInstance($, "0", P1, "Nautical Dog", 0, 0);
          addInstance($, "1", P2, "Nautical Dog", 0, 0);
          addInstance($, "2", P2, "Nautical Dog", 0, 0);
          addInstance($, "3", P2, "Nautical Dog", 0, 0);

          $.players[P2].patrol.squadLeader = "1";
          $.players[P2].patrol.lookout = "2";
          expect(getPossibleAttackTargets($, "0"))
            .is.deep.equal(new Set([ "1" ]));
        });

        it("can only target another member of patrol if there's no squad leader", () => {
          addInstance($, "0", P1, "Nautical Dog", 0, 0);
          addInstance($, "1", P2, "Nautical Dog", 0, 0);
          addInstance($, "2", P2, "Nautical Dog", 0, 0);
          addInstance($, "3", P2, "Nautical Dog", 0, 0);

          $.players[P2].patrol.elite = "1";
          $.players[P2].patrol.lookout = "2";
          expect(getPossibleAttackTargets($, "0"))
            .is.deep.equal(new Set([ "1", "2" ]));
        });

        it("can target any unit, building, or hero if there's no patrol", () => {
          addInstance($, "0", P1, "Nautical Dog", 0, 0);
          addInstance($, "1", P2, "Nautical Dog", 0, 0);
          addInstance($, "2", P2, "Nautical Dog", 0, 0);
          addInstance($, "3", P2, "Nautical Dog", 0, 0);

          expect(getPossibleAttackTargets($, "0"))
            .is.deep.equal(new Set([ "1", "2", "3" ]));
        });
      });
    });
  });
});
