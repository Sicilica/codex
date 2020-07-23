import { GameState, HeroCard, PlayerState } from "../../framework/types";
import { initDummyGameState } from "../testhelper";
import { getSpecHero } from "../../data/spec";
import { canPlayHero } from "../../framework/actions/hero";
import { lookupCard } from "../../data";
import { expect } from "chai";
import { makeInstance } from "../../framework/actions/helpers";
import { HERO_DEATH_FATIGUE } from "../../framework/constants";

describe("basic", () => {
  describe("hero", () => {
    let $: GameState;
    let P: PlayerState;

    beforeEach(() => {
      $ = initDummyGameState();
      P = $.players[$.activePlayer];
    });

    describe("canPlayHero", () => {
      it("should only allow heroes from the player's specs", () => {
        expect(
          canPlayHero($, lookupCard(getSpecHero("GROWTH")) as HeroCard)
        ).to.equal(false);
      });

      it("should not allow two copies of a hero", () => {
        makeInstance($, $.activePlayer, getSpecHero("ANARCHY"));

        expect(
          canPlayHero($, lookupCard(getSpecHero("ANARCHY")) as HeroCard)
        ).to.equal(false);
      });

      it("should not allow playing heroes who died recently", () => {
        P.heroFatigue[P.specs.indexOf("ANARCHY")] = HERO_DEATH_FATIGUE;

        expect(
          canPlayHero($, lookupCard(getSpecHero("ANARCHY")) as HeroCard)
        ).to.equal(false);
      });

      it("should allow playing heroes when all requirements are met", () => {
        expect(
          canPlayHero($, lookupCard(getSpecHero("ANARCHY")) as HeroCard)
        ).to.equal(true);
      });
    });
  });
});
