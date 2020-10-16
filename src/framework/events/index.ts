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
    dispatchScopedEvent($, I, e);
  }
};

export const dispatchScopedEvent = (
  $: GameState,
  scope: Instance,
  e: GameEvent,
): void => {
  for (const ability of getInstanceAbilities(scope)) {
    if (isEventAbility(ability) && ability.event === e.type) {
      ability.effect($, scope, e);
    }
  }
};

const isEventAbility = (
  ability: Ability,
): ability is EventAbility =>
  ability.type === "EVENT";
