import { GameState, PlayerState } from "../../framework/types";
import { P1, P2, initDummyGameState } from "../testhelper";
import {
  getAttack,
  getHealth,
  getPossibleAttackTargets,
} from "../../framework/queries/combat";

import { expect } from "chai";
import { attackInstance } from "../../framework/actions/combat";

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
      describe("getAttack()", () => {
        it("should fail if instance id doesn't exist", () => {
          expect(() => getAttack($, "this_id_shouldnt_exist"))
            .to.throw("id this_id_shouldnt_exist is not an instance");
        });

        it("should return 0 if instance is not a hero or unit", () => {
          addInstance($, "test", P1, "Sanatorium", 0, 0);

          expect(getAttack($, "test")).to.equal(0);
        });

        it("should return attack for unit", () => {
          addInstance($, "test", P1, "Nautical Dog", 0, 0);

          expect(getAttack($, "test")).to.equal(1);
        });

        it("should return attack for hero", () => {
          addInstance($, "test", P1, "Captain Zane", 0, 6);

          expect(getAttack($, "test")).to.equal(4);
        });
      });

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
          expect(getPossibleAttackTargets($, "0").sort())
            .is.deep.equal(([ "1" ]).sort());
        });

        it("can target another member of " +
           "patrol if there's no squad leader", () => {
          addInstance($, "0", P1, "Nautical Dog", 0, 0);
          addInstance($, "1", P2, "Nautical Dog", 0, 0);
          addInstance($, "2", P2, "Nautical Dog", 0, 0);
          addInstance($, "3", P2, "Nautical Dog", 0, 0);

          $.players[P2].patrol.elite = "1";
          $.players[P2].patrol.lookout = "2";
          expect(getPossibleAttackTargets($, "0").sort())
            .is.deep.equal(([ "1", "2" ]).sort());
        });

        it("can target any unit, building, " +
           "or hero if there's no patrol", () => {
          addInstance($, "0", P1, "Nautical Dog", 0, 0);
          addInstance($, "1", P2, "Nautical Dog", 0, 0);
          addInstance($, "2", P2, "Captain Zane", 0, 1);
          addInstance($, "3", P2, "Sanatorium", 0, 0);
          addInstance($, "4", P2, "Hotter Fire", 0, 0);

          expect(getPossibleAttackTargets($, "0").sort())
            .is.deep.equal(([ "1", "2", "3" ]).sort());
        });
      });
    });

    describe("actions", () => {
      describe("attackInstance", () => {
        it("should fail if attacker doesn't exist", () => {
          addInstance($, "1", P2, "Nautical Dog", 0, 0);

          expect(() => attackInstance($, "0", "1"))
            .to.throw("id 0 is not an instance");
        });

        it("should fail if defender doesn't exist", () => {
          addInstance($, "0", P1, "Nautical Dog", 0, 0);

          expect(() => attackInstance($, "0", "1"))
            .to.throw("id 1 is not an instance");
        });

        it("should fail if attacker can't attack", () => {
          addInstance($, "0", P1, "Nautical Dog", 0, 0);
          addInstance($, "1", P2, "Nautical Dog", 0, 0);

          $.instances["0"].arrivalFatigue = true;
          expect(() => attackInstance($, "0", "1"))
            .to.throw("instance 0 can't attack");
        });

        it("should fail if attacker can't target defender", () => {
          addInstance($, "0", P1, "Nautical Dog", 0, 0);
          addInstance($, "1", P2, "Nautical Dog", 0, 0);
          addInstance($, "2", P2, "Nautical Dog", 0, 0);

          $.players[P2].patrol.squadLeader = "2";
          expect(() => attackInstance($, "0", "1"))
            .to.throw("instance 0 can't attack instance 1");
        });

        it("should deal damage and kill instances with < 0 health", () => {
          addInstance($, "0", P1, "Nautical Dog", 0, 0);
          addInstance($, "1", P2, "Captain Zane", 0, 1);

          attackInstance($, "0", "1");
          expect(() => getHealth($, "0")).to.throw("id 0 is not an instance");
          expect(getHealth($, "1")).to.equal(1);
          expect($.players[P1].discard.pop()).to.equal("Nautical Dog");
        });
      });
    });
  });
});
