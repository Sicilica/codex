import { InstanceState } from "./instance";
import { CustomRuneID } from "./property";

export type AbilityFnID = number;

export type ActivatedAbilityCost = {
  type:
    | "EXHAUST_THIS"
    | "SACRIFICE_THIS"
    ;
} | {
  type:
    | "GOLD"
    | "TIME_RUNES"
    ;
  amount: number;
} | {
  type: "CUSTOM_RUNES"
  rune: CustomRuneID;
  amount: number;
};

export type ActivatedAbilityID = string;

export type CustomTriggerID = string;

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
  instance: InstanceState;
} | {
  type: "CUSTOM";
  id: CustomTriggerID;
};

export type TriggerType = TriggerEvent["type"];
