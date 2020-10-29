import { getAttribute, getPatrolSlot } from "../accessors";
import { PATROL_SLOTS } from "../constants";
import { GameEngine } from "../engine";
import {
  Card,
  InstanceState,
  PlayerState,
} from "../types";

export const createInstance = (
  $: GameEngine,
  P: PlayerState,
  card: Card,
): InstanceState => {
  const I = $.addInstance(P, card);

  $.fireInstanceTrigger(I, {
    type: "THIS_ARRIVES",
  });

  $.fireGlobalTrigger({
    type: "INSTANCE_ARRIVES",
    instance: I,
  });

  return I;
};

export const dealDamage = (
  $: GameEngine,
  I: InstanceState,
  amount: number,
): void => {
  const currentArmor = getAttribute($, I, "ARMOR") - I.armorDamage;
  const absorbedAmount = Math.min(amount, currentArmor);
  I.armorDamage += absorbedAmount;
  I.damage += amount - absorbedAmount;
  if (I.damage >= getAttribute($, I, "HEALTH")) {
    // TODO worry about deduping this...
    // probably track something on the card's memory
    $.queueEffect({
      type: "DESTROY",
      sourceCard: null,
      sourceInstance: null,
      target: I.id,
    });
  }
};

export const destroy = (
  $: GameEngine,
  I: InstanceState,
): void => {
  $.fireInstanceTrigger(I, {
    type: "THIS_DIES",
  });

  removeInstance($, I);

  const P = $.getPlayer(I.owner);
  if (P == null) {
    return;
  }

  const card = $.data.lookupCard(I.card);
  if (card.type === "HERO") {
    // TODO
  } else if (card.type !== "UNIT" || !card.token) {
    P.discard.push(card.id);
  }
};

export const exhaust = (
  I: InstanceState,
): void => {
  if (I.readyState === "READY") {
    I.readyState = "EXHAUSTED";
  }
};

export const returnInstanceToHand = (
  $: GameEngine,
  I: InstanceState,
): void => {
  removeInstance($, I);

  const P = $.getPlayer(I.owner);
  if (P == null) {
    return;
  }

  const card = $.data.lookupCard(I.card);
  if (card.type === "HERO") {
    // TODO...
  } else if (card.type !== "UNIT" || !card.token) {
    P.hand.push(card.id);
  }
};

export const sideline = (
  $: GameEngine,
  I: InstanceState,
): void => {
  const P = $.getPlayer(I.controller);
  if (P == null) {
    return;
  }

  const slot = getPatrolSlot($, I);
  if (slot == null) {
    return;
  }

  P.patrol[slot] = null;
};

export const trash = (
  $: GameEngine,
  I: InstanceState,
): void => {
  removeInstance($, I);
};

const removeInstance = (
  $: GameEngine,
  I: InstanceState,
): void => {
  // TODO
  // we need to delete this but also trigger leaves, which means it has to stay
  // around sooooo
  delete $.state.instances[I.id];

  // TODO remove attachments...

  const P = $.getPlayer(I.controller);
  if (P != null) {
    for (const slot of PATROL_SLOTS) {
      if (P.patrol[slot] === I.id) {
        P.patrol[slot] = null;
      }
    }
    for (let i = 0; i < 3; i++) {
      if (P.techBuildings[i] === I.id) {
        P.techBuildings[i] = null;
      }
    }
  }
};
