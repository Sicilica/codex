import { expect } from "chai";

import { GameState, PlayerState } from "../../framework/types";
import { P1, P2, initDummyGameState } from "../testhelper";
import { endTurn, startGame, techCards } from "../../framework/actions/turn";
import { makeInstance } from "../../framework/actions/helpers";
import {
  HERO_DEATH_FATIGUE,
  MAX_GOLD,
  MAX_HAND_SIZE,
} from "../../framework/constants";
import { createInitialGameState } from "../../framework/state/gamestate";

describe("basic", () => {
  describe("turn", () => {
    let $: GameState;
    let P: PlayerState;

    beforeEach(() => {
      $ = initDummyGameState();
      P = $.players[$.activePlayer];
    });

    describe("startGame()", () => {
      it("should advance the game through the initial phases for P1", () => {
        $ = createInitialGameState([
          {
            starterDeckSpec: "ANARCHY",
            otherSpecs: [ "BLOOD", "FIRE" ],
          }, {
            starterDeckSpec: "BALANCE",
            otherSpecs: [ "FERAL", "GROWTH" ],
          },
        ]);
        P = $.players[$.activePlayer];

        expect($.round).to.equal(1);
        expect($.activePlayer).to.equal(P1);
        expect($.turnPhase).to.equal("READY");
        expect(P.hand.length).to.equal(5);
        expect(P.deck.length).to.equal(5);
        expect(P.discard.length).to.equal(0);
        expect(P.gold).to.equal(0);

        startGame($);

        expect($.round).to.equal(1);
        expect($.activePlayer).to.equal(P1);
        expect($.turnPhase).to.equal("MAIN");
        expect(P.hand.length).to.equal(5);
        expect(P.deck.length).to.equal(5);
        expect(P.discard.length).to.equal(0);
        expect(P.gold).to.equal(P.workers);
      });
    });

    describe("Ready Phase", () => {
      beforeEach(() => {
        $.turnPhase = "TECH";
      });

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

      it("should bring dead heroes closer to being summonable", () => {
        P.heroFatigue[P.specs.indexOf("ANARCHY")] = HERO_DEATH_FATIGUE;

        techCards($, []);

        expect(P.heroFatigue[P.specs.indexOf("ANARCHY")])
          .to.equal(HERO_DEATH_FATIGUE - 1);
      });
    });

    describe("Upkeep Phase", () => {
      beforeEach(() => {
        $.turnPhase = "TECH";
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

      it("should bring dead heroes closer to being summonable", () => {
        P.heroFatigue[P.specs.indexOf("ANARCHY")] = HERO_DEATH_FATIGUE;

        endTurn($);

        expect(P.heroFatigue[P.specs.indexOf("ANARCHY")])
          .to.equal(HERO_DEATH_FATIGUE - 1);
      });
    });

    describe("Tech Phase", () => {
      it("should skip the tech phase on the first round", () => {
        endTurn($);

        expect($.activePlayer).to.equal(P2);
        expect($.turnPhase).to.equal("MAIN");
      });

      it("should require 2 teched cards after the first round", () => {
        endTurn($);
        endTurn($);

        expect($.activePlayer).to.equal(P1);
        expect($.turnPhase).to.equal("TECH");

        expect(() => techCards($, [])).to.throw("not enough cards to tech");
      });

      it("should add the player's teched cards to the discard pile", () => {
        endTurn($);
        endTurn($);

        expect($.activePlayer).to.equal(P1);
        expect($.turnPhase).to.equal("TECH");

        techCards($, [ "Crash Bomber", "Firebat" ]);

        expect($.turnPhase).to.equal("MAIN");
        expect(P.discard.includes("Crash Bomber")).to.equal(true);
        expect(P.discard.includes("Firebat")).to.equal(true);
      });

      it("should reject attempts to tech more than 2 cards", () => {
        endTurn($);
        endTurn($);

        expect($.activePlayer).to.equal(P1);
        expect($.turnPhase).to.equal("TECH");

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
        $.turnPhase = "TECH";

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
        $.turnPhase = "TECH";
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
        endTurn($);

        expect($.activePlayer).to.equal(P2);
        expect($.round).to.equal(1);

        endTurn($);

        expect($.activePlayer).to.equal(P1);
        expect($.round).to.equal(2);
      });
    });
  });
});
