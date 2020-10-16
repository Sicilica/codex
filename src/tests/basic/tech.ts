import { expect } from "chai";

import { lookupCard } from "../../data";
import {
  purchaseTechBuilding,
  rebuildTechBuildings,
} from "../../framework/actions/buildings";
import { dealDamage } from "../../framework/actions/helpers";
import { getInstance } from "../../framework/queries/common";
import { canPlayCard } from "../../framework/queries/economy";
import { GameState, Spec } from "../../framework/types";

import {
  P1,
  debugGotoNextTurn,
  initDummyGameState,
} from "../testhelper";

const TECH_1_ANARCHY_EX = lookupCard("Calypso Vystari");
const TECH_1_BALANCE_EX = lookupCard("Gemscout Owl");
const TECH_2_ANARCHY_EX = lookupCard("Disguised Monkey");
const TECH_2_BALANCE_EX = lookupCard("Chameleon");
const TECH_3_ANARCHY_EX = lookupCard("Pirate Gunship");
const TECH_3_BALANCE_EX = lookupCard("Tyrannosaurus Rex");

const debugSetTech = (
  $: GameState,
  tech: number,
  spec?: Spec,
): void => {
  const P = $.players[$.activePlayer];

  // Destroy existing tech buildings and chosen spec
  for (const iid of P.techBuildings) {
    if (iid != null && iid in $.instances) {
      delete $.instances[iid];
    }
  }
  P.techBuildings = [ null, null, null ];

  // Create and ready new buildings
  P.purchasedTechBuildings = tech;
  rebuildTechBuildings($, P);
  for (const iid of P.techBuildings) {
    const I = getInstance($, iid);
    if (I != null) {
      I.arrivalFatigue = false;
    }
  }

  // Update main spec
  P.mainSpec = spec ?? null;
};

describe("basic", () => {
  describe("tech", () => {
    let $: GameState;
    beforeEach(() => {
      $ = initDummyGameState();
    });

    describe("tech buildings", () => {
      it("deals 2 dmg to base when killed", () => {
        $.players[P1].gold = 20;
        $.players[P1].workers = 10;
        purchaseTechBuilding($);

        expect($.players[P1].purchasedTechBuildings).to.equal(1);
        const tb = getInstance($, $.players[P1].techBuildings[0]);
        if (tb == null) {
          throw new Error("failed to find tech building");
        }
        const base = getInstance($, $.players[P1].base);
        if (base == null) {
          throw new Error("failed to find base");
        }

        expect(base.damage).to.equal(0);

        dealDamage($, tb, 5);

        expect($.players[P1].techBuildings[0]).to.equal(null);
        expect(base.damage).to.equal(2);
      });

      describe("tech 1 building", () => {
        it("requires 6+ workers", () => {
          $.players[$.activePlayer].gold = 20;
          $.players[$.activePlayer].workers = 5;
          expect(
            () => purchaseTechBuilding($),
          ).to.throw();

          $.players[$.activePlayer].workers = 6;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();

          $.players[$.activePlayer].purchasedTechBuildings = 0;
          $.players[$.activePlayer].workers = 7;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();
        });

        it("costs 1 gold", () => {
          $.players[$.activePlayer].workers = 10;
          $.players[$.activePlayer].gold = 0;
          expect(
            () => purchaseTechBuilding($),
          ).to.throw();

          $.players[$.activePlayer].gold = 1;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();
          expect($.players[$.activePlayer].gold).to.equal(0);
        });

        it("allows tech 1 cards of all specs", () => {
          const P = $.players[$.activePlayer];
          P.gold = 20;
          debugSetTech($, 0);
          expect(canPlayCard($, P, TECH_1_ANARCHY_EX, false)).to.equal(false);

          debugSetTech($, 1);
          expect(canPlayCard($, P, TECH_1_ANARCHY_EX, false)).to.equal(true);
          expect(canPlayCard($, P, TECH_1_BALANCE_EX, false)).to.equal(true);
        });
      });

      describe("tech 2 building", () => {
        it("requires 8+ workers", () => {
          $.players[$.activePlayer].gold = 20;
          $.players[$.activePlayer].purchasedTechBuildings = 1;
          $.players[$.activePlayer].workers = 7;
          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).to.throw();

          $.players[$.activePlayer].workers = 8;
          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).not.to.throw();

          $.players[$.activePlayer].purchasedTechBuildings = 1;
          $.players[$.activePlayer].workers = 9;
          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).not.to.throw();
        });

        it("costs 4 gold", () => {
          $.players[$.activePlayer].purchasedTechBuildings = 1;
          $.players[$.activePlayer].workers = 10;
          $.players[$.activePlayer].gold = 3;
          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).to.throw();

          $.players[$.activePlayer].gold = 4;
          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).not.to.throw();
          expect($.players[$.activePlayer].gold).to.equal(0);
        });

        it("requires you to declare a main spec", () => {
          $.players[$.activePlayer].purchasedTechBuildings = 1;
          $.players[$.activePlayer].gold = 20;
          $.players[$.activePlayer].workers = 10;
          expect(
            () => purchaseTechBuilding($),
          ).to.throw();

          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).not.to.throw();
          expect($.players[$.activePlayer].mainSpec).to.equal("ANARCHY");
        });

        it("allows tech 2 cards of declared spec", () => {
          const P = $.players[$.activePlayer];
          P.gold = 20;
          debugSetTech($, 1);
          expect(canPlayCard($, P, TECH_2_ANARCHY_EX, false)).to.equal(false);

          debugSetTech($, 2, "ANARCHY");
          expect(canPlayCard($, P, TECH_2_ANARCHY_EX, false)).to.equal(true);
          expect(canPlayCard($, P, TECH_2_BALANCE_EX, false)).to.equal(false);
        });
      });

      describe("tech 3 building", () => {
        it("requires 10+ workers", () => {
          $.players[$.activePlayer].gold = 20;
          $.players[$.activePlayer].purchasedTechBuildings = 2;
          $.players[$.activePlayer].workers = 9;
          expect(
            () => purchaseTechBuilding($),
          ).to.throw();

          $.players[$.activePlayer].workers = 10;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();

          $.players[$.activePlayer].purchasedTechBuildings = 2;
          $.players[$.activePlayer].workers = 11;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();
        });

        it("costs 5 gold", () => {
          $.players[$.activePlayer].purchasedTechBuildings = 2;
          $.players[$.activePlayer].workers = 10;
          $.players[$.activePlayer].gold = 4;
          expect(
            () => purchaseTechBuilding($),
          ).to.throw();

          $.players[$.activePlayer].gold = 5;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();
          expect($.players[$.activePlayer].gold).to.equal(0);
        });

        it("allows tech 3 cards of declared spec", () => {
          const P = $.players[$.activePlayer];
          P.gold = 20;
          debugSetTech($, 2, "ANARCHY");
          expect(canPlayCard($, P, TECH_3_ANARCHY_EX, false)).to.equal(false);

          debugSetTech($, 3, "ANARCHY");
          expect(canPlayCard($, P, TECH_3_ANARCHY_EX, false)).to.equal(true);
          expect(canPlayCard($, P, TECH_3_BALANCE_EX, false)).to.equal(false);
        });
      });

      it("can't be used on the turn it is built", () => {
        const P = $.players[$.activePlayer];
        P.gold = 20;
        P.workers = 10;
        purchaseTechBuilding($);
        P.gold = 20;
        expect(canPlayCard($, P, TECH_1_ANARCHY_EX, false)).to.equal(false);

        debugGotoNextTurn($, P.id);
        expect(canPlayCard($, P, TECH_1_ANARCHY_EX, false)).to.equal(true);
      });

      it("is automatically rebuilt for free if destroyed", () => {
        const P = $.players[$.activePlayer];
        P.gold = 20;
        P.workers = 10;
        purchaseTechBuilding($);
        P.gold = 20;
        P.workers = 0;
        expect(getInstance($, P.techBuildings[0])).not.to.equal(null);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        delete $.instances[P.techBuildings[0]!];
        P.techBuildings[0] = null;
        expect(getInstance($, P.techBuildings[0])).to.equal(null);

        debugGotoNextTurn($, P.id);
        expect(getInstance($, P.techBuildings[0])).not.to.equal(null);
        expect(P.gold).to.equal(20);
        expect(
          getInstance($, P.techBuildings[0])?.arrivalFatigue,
        ).to.equal(true);

        debugGotoNextTurn($, P.id);
        expect(
          getInstance($, P.techBuildings[0])?.arrivalFatigue,
        ).to.equal(false);
      });
    });
  });
});
