import { InstanceID } from "./instance";

export type CustomTriggerID = string;

export type TriggeredAbilityID = number;

export type TriggerEvent = {
  type:
    | "END_OF_TURN"
    | "MAX_LEVEL"
    | "THIS_ARRIVES"
    | "THIS_BOOSTED"
    | "THIS_DIES"
    | "THIS_SURVIVES_COMBAT"
    | "UPKEEP"
    ;
} | {
  type:
    | "INSTANCE_ARRIVES"
    | "INSTANCE_DIES"
    | "THIS_ATTACKS"
    | "THIS_KILLS"
    ;
  instance: InstanceID;
} | {
  type: "CUSTOM";
  id: CustomTriggerID;
};
