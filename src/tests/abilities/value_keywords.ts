import { expect } from "chai";
import { createInstance } from "../../framework/mutators";
import { requireActivePlayer } from "../../game/helpers";
import {
  P1,
  debugAutoResolve,
  debugGotoNextTurn,
  makeDefaultGame,
} from "../testhelper";

describe("abilities", () => {
  describe("value_keywords", () => {
    describe("ARMOR", () => {
      it.skip("takes damage before health");

      it.skip("replenishes during each ready phase");
    });

    describe("HEALING", () => {
      it("should only heal damaged units and heroes", () => {
        const $ = makeDefaultGame();
        const P = requireActivePlayer($);

        const base = $.getInstance(P.base);
        if (base == null) {
          throw new Error("Player should have a base");
        }
        base.damage = 10;

        const tree = createInstance($, P, $.data.lookupCard("Verdant Tree"));
        tree.damage = 1;

        const tiger = createInstance($, P, $.data.lookupCard("Tiger Cub"));
        const panda = createInstance($, P, $.data.lookupCard("Playful Panda"));
        panda.damage = 1;

        const midori =
          createInstance($, P, $.data.lookupCard("Master Midori"));
        const argagarg =
          createInstance($, P, $.data.lookupCard("Argagarg Garg"));
        midori.damage = 1;

        debugAutoResolve($);
        debugGotoNextTurn($, P1);

        expect(base.damage).to.equal(10);
        expect(tree.damage).to.equal(1);

        expect(tiger.damage).to.equal(0);
        expect(panda.damage).to.equal(0);
        expect(midori.damage).to.equal(0);
        expect(argagarg.damage).to.equal(0);
      });

      it("should interact correctly with +1/+1 and -1/-1 runes", () => {
        const $ = makeDefaultGame();
        const P = requireActivePlayer($);

        const plus =
          createInstance($, P, $.data.lookupCard("Rampaging Elephant"));
        const minus =
          createInstance($, P, $.data.lookupCard("Rampaging Elephant"));

        plus.plusMinusRunes = 3;
        plus.damage = 3;
        minus.plusMinusRunes = -3;
        minus.damage = 3;

        createInstance($, P, $.data.lookupCard("Verdant Tree"));
        createInstance($, P, $.data.lookupCard("Verdant Tree"));
        createInstance($, P, $.data.lookupCard("Verdant Tree"));
        createInstance($, P, $.data.lookupCard("Verdant Tree"));

        debugGotoNextTurn($, P1);

        expect(plus.damage).to.equal(0);
        expect(minus.damage).to.equal(0);
      });

      it("should heal the correct amount", () => {
        const $ = makeDefaultGame();
        const P = requireActivePlayer($);

        const saveAKillSpellToDealWithThisGuy =
          createInstance($, P, $.data.lookupCard("Cinderblast Dragon"));

        createInstance($, P, $.data.lookupCard("Verdant Tree"));
        saveAKillSpellToDealWithThisGuy.damage = 1;
        debugGotoNextTurn($, P1);
        expect(saveAKillSpellToDealWithThisGuy.damage).to.equal(0);

        saveAKillSpellToDealWithThisGuy.damage = 2;
        debugGotoNextTurn($, P1);
        expect(saveAKillSpellToDealWithThisGuy.damage).to.equal(1);

        createInstance($, P, $.data.lookupCard("Verdant Tree"));
        saveAKillSpellToDealWithThisGuy.damage = 2;
        debugGotoNextTurn($, P1);
        expect(saveAKillSpellToDealWithThisGuy.damage).to.equal(0);

        saveAKillSpellToDealWithThisGuy.damage = 1;
        debugGotoNextTurn($, P1);
        expect(saveAKillSpellToDealWithThisGuy.damage).to.equal(0);
      });
    });

    describe("RESIST", () => {
      it.skip("costs money to target the unit");

      it.skip("prevents targeting the unit without sufficient gold");
    });
  });
});
