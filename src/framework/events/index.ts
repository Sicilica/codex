import {
  getInstanceAbilities,
} from "../queries/abilities";
import {
  getInstance,
  queryInstances,
} from "../queries/common";
import {
  Ability,
  EventAbility,
  GameEvent,
  GameState,
  Instance,
  PlayerState,
} from "../types";

export const dispatchGlobalEvent = (
  $: GameState,
  e: GameEvent,
): void => {
  for (const iid of queryInstances($, {})) {
    const I = getInstance($, iid);
    if (I == null) {
      continue;
    }
    dispatchEventToInstance($, I, e);
  }
};

export const dispatchEventToInstance = (
  $: GameState,
  I: Instance,
  e: GameEvent,
): void => {
  for (const ability of getInstanceAbilities($, I)) {
    if (isEventAbility(ability) && ability.event === e.type) {
      ability.effect($, I, e);
    }
  }
};

export const dispatchEventToPlayer = (
  $: GameState,
  P: PlayerState,
  e: GameEvent,
): void => {
  for (const iid of queryInstances($, { player: P.id })) {
    const I = getInstance($, iid);
    if (I == null) {
      continue;
    }
    dispatchEventToInstance($, I, e);
  }
};

const isEventAbility = (
  ability: Ability,
): ability is EventAbility =>
  ability.type === "EVENT";
