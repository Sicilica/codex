import { PATROL_SLOTS } from "../constants";
import { GameEngine } from "../engine";
import {
  ActivatedAbility,
  ActivatedAbilityID,
  Attribute,
  CardType,
  GameState,
  HeroCard,
  HeroCardBand,
  InstanceState,
  PatrolSlot,
  Tag,
  Trait,
  TriggerType,
  TriggeredAbility,
} from "../types";

export const canPatrol = (
  $: GameEngine,
  I: InstanceState | null,
): boolean => {
  if (I == null) {
    return false;
  }

  const card = $.data.lookupCard(I.card);
  if (card.type !== "HERO" && card.type !== "UNIT") {
    return false;
  }

  if (I.readyState !== "READY") {
    return false;
  }

  if (hasTrait($, I, "NO_PATROL")) {
    return false;
  }

  return true;
};

export const canPerformAttack = (
  $: GameEngine,
  I: InstanceState | null,
): boolean => {
  if (I == null) {
    return false;
  }

  const card = $.data.lookupCard(I.card);
  if (card.type !== "HERO" && card.type !== "UNIT") {
    return false;
  }

  if (I.readyState !== "READY") {
    return false;
  }

  if (I.arrivalFatigue && !hasTrait($, I, "HASTE")) {
    return false;
  }

  if (getAttribute($, I, "ATTACK") <= 0) {
    return false;
  }

  return true;
};

export const getActivatedAbility = (
  $: GameEngine,
  I: InstanceState | null,
  aid: ActivatedAbilityID,
): ActivatedAbility | null => {
  for (const ability of getActivatedAbilities($, I)) {
    if (ability.id === aid) {
      return ability;
    }
  }

  return null;
};

export const getAttribute = (
  $: GameEngine,
  I: InstanceState | null,
  q: Attribute,
): number => {
  let sum = 0;

  for (const val of getAttributeValues($, I, q)) {
    sum += val;
  }

  return sum;
};

export function *getTriggeredAbilities(
  $: GameEngine,
  I: InstanceState | null,
  q: TriggerType,
): Iterable<TriggeredAbility> {
  if (I == null) {
    return;
  }

  const C = $.data.lookupCard(I.card);
  if (C.type === "HERO") {
    for (const band of getBands(C, I.level)) {
      for (const ability of band.triggeredAbilities) {
        if (ability.type === q) {
          yield ability;
        }
      }
    }
  } else if (C.type !== "INSTANT_SPELL") {
    for (const ability of C.triggeredAbilities) {
      if (ability.type === q) {
        yield ability;
      }
    }
  }
}

export const getType = (
  $: GameEngine,
  I: InstanceState,
): CardType => {
  const card = $.data.lookupCard(I.card);
  return card.type;
};

export const getPatrolSlot = (
  $: GameState,
  I: InstanceState | null,
): PatrolSlot | null => {
  if (I == null) {
    return null;
  }
  const P = $.players[I.controller];
  if (P == null) {
    return null;
  }

  for (const slot of PATROL_SLOTS) {
    if (P.patrol[slot] === I.id) {
      return slot;
    }
  }
  return null;
};

export const hasTag = (
  $: GameEngine,
  I: InstanceState | null,
  q: Tag,
): boolean => {
  for (const val of getTags($, I)) {
    if (val === q) {
      return true;
    }
  }
  return false;
};

export const hasTrait = (
  $: GameEngine,
  I: InstanceState | null,
  q: Trait,
): boolean => {
  for (const val of getTraits($, I)) {
    if (val === q) {
      return true;
    }
  }
  return false;
};

export const isPatrolling = (
  $: GameState,
  I: InstanceState | null,
): boolean => {
  return getPatrolSlot($, I) != null;
};

function *getActivatedAbilities(
  $: GameEngine,
  I: InstanceState | null,
): Iterable<ActivatedAbility> {
  if (I == null) {
    return;
  }

  const C = $.data.lookupCard(I.card);
  if (C.type === "HERO") {
    for (const band of getBands(C, I.level)) {
      for (const ability of band.activatedAbilities) {
        yield ability;
      }
    }
  } else if (C.type !== "INSTANT_SPELL") {
    for (const ability of C.activatedAbilities) {
      yield ability;
    }
  }
}

function *getAttributeValues(
  $: GameEngine,
  I: InstanceState | null,
  q: Attribute,
): Iterable<number> {
  if (I == null) {
    return;
  }

  const P = $.getPlayer(I.controller);

  if (P == null) {
    return;
  }

  const C = $.data.lookupCard(I.card);
  if (C.type === "HERO") {
    for (const band of getBands(C, I.level)) {
      yield band.attributes[q] ?? 0;
    }
  } else if (C.type !== "INSTANT_SPELL") {
    yield C.attributes[q] ?? 0;
  }

  for (const M of I.modifiers) {
    if (M.effect.type === "ATTRIBUTE" && M.effect.attribute === q) {
      yield M.effect.amount;
    }
  }

  if ($.state.activePlayer !== P.id) {
    if (C.type === "HERO" || C.type === "UNIT") {
      if (q === "ATTACK" && P.patrol.ELITE === I.id) {
        yield 1;
      } else if (q === "ARMOR" && P.patrol.SQUAD_LEADER === I.id) {
        yield 1;
      }
    }
  }
}

function *getBands(
  C: HeroCard,
  level: number,
): Iterable<HeroCardBand> {
  for (const band of C.bands) {
    yield band;
    if (level < (band.nextLevel ?? 0)) {
      return;
    }
  }
}

function *getTags(
  $: GameEngine,
  I: InstanceState | null,
): Iterable<Tag> {
  if (I == null) {
    return;
  }

  const C = $.data.lookupCard(I.card);
  for (const tag of C.tags) {
    yield tag;
  }
}

function *getTraits(
  $: GameEngine,
  I: InstanceState | null,
): Iterable<Trait> {
  if (I == null) {
    return;
  }

  const C = $.data.lookupCard(I.card);
  if (C.type === "HERO") {
    for (const band of getBands(C, I.level)) {
      for (const trait of band.traits) {
        yield trait;
      }
    }
  } else if (C.type !== "INSTANT_SPELL") {
    for (const trait of C.traits) {
      yield trait;
    }
  }

  for (const M of I.modifiers) {
    if (M.effect.type === "TRAIT") {
      yield M.effect.trait;
    }
  }
}
