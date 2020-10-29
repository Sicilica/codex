import {
  AbilityFnID,
  ActivatedAbilityFn,
  TriggeredAbilityFn,
} from "../framework/types";

import { trigger } from "./helpers";

const registeredAbilities: Array<ActivatedAbilityFn | TriggeredAbilityFn> = [];

const registerAbility = <
  AbilityT extends { effect: ActivatedAbilityFn | TriggeredAbilityFn }
>(
    ability: AbilityT,
  ): Pick<AbilityT, Exclude<keyof AbilityT, "effect">>
    & { effect: AbilityFnID } => {
  const id = registeredAbilities.length;
  registeredAbilities.push(ability.effect);
  return {
    ...ability,
    effect: id,
  };
};

export const scavengerDies = registerAbility(trigger("THIS_DIES", (_, I) => [
  {
    type: "DRAW",
    sourceCard: I.card,
    sourceInstance: I.id,
    player: I.controller,
    amount: 1,
  },
]));

export const technicianDies = registerAbility(trigger("THIS_DIES", (_, I) => [
  {
    type: "GIVE_GOLD",
    sourceCard: I.card,
    sourceInstance: I.id,
    player: I.controller,
    amount: 1,
  },
]));
