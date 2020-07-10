import { expect } from "chai";

import { GameState, PlayerState } from "../../framework/types";
import { P1, P2, initDummyGameState } from "../testhelper";
import { endTurn, techCards } from "../../framework/actions/turn";
import { makeInstance } from "../../framework/actions/helpers";
import { MAX_GOLD, MAX_HAND_SIZE } from "../../framework/constants";

describe("basic", () => {
  describe("turn", () => {
    let $: GameState;
    let P: PlayerState;

    beforeEach(() => {
      $ = initDummyGameState();
      $.turnPhase = "TECH";

      P = $.players[$.activePlayer];
    });

    describe("Ready Phase", () => {
      it("should reset all turn flags for the player", () => {
        P.hasShuffledThisTurn = true;
        P.hasBuiltWorkerThisTurn = true;

        techCards($, []);

        expect(P.hasShuffledThisTurn).to.equal(false);
        expect(P.hasBuiltWorkerThisTurn).to.equal(false);
      });

      it("should ready all in-play cards for the player", () => {
        const fatigued = makeInstance($, $.activePlayer, "Nautical Dog");
        const exhausted = makeInstance($, $.activePlayer, "Nautical Dog");
        const disabled = makeInstance($, $.activePlayer, "Nautical Dog");
        const patrolling = makeInstance($, $.activePlayer, "Nautical Dog");

        exhausted.arrivalFatigue = false;
        disabled.arrivalFatigue = false;
        patrolling.arrivalFatigue = false;

        exhausted.readyState = "EXHAUSTED";
        disabled.readyState = "DISABLED";

        P.patrol.squadLeader = patrolling.id;

        techCards($, []);

        expect(fatigued.arrivalFatigue).to.equal(false);
        expect(exhausted.arrivalFatigue).to.equal(false);
        expect(disabled.arrivalFatigue).to.equal(false);
        expect(patrolling.arrivalFatigue).to.equal(false);

        expect(fatigued.readyState).to.equal("READY");
        expect(exhausted.readyState).to.equal("READY");
        expect(disabled.readyState).to.equal("EXHAUSTED");
        expect(patrolling.readyState).to.equal("READY");

        expect(P.patrol.squadLeader).to.equal(null);
      });
    });

    describe("Upkeep Phase", () => {
      it("should give player a gold for every worker", () => {
        techCards($, []);

        expect(P.gold).to.equal(P.workers);
      });

      it(`should cap the player's gold at ${MAX_GOLD}`, () => {
        P.gold = MAX_GOLD - 1;

        techCards($, []);

        expect(P.gold).to.equal(MAX_GOLD);
      });
    });

    describe("Draw Phase", () => {
      beforeEach(() => {
        $ = initDummyGameState();
        $.turnPhase = "MAIN";

        P = $.players[$.activePlayer];

        P.hand = [
          "Nautical Dog",
          "Mad Man",
          "Bombaster",
          "Careless Musketeer",
          "Bloodrage Ogre",
        ];

        P.deck = [
          "Makeshift Rambaster",
          "Bloodburn",
          "Scorch",
          "Charge",
          "Pillage",
        ];
      });

      it(
        "should refill the player's hand by 2",
        () => {
          P.hand = P.hand.slice(0, 2);

          endTurn($);

          expect(P.hand.length).to.equal(4);
        }
      );

      it(
        `should not let the player's hand exceed ${MAX_HAND_SIZE} cards`,
        () => {
          endTurn($);

          expect(P.hand.length).to.equal(5);
        }
      );

      it("should replace the player's current hand", () => {
        endTurn($);

        expect(P.hand.includes("Nautical Dog")).to.equal(false);
      });
    });

    describe("Tech Phase", () => {
      it("should skip the tech phase on the first round", () => {
        techCards($, []);

        expect($.turnPhase).to.equal("MAIN");
      });

      it("should require 2 teched cards after the first round", () => {
        $.round = 2;

        expect(() => techCards($, [])).to.throw("not enough cards to tech");
      });

      it("should add the player's teched cards to the discard pile", () => {
        $.round = 2;

        techCards($, [ "Crash Bomber", "Firebat" ]);

        expect(P.discard.includes("Crash Bomber")).to.equal(true);
        expect(P.discard.includes("Firebat")).to.equal(true);
      });

      it("should reject attempts to tech more than 2 cards", () => {
        $.round = 2;
        P.workers = 10;

        expect(() =>
          techCards(
            $,
            [ "Crash Bomber", "Firebat", "Bloodlust" ]
          )).to.throw("invalid tech card selection");
      });

      it("should permit 0, 1, or 2 teched cards at 10 workers", () => {
        $.round = 2;
        P.workers = 10;

        techCards($, []);

        expect($.turnPhase).to.equal("MAIN");


        $.turnPhase = "TECH";
        $.activePlayer = P1;

        techCards($, [ "Crash Bomber" ]);

        expect($.turnPhase).to.equal("MAIN");


        $.turnPhase = "TECH";
        $.activePlayer = P1;

        techCards($, [ "Firebat", "Bloodlust" ]);

        expect($.turnPhase).to.equal("MAIN");


        expect(P.canSkipTech).to.equal(true);
      });

      it("should permit 0, 1, or 2 teched cards after 10 workers", () => {
        $.round = 2;
        P.workers = 9;
        P.canSkipTech = true;

        techCards($, []);

        expect($.turnPhase).to.equal("MAIN");


        $.turnPhase = "TECH";
        $.activePlayer = P1;

        techCards($, [ "Crash Bomber" ]);

        expect($.turnPhase).to.equal("MAIN");


        $.turnPhase = "TECH";
        $.activePlayer = P1;

        techCards($, [ "Firebat", "Bloodlust" ]);

        expect($.turnPhase).to.equal("MAIN");
      });
    });

    describe("Advancing Players", () => {
      it("should advance the round on P1's turn", () => {
        $.turnPhase = "MAIN";
        $.activePlayer = P2;
        const p2 = $.players[P2];

        p2.deck = [
          "Spore Shambler",
          "Verdant Tree",
          "Rich Earth",
          "Rampant Growth",
          "Forest's Favor",
        ];

        endTurn($);

        expect($.round).to.equal(2);
      });
    });
  });
});
