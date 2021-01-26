import { expect } from "chai";

import { BASE_CARD } from "../../data/core";
import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { PlayerID, PlayerState } from "../../framework/types";
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
    });
  });
});
