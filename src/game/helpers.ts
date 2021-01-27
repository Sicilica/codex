import {
  getHeroLimit,
  getTech,
  hasTrait,
  isMaxLevel,
  isSpell,
} from "../framework/accessors";
import { GameEngine } from "../framework/engine";
import {
  Card,
  CardID,
  HeroCard,
  InstanceID,
  InstanceState,
  PlayerState,
} from "../framework/types";

export const requireCardPlayableAndGetCost = (
  $: GameEngine,
  P: PlayerState,
  card: Card,
  boost: boolean,
): number => {
  const tech = getTech(card);
  if (tech != null) {
    if (tech > 0) {
      requireUsableTechBuilding($, P, tech);
    }

    if (tech > 1) {
      if (P.mainSpec !== card.spec && P.techLabSpec !== card.spec) {
        throw new Error("this spec is inaccessible");
      }
    }
  }

  let cost: number;
  if (boost) {
    if (card.boostCost == null) {
      throw new Error("card is not boostable");
    }
    cost = card.boostCost;
  } else {
    cost = card.cost;
  }

  if (isSpell(card)) {
    if (card.spec == null) {
      // For basic spells, must have any hero, but have to pay extra for
      // cross-color
      const freeHero = $.findInstance({
        color: card.color,
        player: P.id,
        type: "HERO",
      });
      if (freeHero == null) {
        const crossHero = $.findInstance({
          player: P.id,
          type: "HERO",
        });
        if (crossHero == null) {
          throw new Error("cannot cast without a hero");
        }
        cost += 1;
      }
    } else {
      // For non-basic spells, must have the correct hero, and must be max-band
      // for ultimate spells
      const hero = $.findInstance({
        player: P.id,
        spec: card.spec,
        type: "HERO",
      });
      if (hero == null) {
        throw new Error("cannot cast without the associated hero");
      }

      if (card.ultimate) {
        if (!isMaxLevel($, hero) || hero.level !== hero.levelAtTurnStart) {
          throw new Error("hero must have started the turn at max band");
        }
      }
    }
  }

  requireGold(P, cost);

  return cost;
};

export const checkHasControl = (
  P: PlayerState,
  I: InstanceState,
): void => {
  if (I.controller !== P.id) {
    throw new Error("instance is not under your control");
  }
};

export const checkCanExhaust = (
  $: GameEngine,
  I: InstanceState,
): void => {
  checkReady(I);
  if (I.arrivalFatigue && !hasTrait($, I, "HASTE")) {
    throw new Error("instance cannot attack on the turn it arrived");
  }
};

export const checkReady = (
  I: InstanceState,
): void => {
  if (I.readyState !== "READY") {
    throw new Error("instance is not ready");
  }
};

export const checkCanAttack = (
  $: GameEngine,
  I: InstanceState,
): void => {
  checkUnitOrHero($, I);

  if (hasTrait($, I, "NO_ATTACK")) {
    throw new Error("instance is not allowed to attack");
  }
};

export const checkUnitOrHero = (
  $: GameEngine,
  I: InstanceState,
): void => {
  const card = $.data.lookupCard(I.card);
  if (card.type !== "UNIT" && card.type !== "HERO") {
    throw new Error("instance is not a unit or hero");
  }
};

export const requireActivePlayer = (
  $: GameEngine,
): PlayerState => {
  const P = $.getPlayer($.state.activePlayer);
  if (P == null) {
    throw new Error("failed to find active player");
  }
  return P;
};

export const requireCardInHand = (
  P: PlayerState,
  cid: CardID,
): void => {
  if (!P.hand.includes(cid)) {
    throw new Error("card not in hand");
  }
};

export const requireGold = (
  P: PlayerState,
  amount: number,
): void => {
  if (P.gold < amount) {
    throw new Error("not enough gold");
  }
};

export const requireHeroPlayable = (
  $: GameEngine,
  P: PlayerState,
  hero: HeroCard,
): void => {
  if (P.heroes[hero.id] !== "AVAILABLE") {
    throw new Error("hero is not available");
  }

  const heroesInPlay = Array.from($.queryInstances({
    player: P.id,
    type: "HERO",
  })).length;
  if (heroesInPlay >= getHeroLimit($, P)) {
    throw new Error("hero limit reached");
  }
};

export const requireInstance = (
  $: GameEngine,
  iid: InstanceID | null,
): InstanceState => {
  const I = $.getInstance(iid);
  if (I == null) {
    throw new Error("instance not found");
  }
  return I;
};

export const requireMainPhase = (
  $: GameEngine,
): void => {
  if ($.state.turnPhase !== "MAIN") {
    throw new Error("this action is only available during the main phase");
  }
  if ($.state.unresolvedEffects.length > 0) {
    throw new Error("all pending effects must be resolved first");
  }
  if ($.state.unresolvedCombat != null) {
    throw new Error("combat must be resolved first");
  }
};

export const requireUsableTechBuilding = (
  $: GameEngine,
  P: PlayerState,
  tech: number,
): void => {
  const techBuilding = $.getInstance(P.techBuildings[tech - 1]);
  if (techBuilding == null) {
    throw new Error("missing tech building");
  }
  if (techBuilding.arrivalFatigue) {
    throw new Error("tech building is still being built");
  }
  if (techBuilding.readyState !== "READY") {
    throw new Error("tech building is disabled");
  }
};
