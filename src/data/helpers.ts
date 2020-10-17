import {
  Attribute,
  GameState,
  InstanceCard,
  ResolvableEffect,
  TriggerEvent,
} from "../framework/types";

export const getProperties = (
  fn: (id: string) => Partial<InstanceCard>,
) => (
  id: string,
  health: number | null,
  attack: number | null,
): InstanceCard => {
  const properties = {
    activatedAbilities: [],
    attributes: {} as Record<Attribute, number>,
    continuousModifiers: [],
    traits: [],
    triggeredAbilities: [],
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

export const trigger = <EventT extends TriggerEvent>(
  type: EventT["type"],
  effect: ($: GameState, iid: string, e: EventT) => Array<ResolvableEffect>,
): InstanceCard["triggeredAbilities"][0] => ({
    type,
    effect,
  });
