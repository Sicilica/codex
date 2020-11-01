import { expect } from "chai";

import { MAX_GOLD, MAX_HAND_SIZE } from "../../framework/constants";
import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { CardID, PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";

import {
  P1,
  P2,
  debugAction,
  makeDefaultGame,
} from "../testhelper";

const endTurn = (
  $: GameEngine,
): void => {
  debugAction($, {
    type: "END_TURN",
    patrol: {
      SQUAD_LEADER: null,
      ELITE: null,
      SCAVENGER: null,
      TECHNICIAN: null,
      LOOKOUT: null,
    },
  });
};

const techCards = (
  $: GameEngine,
  cards: Array<CardID>,
): void => {
  debugAction($, {
    type: "TECH",
    cards,
  });
};

describe("basic", () => {
  describe("turn", () => {
    let $: GameEngine;
    let P: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
    });

    describe("startGame()", () => {
      it.skip("should advance through the initial phases for P1", () => {
        // $ = createInitialGameState([
        //   {
        //     starterDeckSpec: "ANARCHY",
        //     otherSpecs: [ "BLOOD", "FIRE" ],
        //   }, {
        //     starterDeckSpec: "BALANCE",
        //     otherSpecs: [ "FERAL", "GROWTH" ],
        //   },
        // ]);
        // P = requireActivePlayer($);

        // expect($.state.round).to.equal(1);
        // expect($.state.activePlayer).to.equal(P1);
        // expect($.state.turnPhase).to.equal("READY");
        // expect(P.hand.length).to.equal(5);
        // expect(P.deck.length).to.equal(5);
        // expect(P.discard.length).to.equal(0);
        // expect(P.gold).to.equal(0);

        // startGame($);

        // expect($.state.round).to.equal(1);
        // expect($.state.activePlayer).to.equal(P1);
        // expect($.state.turnPhase).to.equal("MAIN");
        // expect(P.hand.length).to.equal(5);
        // expect(P.deck.length).to.equal(5);
        // expect(P.discard.length).to.equal(0);
        // expect(P.gold).to.equal(P.workers);
      });
    });

    describe("Ready Phase", () => {
      beforeEach(() => {
        $.state.turnPhase = "TECH";
        P.canSkipTech = true;
      });

      it("should reset all turn flags for the player", () => {
        P.hasShuffledThisTurn = true;
        P.hasBuiltWorkerThisTurn = true;

        techCards($, []);

        expect(P.hasShuffledThisTurn).to.equal(false);
        expect(P.hasBuiltWorkerThisTurn).to.equal(false);
      });

      it("should ready all in-play cards for the player", () => {
        const fatigued =
          createInstance($, P, $.data.lookupCard("Nautical Dog"));
        const exhausted =
          createInstance($, P, $.data.lookupCard("Nautical Dog"));
        const disabled =
          createInstance($, P, $.data.lookupCard("Nautical Dog"));
        const patrolling =
          createInstance($, P, $.data.lookupCard("Nautical Dog"));

        exhausted.arrivalFatigue = false;
        disabled.arrivalFatigue = false;
        patrolling.arrivalFatigue = false;

        exhausted.readyState = "EXHAUSTED";
        disabled.readyState = "DISABLED";

        P.patrol.SQUAD_LEADER = patrolling.id;

        techCards($, []);

        expect(fatigued.arrivalFatigue).to.equal(false);
        expect(exhausted.arrivalFatigue).to.equal(false);
        expect(disabled.arrivalFatigue).to.equal(false);
        expect(patrolling.arrivalFatigue).to.equal(false);

        expect(fatigued.readyState).to.equal("READY");
        expect(exhausted.readyState).to.equal("READY");
        expect(disabled.readyState).to.equal("EXHAUSTED");
        expect(patrolling.readyState).to.equal("READY");

        expect(P.patrol.SQUAD_LEADER).to.equal(null);
      });
    });

    describe("Upkeep Phase", () => {
      beforeEach(() => {
        $.state.turnPhase = "TECH";
        P.canSkipTech = true;
      });

      it("should give player a gold for every worker", () => {
        const startGold = P.gold;

        techCards($, []);

        expect(P.gold).to.equal(startGold + P.workers);
      });

      it(`should cap the player's gold at ${MAX_GOLD}`, () => {
        P.gold = MAX_GOLD - 1;

        techCards($, []);

        expect(P.gold).to.equal(MAX_GOLD);
      });
    });

    describe("Draw Phase", () => {
      it(
        "should refill the player's hand by 2",
        () => {
          P.hand = P.hand.slice(0, 2);

          endTurn($);

          expect(P.discard.length).to.equal(2);
          expect(P.hand.length).to.equal(4);
        }
      );

      it(
        `should not let the player's hand exceed ${MAX_HAND_SIZE} cards`,
        () => {
          endTurn($);

          expect(P.discard.length).to.equal(5);
          expect(P.hand.length).to.equal(5);
        }
      );

      it("should replace the player's current hand", () => {
        const hasNauticalDog = P.hand.includes("Nautical Dog");

        endTurn($);

        expect(P.discard.length).to.equal(5);
        expect(P.hand.includes("Nautical Dog")).to.equal(!hasNauticalDog);
      });
    });

    describe("Tech Phase", () => {
      it("should skip the tech phase on the first round", () => {
        endTurn($);

        expect($.state.activePlayer).to.equal(P2);
        expect($.state.turnPhase).to.equal("MAIN");
      });

      it("should require 2 teched cards after the first round", () => {
        endTurn($);
        endTurn($);

        expect($.state.activePlayer).to.equal(P1);
        expect($.state.turnPhase).to.equal("TECH");

        expect(() => techCards($, [])).to.throw(
          "teching is not optional until you attain 10 workers",
        );
      });

      it("should add the player's teched cards to the discard pile", () => {
        endTurn($);
        endTurn($);

        expect($.state.activePlayer).to.equal(P1);
        expect($.state.turnPhase).to.equal("TECH");

        techCards($, [ "Crash Bomber", "Firebat" ]);

        expect($.state.turnPhase).to.equal("MAIN");
        expect(P.discard.includes("Crash Bomber")).to.equal(true);
        expect(P.discard.includes("Firebat")).to.equal(true);
      });

      it("should reject attempts to tech more than 2 cards", () => {
        endTurn($);
        endTurn($);

        expect($.state.activePlayer).to.equal(P1);
        expect($.state.turnPhase).to.equal("TECH");

        P.workers = 10;

        expect(() =>
          techCards(
            $,
            [ "Crash Bomber", "Firebat", "Bloodlust" ]
          )).to.throw("can only tech 2 cards per turn");
      });

      it("should permit 0, 1, or 2 teched cards at 10 workers", () => {
        $.state.round = 2;
        P.workers = 10;
        P.canSkipTech = true;
        $.state.turnPhase = "TECH";

        techCards($, []);

        expect($.state.turnPhase).to.equal("MAIN");


        $.state.turnPhase = "TECH";
        $.state.activePlayer = P1;

        techCards($, [ "Crash Bomber" ]);

        expect($.state.turnPhase).to.equal("MAIN");


        $.state.turnPhase = "TECH";
        $.state.activePlayer = P1;

        techCards($, [ "Firebat", "Bloodlust" ]);

        expect($.state.turnPhase).to.equal("MAIN");


        expect(P.canSkipTech).to.equal(true);
      });

      it("should permit 0, 1, or 2 teched cards after 10 workers", () => {
        $.state.round = 2;
        P.workers = 9;
        $.state.turnPhase = "TECH";
        P.canSkipTech = true;

        techCards($, []);

        expect($.state.turnPhase).to.equal("MAIN");


        $.state.turnPhase = "TECH";
        $.state.activePlayer = P1;

        techCards($, [ "Crash Bomber" ]);

        expect($.state.turnPhase).to.equal("MAIN");


        $.state.turnPhase = "TECH";
        $.state.activePlayer = P1;

        techCards($, [ "Firebat", "Bloodlust" ]);

        expect($.state.turnPhase).to.equal("MAIN");
      });
    });

    describe("Advancing Players", () => {
      it("should advance the round on P1's turn", () => {
        endTurn($);

        expect($.state.activePlayer).to.equal(P2);
        expect($.state.round).to.equal(1);

        endTurn($);

        expect($.state.activePlayer).to.equal(P1);
        expect($.state.round).to.equal(2);
      });
    });
  });
});
