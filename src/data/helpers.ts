import {
  AbilityFn,
  ConstantParam,
  EffectParamQuery,
  EffectParamValue,
  InstanceCard,
  TriggerEvent,
  TriggeredAbility,
  TriggeredAbilityFn,
} from "../framework/types";

export const constantParam = <T> (
  value: T,
): ConstantParam<T> => ({
    type: "CONSTANT",
    value,
  });

export const queryParam = <TypeT, QueryT> (
  type: TypeT,
  query: QueryT,
  count?: EffectParamQuery<unknown>["count"],
): { type: TypeT } & EffectParamQuery<QueryT> => ({
    type,
    query,
    count,
  });

export const valueParam = <TypeT, ValueT> (
  type: TypeT,
  value: ValueT,
): { type: TypeT } & EffectParamValue<ValueT> => ({
    type,
    value,
  });

export const defaultProperties = (): InstanceCard => ({
  ...{
    activatedAbilities: [],
    attributes: {},
    continuousModifiers: [],
    traits: [],
    triggeredAbilities: [],
  },
});

export const getProperties = (
  fn: (id: string) => Partial<InstanceCard>,
) => (
  id: string,
  health: number | null,
  attack: number | null,
): InstanceCard => {
  const properties = {
    ...defaultProperties(),
    ...fn(id),
  };

  if (health != null) {
    properties.attributes.HEALTH = health;
  }
  if (attack != null) {
    properties.attributes.ATTACK = attack;
  }

  return properties;
};

export const trigger = <TypeT extends TriggerEvent["type"]>(
  type: TypeT,
  effect: AbilityFn<TriggerEvent & { type: TypeT }>,
): TriggeredAbility => ({
    type,
    effect: effect as TriggeredAbilityFn,
  });
