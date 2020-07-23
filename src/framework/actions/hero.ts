import { GameState, HeroCard, Instance, PlayerState } from "../types";
import { isHero, queryInstances } from "../queries/common";
import { lookupCard } from "../../data";
import { HERO_DEATH_FATIGUE } from "../constants";

export const canPlayHero = ($: GameState, hero: HeroCard): boolean => {
  const P = $.players[$.activePlayer];

  const specIndex = P.specs.indexOf(hero.spec);

  if (specIndex === -1) {
    // throw new Error("does not have chosen hero");
    return false;
  }

  if (
    queryInstances($, { card: hero.name, player: $.activePlayer }).length > 0
  ) {
    // throw new Error("hero already in play");
    return false;
  }

  if (P.heroFatigue[specIndex] > 0) {
    // throw new Error("hero has died too recently");
    return false;
  }

  return true;
};

export const handleHeroDeath = (P: PlayerState, hero: Instance): void => {
  const heroCard = lookupCard(hero.card);

  if (isHero(heroCard)) {
    if (P.specs.includes(heroCard.spec)) {
      P.heroFatigue[P.specs.indexOf(heroCard.spec)] = HERO_DEATH_FATIGUE;
    }
  }
};

export const decrementHeroFatigue = (P: PlayerState): void => {
  for (let i = 0; i < P.specs.length; i++) {
    P.heroFatigue[i] = Math.max(P.heroFatigue[i] - 1, 0);
  }
};
