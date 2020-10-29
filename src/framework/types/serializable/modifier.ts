import {
  AbilityFnID,
  TriggerType,
} from "./ability";
import { CardID } from "./card";
import { InstanceID } from "./instance";
import { Attribute, Trait } from "./property";

export type ModifierEffect = {
  type: "ATTRIBUTE";
  attribute: Attribute;
  amount: number;
} | {
  type: "TRAIT";
  trait: Trait;
} | {
  type: "TRIGGERED_ABILITY";
  ability: {
    type: TriggerType;
    effect: AbilityFnID;
  };
};

export type ModifierGrant = {
  effect: ModifierEffect;
  sourceCard: CardID;
} & ({
  expiration:
    | "END_OF_COMBAT"
    | "END_OF_PATROL"
    | "END_OF_TURN"
    ;
} | {
  expiration: "CONTINUOUS";
  sourceInstance: InstanceID;
});
