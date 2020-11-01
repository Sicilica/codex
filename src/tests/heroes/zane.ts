import { expect } from "chai";

import { GameEngine } from "../../framework/engine";
import {
  createInstance,
  dealDamage,
  giveLevels,
} from "../../framework/mutators";
import {
  InstanceState,
  PlayerState,
} from "../../framework/types";

import {
  P1,
  P2,
  debugAction,
  debugAutoResolve,
  debugValidateEffects,
  makeDefaultGame,
} from "../testhelper";

describe("heroes", () => {
  describe("Captain Zane", () => {
    let $: GameEngine;
    let P: PlayerState;
    let zane: InstanceState;
    let oppP: PlayerState;

    beforeEach(() => {
      $ = makeDefaultGame();
      P = $.state.players[P1];
      zane = createInstance($, P, $.data.lookupCard("Captain Zane"));
      oppP = $.state.players[P2];
    });

    describe("mid band", () => {
      beforeEach(() => {
        zane.level = 4;
      });

      it("gives gold when killing a scavenger", () => {
        const scavenger =
          createInstance($, oppP, $.data.lookupCard("Nautical Dog"));
        oppP.patrol.SCAVENGER = scavenger.id;

        expect(P.gold).to.equal(4);
        dealDamage($, scavenger, 1, zane);
        debugAutoResolve($);
        expect(P.gold).to.equal(5);
      });

      it("gives card draw when killing a technician", () => {
        const technician =
          createInstance($, oppP, $.data.lookupCard("Nautical Dog"));
        oppP.patrol.TECHNICIAN = technician.id;

        expect(P.hand.length).to.equal(5);
        dealDamage($, technician, 1, zane);
        debugAutoResolve($);
        expect(P.hand.length).to.equal(6);
      });
    });

    describe("max band", () => {
      let patroller: InstanceState;
      let effectID: string;

      beforeEach(() => {
        patroller =
          createInstance($, oppP, $.data.lookupCard("Bloodrage Ogre"));
        oppP.patrol.SQUAD_LEADER = patroller.id;

        giveLevels($, zane, 5);

        expect($.state.unresolvedEffects.length).to.equal(1);
        effectID = $.state.unresolvedEffects[0].id;
      });

      it("moves a patroller to an empty space", () => {
        expect(oppP.patrol.SQUAD_LEADER).to.equal(patroller.id);

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID,
          params: {
            instance: patroller.id,
            slot: "ELITE",
          },
        });

        expect(oppP.patrol.SQUAD_LEADER).to.equal(null);
        expect(oppP.patrol.ELITE).to.equal(patroller.id);
      });

      it("deals 1 damage", () => {
        expect(patroller.damage).to.equal(0);

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID,
          params: {
            instance: patroller.id,
            slot: "ELITE",
          },
        });

        expect(patroller.damage).to.equal(1);
      });

      it("can't leave the patroller in place", () => {
        expect(() => debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID,
          params: {
            instance: patroller.id,
            slot: "SQUAD_LEADER",
          },
        })).to.throw("must shove target to empty slot");
      });

      it("can't move a patroller into an occupied slot", () => {
        oppP.patrol.ELITE =
          createInstance($, oppP, $.data.lookupCard("Nautical Dog")).id;

        expect(() => debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID,
          params: {
            instance: patroller.id,
            slot: "SQUAD_LEADER",
          },
        })).to.throw("must shove target to empty slot");
      });

      it("triggers Zane's midband if it kills the target", () => {
        patroller.damage = 1;

        expect(P.gold).to.equal(4);

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID,
          params: {
            instance: patroller.id,
            slot: "SCAVENGER",
          },
        });

        expect(P.gold).to.equal(5);
        expect(oppP.patrol.SCAVENGER).to.equal(null);
      });

      it("counts as a targeted ability", () => {
        oppP.patrol.SQUAD_LEADER = null;
        oppP.patrol.LOOKOUT = patroller.id;

        expect(P.gold).to.equal(4);

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID,
          params: {
            instance: patroller.id,
            slot: "ELITE",
          },
        });

        expect(P.gold).to.equal(3);
      });

      it("can't be used if there are no patrollers", () => {
        oppP.patrol.SQUAD_LEADER = null;

        debugValidateEffects($);

        expect($.state.unresolvedEffects.length).to.equal(0);
      });

      it("deals damage to a patroller without moving it if the patrol " +
        "zone is full", () => {
        oppP.patrol.ELITE =
          createInstance($, oppP, $.data.lookupCard("Nautical Dog")).id;
        oppP.patrol.TECHNICIAN =
          createInstance($, oppP, $.data.lookupCard("Nautical Dog")).id;
        oppP.patrol.SCAVENGER =
          createInstance($, oppP, $.data.lookupCard("Nautical Dog")).id;
        oppP.patrol.LOOKOUT =
          createInstance($, oppP, $.data.lookupCard("Nautical Dog")).id;

        expect(patroller.damage).to.equal(0);
        expect(oppP.patrol.SQUAD_LEADER).to.equal(patroller.id);

        debugAction($, {
          type: "RESOLVE_EFFECT",
          effect: effectID,
          params: {
            instance: patroller.id,
            slot: "SQUAD_LEADER",
          },
        });

        expect(patroller.damage).to.equal(1);
        expect(oppP.patrol.SQUAD_LEADER).to.equal(patroller.id);
      });

      it("can't be used without funds if all targets have resist", () => {
        oppP.patrol.SQUAD_LEADER = null;
        oppP.patrol.LOOKOUT = patroller.id;
        P.gold = 0;

        debugValidateEffects($);

        expect($.state.unresolvedEffects.length).to.equal(0);
      });
    });
  });
});
