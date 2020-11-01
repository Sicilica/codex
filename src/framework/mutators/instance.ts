import {
  getAttribute,
  getOpponents,
  getPatrolSlot,
  isTransient,
} from "../accessors";
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
  source: InstanceState | null,
): void => {
  const currentArmor = getAttribute($, I, "ARMOR") - I.armorDamage;
  const absorbedAmount = Math.min(amount, currentArmor);
  I.armorDamage += absorbedAmount;
  I.damage += amount - absorbedAmount;
  if (!I.dead && I.damage >= getAttribute($, I, "HEALTH")) {
    I.dead = true;
    $.queueEffect({
      type: "DESTROY",
      sourceCard: source?.card ?? null,
      sourceInstance: source?.id ?? null,
      target: {
        type: "INSTANCE",
        value: I.id,
      },
    });
  }
};

export const destroy = (
  $: GameEngine,
  I: InstanceState,
  killer: InstanceState | null,
): void => {
  $.fireInstanceTrigger(I, {
    type: "THIS_DIES",
  });

  if (killer != null) {
    $.fireInstanceTrigger(killer, {
      type: "THIS_KILLS",
      instance: I,
    });
  }

  removeInstance($, I);

  const P = $.getPlayer(I.owner);
  if (P == null) {
    return;
  }

  const card = $.data.lookupCard(I.card);
  if (card.type === "HERO") {
    P.heroes[card.id] = "DIED_THIS_TURN";

    $.queueEffect({
      type: "GIVE_LEVELS",
      sourceCard: card.id,
      sourceInstance: null,
      target: {
        type: "INSTANCE",
        query: {
          isMaxLevel: false,
          player: Array.from(getOpponents($, P)).map(oppP => oppP.id),
          type: "HERO",
        },
      },
      amount: {
        type: "CONSTANT",
        value: 2,
      },
    });
  } else if (!isTransient(card)) {
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
    P.heroes[card.id] = "AVAILABLE";
  } else if (!isTransient(card)) {
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
  // fire leaves trigger...

  delete $.state.instances[I.id];

  // remove attachments...

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
