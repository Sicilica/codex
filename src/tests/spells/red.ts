import { expect } from "chai";

import { BASE_CARD, TECH_BUILDING_CARDS } from "../../data/core";
import { getAttribute, hasArrivalFatigue } from "../../framework/accessors";
import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { InstanceID, PlayerID, PlayerState } from "../../framework/types";
import { requireActivePlayer } from "../../game/helpers";

import {
  P2,
  debugAction,
  debugPlayCard,
  makeDefaultGame,
} from "../testhelper";

describe("spells", () => {
  describe("red", () => {
    let $: GameEngine;
    let P: PlayerState;
    let oppP: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = requireActivePlayer($);
      oppP = $.state.players[P2];
    });

    describe("Charge", () => {
      beforeEach(() => {
        const EX_RED_HERO = $.data.lookupCard("Captain Zane");
        createInstance($, P, EX_RED_HERO);
      });

      const playAndResolveCharge = (
        target: InstanceID,
      ): void => {
        debugPlayCard($, "Charge");
        expect($.state.unresolvedEffects.length).to.equal(1);
        const eid = $.state.unresolvedEffects[0].id;

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: eid,
          params: {
            target,
          },
        });
      };

      it("gives +1 ATK and Haste", () => {
        const I = createInstance($, P, $.data.lookupCard("Bloodrage Ogre"));
        // Create a second one so spell cast doesn't auto-resolve without
        // waiting for target
        createInstance($, P, $.data.lookupCard("Bloodrage Ogre"));
        expect(hasArrivalFatigue($, I)).to.equal(true);

        playAndResolveCharge(I.id);
        expect(hasArrivalFatigue($, I)).to.equal(false);
        expect(getAttribute($, I, "ATTACK")).to.equal(4);
      });

      it("can only target units", () => {
        createInstance($, P, $.data.lookupCard("Bloodrage Ogre"));
        // Create a second one so spell cast doesn't auto-resolve without
        // waiting for target
        createInstance($, P, $.data.lookupCard("Bloodrage Ogre"));
        const I = $.findInstance({
          player: P.id,
          card: "Captain Zane",
        });

        if (I == null) {
          throw new Error("Could not find hero");
        }

        expect(
          () => playAndResolveCharge(I.id)
        ).to.throw("invalid params for effect: invalid param [target]");
      });

      it("cannot target enemy units", () => {
        createInstance($, P, $.data.lookupCard("Bloodrage Ogre"));
        // Create a second one so spell cast doesn't auto-resolve without
        // waiting for target
        createInstance($, P, $.data.lookupCard("Bloodrage Ogre"));

        const I = createInstance($, oppP, $.data.lookupCard("Tiger Cub"));

        expect(
          () => playAndResolveCharge(I.id)
        ).to.throw("invalid params for effect: invalid param [target]");
      });

      it.skip("counts as a target effect", () => {
        expect(true).to.equal(false);
      });
    });

    describe("Pillage", () => {
      beforeEach(() => {
        const EX_RED_HERO = $.data.lookupCard("Captain Zane");
        createInstance($, P, EX_RED_HERO);
      });

      const playAndResolvePillage = (
        targetPlayer: PlayerID,
      ): void => {
        debugPlayCard($, "Pillage");
        expect($.state.unresolvedEffects.length).to.equal(1);
        const eid = $.state.unresolvedEffects[0].id;

        const base = $.findInstance({
          card: BASE_CARD.id,
          player: targetPlayer,
        });
        if (base == null) {
          throw new Error("failed to find base for pillage");
        }

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: eid,
          params: {
            target: base.id,
          },
        });
      };

      it("deals damage to the target's base", () => {
        playAndResolvePillage(oppP.id);
        expect($.getInstance(oppP.base)?.damage).to.equal(1);

        const EX_PIRATE_CARD = $.data.lookupCard("Bombaster");
        createInstance($, P, EX_PIRATE_CARD);

        playAndResolvePillage(oppP.id);
        expect($.getInstance(oppP.base)?.damage).to.equal(3);
      });

      it("can't steal more gold than the target has", () => {
        P.gold = 0;
        oppP.gold = 0;
        playAndResolvePillage(oppP.id);
        expect(P.gold).to.equal(0);
        expect(oppP.gold).to.equal(0);

        P.gold = 0;
        oppP.gold = 1;
        playAndResolvePillage(oppP.id);
        expect(P.gold).to.equal(1);
        expect(oppP.gold).to.equal(0);

        const EX_PIRATE_CARD = $.data.lookupCard("Bombaster");
        createInstance($, P, EX_PIRATE_CARD);

        P.gold = 0;
        oppP.gold = 1;
        playAndResolvePillage(oppP.id);
        expect(P.gold).to.equal(1);
        expect(oppP.gold).to.equal(0);

        P.gold = 0;
        oppP.gold = 2;
        playAndResolvePillage(oppP.id);
        expect(P.gold).to.equal(2);
        expect(oppP.gold).to.equal(0);

        P.gold = 0;
        oppP.gold = 3;
        playAndResolvePillage(oppP.id);
        expect(P.gold).to.equal(2);
        expect(oppP.gold).to.equal(1);
      });

      it.skip("counts as a target effect", () => {
        playAndResolvePillage(oppP.id);
      });
    });

    describe("Scorch", () => {
      beforeEach(() => {
        const EX_RED_HERO = $.data.lookupCard("Captain Zane");
        createInstance($, P, EX_RED_HERO);
      });

      const playAndResolveScorch = (
        target: InstanceID,
      ): void => {
        debugPlayCard($, "Scorch");
        expect($.state.unresolvedEffects.length).to.equal(1);
        const eid = $.state.unresolvedEffects[0].id;

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: eid,
          params: {
            target,
          },
        });
      };

      it("can damage any patroller", () => {
        const I = createInstance($, oppP, $.data.lookupCard("Tiger Cub"));
        const I2 = createInstance($, oppP, $.data.lookupCard("Tiger Cub"));
        oppP.patrol.SQUAD_LEADER = I.id;
        oppP.patrol.ELITE = I2.id;

        playAndResolveScorch(I.id);
        playAndResolveScorch(I2.id);

        expect(I.damage).to.equal(1);
        expect(I2.damage).to.equal(2);
      });

      it("can damage any building", () => {
        playAndResolveScorch(oppP.base);

        expect($.getInstance(oppP.base)?.damage).to.equal(2);

        const tech = createInstance($, oppP, TECH_BUILDING_CARDS[0]);
        playAndResolveScorch(tech.id);

        expect(tech.damage).to.equal(2);
      });

      it("cannot damage non-patrollers", () => {
        const I = createInstance($, oppP, $.data.lookupCard("Tiger Cub"));

        expect(
          () => playAndResolveScorch(I.id)
        ).to.throw("invalid params for effect: invalid param [target]");
      });

      it.skip("counts as a target effect", () => {
        expect(true).to.equal(false);
      });
    });
  });
});
