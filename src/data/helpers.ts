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

export const ANTI_AIR = simple("ANTI-AIR");
export const EPHEMERAL = simple("EPHEMERAL");
export const FLYING = simple("FLYING");
export const HASTE = simple("HASTE");
export const LONG_RANGE = simple("LONG-RANGE");
export const OVERPOWER = simple("OVERPOWER");
export const STEALTH = simple("STEALTH");

export const ARMOR = valued("ARMOR");
export const FRENZY = valued("FRENZY");
export const OBLITERATE = valued("OBLITERATE");
export const RESIST = valued("RESIST");

export const event = <EventTypeT extends GameEvent["type"]> (
  type: EventTypeT,
  effect: EventAbility<GameEvent & { type: EventTypeT }>["effect"],
): EventAbility<GameEvent & { type: EventTypeT }> => ({
    type: "EVENT",
    event: type,
    effect,
  });
