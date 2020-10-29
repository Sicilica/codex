import { expect } from "chai";

import { performAction } from "../../framework/old/actions";
import {
  dealDamage,
  giveLevels,
  makeInstance,
} from "../../framework/old/actions/helpers";
import { ensurePromptsAreValid } from "../../framework/prompts";
import { GameState, Instance } from "../../framework/types";

import {
  P1,
  P2,
  initDummyGameState,
} from "../testhelper";

describe("heroes", () => {
  describe("Captain Zane", () => {
    let $: GameState;
    let zane: Instance;

    beforeEach(() => {
      $ = initDummyGameState();
      zane = makeInstance($, P1, "Captain Zane");
    });

    describe("mid band", () => {
      beforeEach(() => {
        zane.level = 4;
      });

      it("gives gold when killing a scavenger", () => {
        const scavenger = makeInstance($, P2, "Nautical Dog");
        $.players[P2].patrol.scavenger = scavenger.id;

        expect($.players[P1].gold).to.equal(4);
        dealDamage($, scavenger, 1, zane);
        expect($.players[P1].gold).to.equal(5);
      });

      it("gives card draw when killing a technician", () => {
        const technician = makeInstance($, P2, "Nautical Dog");
        $.players[P2].patrol.technician = technician.id;

        expect($.players[P1].hand.length).to.equal(5);
        dealDamage($, technician, 1, zane);
        expect($.players[P1].hand.length).to.equal(6);
      });
    });

    describe("max band", () => {
      let patroller: Instance;

      beforeEach(() => {
        patroller = makeInstance($, P2, "Bloodrage Ogre");
        $.players[P2].patrol.squadLeader = patroller.id;

        giveLevels($, zane, 5);

        expect($.blockingPrompts.length).to.equal(1);
      });

      it("moves a patroller to an empty space", () => {
        expect($.players[P2].patrol.squadLeader).to.equal(patroller.id);

        performAction($, {
          type: "RESPOND_TO_PROMPT",
          index: 0,
          response: {
            type: "ZANE_MAX_BAND",
            instance: patroller.id,
            slot: "elite",
          },
        });

        expect($.players[P2].patrol.squadLeader).to.equal(null);
        expect($.players[P2].patrol.elite).to.equal(patroller.id);
      });

      it("deals 1 damage", () => {
        expect(patroller.damage).to.equal(0);

        performAction($, {
          type: "RESPOND_TO_PROMPT",
          index: 0,
          response: {
            type: "ZANE_MAX_BAND",
            instance: patroller.id,
            slot: "elite",
          },
        });

        expect(patroller.damage).to.equal(1);
      });

      it("can't leave the patroller in place", () => {
        expect(() => performAction($, {
          type: "RESPOND_TO_PROMPT",
          index: 0,
          response: {
            type: "ZANE_MAX_BAND",
            instance: patroller.id,
            slot: "squadLeader",
          },
        })).to.throw("must shove target to empty slot");
      });

      it("can't move a patroller into an occupied slot", () => {
        $.players[P2].patrol.elite = makeInstance($, P2, "Nautical Dog").id;

        expect(() => performAction($, {
          type: "RESPOND_TO_PROMPT",
          index: 0,
          response: {
            type: "ZANE_MAX_BAND",
            instance: patroller.id,
            slot: "squadLeader",
          },
        })).to.throw("must shove target to empty slot");
      });

      it("triggers Zane's midband if it kills the target", () => {
        patroller.damage = 1;

        expect($.players[P1].gold).to.equal(4);

        performAction($, {
          type: "RESPOND_TO_PROMPT",
          index: 0,
          response: {
            type: "ZANE_MAX_BAND",
            instance: patroller.id,
            slot: "scavenger",
          },
        });

        expect($.players[P1].gold).to.equal(5);
        expect($.players[P2].patrol.scavenger).to.equal(null);
      });

      it("counts as a targeted ability", () => {
        $.players[P2].patrol.squadLeader = null;
        $.players[P2].patrol.lookout = patroller.id;

        expect($.players[P1].gold).to.equal(4);

        performAction($, {
          type: "RESPOND_TO_PROMPT",
          index: 0,
          response: {
            type: "ZANE_MAX_BAND",
            instance: patroller.id,
            slot: "elite",
          },
        });

        expect($.players[P1].gold).to.equal(3);
      });

      it("can't be used if there are no patrollers", () => {
        $.players[P2].patrol.squadLeader = null;

        ensurePromptsAreValid($);

        expect($.blockingPrompts.length).to.equal(0);
      });

      it("deals damage to a patroller without moving it if the patrol " +
        "zone is full", () => {
        $.players[P2].patrol.elite = makeInstance($, P2, "Nautical Dog").id;
        $.players[P2].patrol.technician
          = makeInstance($, P2, "Nautical Dog").id;
        $.players[P2].patrol.scavenger
          = makeInstance($, P2, "Nautical Dog").id;
        $.players[P2].patrol.lookout = makeInstance($, P2, "Nautical Dog").id;

        expect(patroller.damage).to.equal(0);
        expect($.players[P2].patrol.squadLeader).to.equal(patroller.id);

        performAction($, {
          type: "RESPOND_TO_PROMPT",
          index: 0,
          response: {
            type: "ZANE_MAX_BAND",
            instance: patroller.id,
            slot: "squadLeader",
          },
        });

        expect(patroller.damage).to.equal(1);
        expect($.players[P2].patrol.squadLeader).to.equal(patroller.id);
      });

      it("can't be used without funds if all targets have resist", () => {
        $.players[P2].patrol.squadLeader = null;
        $.players[P2].patrol.lookout = patroller.id;
        $.players[P1].gold = 0;

        ensurePromptsAreValid($);

        expect($.blockingPrompts.length).to.equal(0);
      });
    });
  });
});
