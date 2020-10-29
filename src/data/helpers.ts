import {
  AbilityFn,
  InstanceCard,
  TriggerEvent,
  TriggeredAbility,
  TriggeredAbilityFn,
} from "../framework/types";

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
