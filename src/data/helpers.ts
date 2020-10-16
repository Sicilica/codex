import {
  Ability,
  EventAbility,
  GameEvent,
  SimpleKeywordAbility,
  ValuedKeywordAbility,
} from "../framework/types";

const simple = (kw: SimpleKeywordAbility["keyword"]): Ability => ({
  type: "SIMPLE_KEYWORD",
  keyword: kw,
});

const valued = (kw: ValuedKeywordAbility["keyword"]) =>
  (val: number): Ability => ({
    type: "VALUED_KEYWORD",
    keyword: kw,
    value: val,
  });

export const HASTE = simple("HASTE");

export const ARMOR = valued("ARMOR");
export const RESIST = valued("RESIST");

export const event = <EventTypeT extends GameEvent["type"]> (
  type: EventTypeT,
  effect: EventAbility<GameEvent & { type: EventTypeT }>["effect"],
): EventAbility<GameEvent & { type: EventTypeT }> => ({
    type: "EVENT",
    event: type,
    effect,
  });
