import { expect } from "chai";
import { hasArrivalFatigue } from "../../framework/accessors";

import { GameEngine } from "../../framework/engine";
import { dealDamage, rebuildTechBuildings } from "../../framework/mutators";
import { Card, PlayerState, Spec } from "../../framework/types";
import {
  requireActivePlayer,
  requireCardPlayableAndGetCost,
} from "../../game/helpers";

import {
  debugAction,
  debugAutoResolve,
  debugGotoNextTurn,
  makeDefaultGame,
} from "../testhelper";

const canPlayCard = (
  $: GameEngine,
  P: PlayerState,
  card: Card,
  boost: boolean,
): boolean => {
  try {
    requireCardPlayableAndGetCost($, P, card, boost);
    return true;
  } catch (err) {
    return false;
  }
};

const debugSetTech = (
  $: GameEngine,
  tech: number,
  spec?: Spec,
): void => {
  const P = requireActivePlayer($);

  // Destroy existing tech buildings and chosen spec
  for (const iid of P.techBuildings) {
    if (iid != null && iid in $.state.instances) {
      delete $.state.instances[iid];
    }
  }
  P.techBuildings = [ null, null, null ];

  // Create and ready new buildings
  P.purchasedTechBuildings = tech;
  rebuildTechBuildings($, P);
  for (const iid of P.techBuildings) {
    const I = $.getInstance(iid);
    if (I != null) {
      I._arrivalFatigue = false;
    }
  }

  // Update main spec
  P.mainSpec = spec ?? null;
};

const purchaseTechBuilding = (
  $: GameEngine,
  spec?: Spec,
): void => {
  debugAction($, {
    type: "PURCHASE_TECH_BUILDING",
    spec,
  });
};

const readyTechBuildings = (
  $: GameEngine,
  P: PlayerState,
): void => {
  for (const iid of P.techBuildings) {
    const I = $.getInstance(iid);
    if (I != null) {
      I.readyState = "READY";
      I._arrivalFatigue = false;
    }
  }
};

describe("basic", () => {
  describe("tech", () => {
    let TECH_1_ANARCHY_EX: Card;
    let TECH_1_BALANCE_EX: Card;
    let TECH_2_ANARCHY_EX: Card;
    let TECH_2_BALANCE_EX: Card;
    let TECH_3_ANARCHY_EX: Card;
    let TECH_3_BALANCE_EX: Card;

    let $: GameEngine;
    let P: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);

      TECH_1_ANARCHY_EX = $.data.lookupCard("Calypso Vystari");
      TECH_1_BALANCE_EX = $.data.lookupCard("Gemscout Owl");
      TECH_2_ANARCHY_EX = $.data.lookupCard("Disguised Monkey");
      TECH_2_BALANCE_EX = $.data.lookupCard("Chameleon");
      TECH_3_ANARCHY_EX = $.data.lookupCard("Pirate Gunship");
      TECH_3_BALANCE_EX = $.data.lookupCard("Tyrannosaurus Rex");
    });

    describe("tech buildings", () => {
      it("deals 2 dmg to base when killed", () => {
        P.gold = 20;
        P.workers = 10;
        purchaseTechBuilding($);

        expect(P.purchasedTechBuildings).to.equal(1);
        const tb = $.getInstance(P.techBuildings[0]);
        if (tb == null) {
          throw new Error("failed to find tech building");
        }
        const base = $.getInstance(P.base);
        if (base == null) {
          throw new Error("failed to find base");
        }

        expect(base.damage).to.equal(0);

        dealDamage($, tb, 5, null);
        debugAutoResolve($);

        expect(P.techBuildings[0]).to.equal(null);
        expect(base.damage).to.equal(2);
      });

      describe("tech 1 building", () => {
        it("requires 6+ workers", () => {
          P.gold = 20;
          P.workers = 5;
          expect(
            () => purchaseTechBuilding($),
          ).to.throw();

          P.workers = 6;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();

          P.purchasedTechBuildings = 0;
          P.workers = 7;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();
        });

        it("costs 1 gold", () => {
          P.workers = 10;
          P.gold = 0;
          expect(
            () => purchaseTechBuilding($),
          ).to.throw();

          P.gold = 1;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();
          expect(P.gold).to.equal(0);
        });

        it("allows tech 1 cards of all specs", () => {
          P.gold = 20;
          debugSetTech($, 0);
          expect(canPlayCard($, P, TECH_1_ANARCHY_EX, false)).to.equal(false);

          debugSetTech($, 1);
          expect(canPlayCard($, P, TECH_1_ANARCHY_EX, false)).to.equal(true);
          expect(canPlayCard($, P, TECH_1_BALANCE_EX, false)).to.equal(true);
        });
      });

      describe("tech 2 building", () => {
        beforeEach(() => {
          P.purchasedTechBuildings = 1;
          rebuildTechBuildings($, P);
          readyTechBuildings($, P);
        });

        it("requires 8+ workers", () => {
          P.gold = 20;
          P.workers = 7;
          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).to.throw();

          P.workers = 8;
          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).not.to.throw();

          P.purchasedTechBuildings = 1;
          P.workers = 9;
          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).not.to.throw();
        });

        it("costs 4 gold", () => {
          P.workers = 10;
          P.gold = 3;
          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).to.throw();

          P.gold = 4;
          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).not.to.throw();
          expect(P.gold).to.equal(0);
        });

        it("requires you to declare a main spec", () => {
          P.gold = 20;
          P.workers = 10;
          expect(
            () => purchaseTechBuilding($),
          ).to.throw();

          expect(
            () => purchaseTechBuilding($, "ANARCHY"),
          ).not.to.throw();
          expect(P.mainSpec).to.equal("ANARCHY");
        });

        it("allows tech 2 cards of declared spec", () => {
          P.gold = 20;
          debugSetTech($, 1);
          expect(canPlayCard($, P, TECH_2_ANARCHY_EX, false)).to.equal(false);

          debugSetTech($, 2, "ANARCHY");
          expect(canPlayCard($, P, TECH_2_ANARCHY_EX, false)).to.equal(true);
          expect(canPlayCard($, P, TECH_2_BALANCE_EX, false)).to.equal(false);
        });
      });

      describe("tech 3 building", () => {
        beforeEach(() => {
          P.purchasedTechBuildings = 2;
          rebuildTechBuildings($, P);
          readyTechBuildings($, P);
        });

        it("requires 10+ workers", () => {
          P.gold = 20;
          P.workers = 9;
          expect(
            () => purchaseTechBuilding($),
          ).to.throw();

          P.workers = 10;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();

          P.purchasedTechBuildings = 2;
          P.workers = 11;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();
        });

        it("costs 5 gold", () => {
          P.workers = 10;
          P.gold = 4;
          expect(
            () => purchaseTechBuilding($),
          ).to.throw();

          P.gold = 5;
          expect(
            () => purchaseTechBuilding($),
          ).not.to.throw();
          expect(P.gold).to.equal(0);
        });

        it("allows tech 3 cards of declared spec", () => {
          P.gold = 20;
          debugSetTech($, 2, "ANARCHY");
          expect(canPlayCard($, P, TECH_3_ANARCHY_EX, false)).to.equal(false);

          debugSetTech($, 3, "ANARCHY");
          expect(canPlayCard($, P, TECH_3_ANARCHY_EX, false)).to.equal(true);
          expect(canPlayCard($, P, TECH_3_BALANCE_EX, false)).to.equal(false);
        });
      });

      it("can't be used on the turn it is built", () => {
        P.gold = 20;
        P.workers = 10;
        purchaseTechBuilding($);
        P.gold = 20;
        expect(canPlayCard($, P, TECH_1_ANARCHY_EX, false)).to.equal(false);

        debugGotoNextTurn($, P.id);
        expect(canPlayCard($, P, TECH_1_ANARCHY_EX, false)).to.equal(true);
      });

      it("is automatically rebuilt for free if destroyed", () => {
        P.gold = 20;
        P.workers = 10;
        purchaseTechBuilding($);
        P.gold = 20;
        P.workers = 0;
        expect($.getInstance(P.techBuildings[0])).not.to.equal(null);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        delete $.state.instances[P.techBuildings[0]!];
        P.techBuildings[0] = null;
        expect($.getInstance(P.techBuildings[0])).to.equal(null);

        debugGotoNextTurn($, P.id);
        expect($.getInstance(P.techBuildings[0])).not.to.equal(null);
        expect(P.gold).to.equal(20);
        expect(
          hasArrivalFatigue($, $.getInstance(P.techBuildings[0])),
        ).to.equal(true);

        debugGotoNextTurn($, P.id);
        expect(
          hasArrivalFatigue($, $.getInstance(P.techBuildings[0])),
        ).to.equal(false);
      });
    });
  });
});
