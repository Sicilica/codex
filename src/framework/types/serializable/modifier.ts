import { CardID } from "./card";
import { InstanceID } from "./instance";
import { Attribute, Trait } from "./property";
import { TriggeredAbilityID } from "./trigger";

export type ModifierEffect = {
  type: "ATTRIBUTE";
  attribute: Attribute;
  amount: number;
} | {
  type: "TRAIT";
  trait: Trait;
} | {
  type: "TRIGGERED_ABILITY";
  // TODO refactor triggered abilities to guarantee global accessibility, expand data model to be able to lookup triggered abilities
  id: TriggeredAbilityID;
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
