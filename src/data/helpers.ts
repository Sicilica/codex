import {
  AbilityFn,
  ActivatedAbility,
  ActivatedAbilityCost,
  ActivatedAbilityFn,
  CardID,
  ConstantParam,
  EffectParamInherited,
  EffectParamQuery,
  EffectParamValue,
  InstanceCard,
  InstanceID,
  InstanceState,
  ResolvableEffect,
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

export const inheritParam = <TypeT> (
  type: TypeT,
  field: EffectParamInherited["inherit"]["field"],
  mode: EffectParamInherited["inherit"]["mode"] = "DIRECT",
): { type: TypeT } & EffectParamInherited => ({
    type,
    inherit: {
      field,
      mode,
    },
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

export const active = (
  cid: CardID,
  index: number,
  cost: Array<ActivatedAbilityCost>,
  effect: ActivatedAbilityFn,
): ActivatedAbility => ({
  id: `${cid} #${index}`,
  cost,
  effect,
});

export const constantModifiers = (
  modifiers: (ResolvableEffect & { type: "MODIFY" })["modifiers"]["value"],
): (
  ResolvableEffect & { type: "MODIFY" }
)["modifiers"] =>
  constantParam(modifiers);

export const effectBase = <TypeT extends ResolvableEffect["type"]>(
  cid: CardID,
  I: InstanceState | null,
  type: TypeT,
): {
  type: TypeT,
  sourceCard: CardID,
  sourceInstance: InstanceID | null,
} => ({
    type,
    sourceCard: cid,
    sourceInstance: I?.id ?? null,
  });

export const trigger = <TypeT extends TriggerEvent["type"]>(
  type: TypeT,
  effect: AbilityFn<TriggerEvent & { type: TypeT }>,
): TriggeredAbility => ({
    type,
    effect: effect as TriggeredAbilityFn,
  });
