import { expect } from "chai";

import { GameEngine } from "../../framework/engine";
import { createInstance } from "../../framework/mutators";
import { InstanceState, PlayerState } from "../../framework/types";

import {
  P1,
  P2,
  debugAction,
  debugAutoResolve,
  makeDefaultGame,
} from "../testhelper";

describe("combat", () => {
  describe("+/- runes", () => {
    let $: GameEngine;
    let P: PlayerState;
    let oppP: PlayerState;
    let I: InstanceState;
    let oppI: InstanceState;

    beforeEach(() => {
      $ = makeDefaultGame();

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      P = $.getPlayer(P1)!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      oppP = $.getPlayer(P2)!;
      I = createInstance($, P, $.data.lookupCard("Mad Man"));
      oppI = createInstance($, oppP, $.data.lookupCard("Tiger Cub"));
      I._arrivalFatigue = false;
      debugAutoResolve($);
    });

    it("increases the damage dealt by the number of + runes", () => {
      I.plusMinusRunes = 1;

      debugAction($, {
        type: "ATTACK",
        attacker: I.id,
        defender: oppI.id,
      });
      expect(oppI.dead).to.equal(true);
    });

    it("reduces the damage dealt by the number of - runes", () => {
      I.plusMinusRunes = -1;

      debugAction($, {
        type: "ATTACK",
        attacker: I.id,
        defender: oppI.id,
      });
      expect(oppI.dead).to.equal(false);
      expect(oppI.damage).to.equal(0);
    });

    it("increases health by the number of + runes", () => {
      I.plusMinusRunes = 2;

      debugAction($, {
        type: "ATTACK",
        attacker: I.id,
        defender: oppI.id,
      });
      expect(I.dead).to.equal(false);
      expect(I.damage).to.equal(2);
    });

    it("reduces health by the number of - runes", () => {
      oppI.plusMinusRunes = -1;

      debugAction($, {
        type: "ATTACK",
        attacker: I.id,
        defender: oppI.id,
      });
      expect(oppI.dead).to.equal(true);
      expect(oppI.damage).to.equal(1);
    });
  });
});
