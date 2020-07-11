import { GameState, PlayerState } from "../../framework/types";
import { P1, initDummyGameState } from "../testhelper";
import { getHealth } from "../../framework/queries/combat";

import { expect } from "chai";

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
          $.instances = {
            test: {
              id: "test",
              owner: P1,
              controller: P1,
              card: "Hotter Fire",
              damage: 0,
              plusMinusTokens: 0,
              specialTokens: [],
              attachments: [],
              level: 0,
              readyState: "READY",
              arrivalFatigue: false,
              armorDamage: 0,
            },
          };

          expect(() => getHealth($, "test"))
            .to.throw("must be a hero, unit, or building to get health");
        });

        it("should return health minus damage for building", () => {
          $.instances = {
            test: {
              id: "test",
              owner: P1,
              controller: P1,
              card: "Sanatorium",
              damage: 3,
              plusMinusTokens: 0,
              specialTokens: [],
              attachments: [],
              level: 0,
              readyState: "READY",
              arrivalFatigue: false,
              armorDamage: 0,
            },
          };

          expect(getHealth($, "test")).to.equal(1);
        });

        it("should return health minus damage for unit", () => {
          $.instances = {
            test: {
              id: "test",
              owner: P1,
              controller: P1,
              card: "Nautical Dog",
              damage: 1,
              plusMinusTokens: 0,
              specialTokens: [],
              attachments: [],
              level: 0,
              readyState: "READY",
              arrivalFatigue: false,
              armorDamage: 0,
            },
          };

          expect(getHealth($, "test")).to.equal(0);
        });

        it("should return health minus damage for hero", () => {
          $.instances = {
            test: {
              id: "test",
              owner: P1,
              controller: P1,
              card: "Captain Zane",
              damage: 2,
              plusMinusTokens: 0,
              specialTokens: [],
              attachments: [],
              level: 5,
              readyState: "READY",
              arrivalFatigue: false,
              armorDamage: 0,
            },
          };

          expect(getHealth($, "test")).to.equal(1);
        });
      });
    });
  });
});
