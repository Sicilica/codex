import {
  Ability,
  EventAbility,
  GameEvent,
} from "../framework/types";

export const HASTE: Ability = {
  type: "SIMPLE_KEYWORD",
  keyword: "HASTE",
};

export const event = <EventTypeT extends GameEvent["type"]> (
  type: EventTypeT,
  effect: EventAbility<GameEvent & { type: EventTypeT }>["effect"],
): EventAbility<GameEvent & { type: EventTypeT }> => ({
    type: "EVENT",
    event: type,
    effect,
  });
