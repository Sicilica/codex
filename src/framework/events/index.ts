import {
  getInstance,
  isUnit,
  queryInstances,
} from "../queries/common";
import {
  Ability,
  EventAbility,
  GameEvent,
  GameState,
  Instance,
} from "../types";
import { lookupCard } from "../../data";

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

const getInstanceAbilities = (
  I: Instance,
): Array<Ability> => {
  const card = lookupCard(I.card);
  if (isUnit(card)) {
    return card.abilities;
  }

  throw new Error("TODO get abilities for this instance type");
};

const isEventAbility = (
  ability: Ability,
): ability is EventAbility =>
  ability.type === "EVENT";
