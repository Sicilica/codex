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
} from "../types";

export const dispatchEvent = (
  $: GameState,
  e: GameEvent,
): void => {
  for (const iid of queryInstances($, {})) {
    const I = getInstance($, iid);
    if (I == null) {
      continue;
    }

    for (const ability of getInstanceAbilities(I)) {
      if (isEventAbility(ability) && ability.event === e.type) {
        ability.effect($, I, e);
      }
    }
  }
};

const isEventAbility = (
  ability: Ability,
): ability is EventAbility =>
  ability.type === "EVENT";
