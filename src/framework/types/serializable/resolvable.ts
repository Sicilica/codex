import { CardID } from "./card";
import { InstanceID } from "./instance";
import { ModifierGrant } from "./modifier";
import { PatrolSlot } from "./player";
import { InstanceQuery } from "./query";
import { CustomTriggerID } from "./trigger";

export type ResolvableEffectID = string;

export type ResolvableEffect = {
  id: ResolvableEffectID;
  sourceCard: CardID;
  sourceInstance: InstanceID | null;
} & ({
  type:
    | "DISCARD"
    | "DRAW"
    ;
  amount: number;
} | {
  type:
    | "ARRIVE"
    | "BOUNCE_TO_HAND"
    | "SIDELINE"
    | "TAKE_CONTROL"
    | "TRASH"
    ;
  target: InstanceTarget;
} | {
  type:
    | "DAMAGE"
    | "STEAL_GOLD"
    ;
  target: InstanceTarget;
  amount: number;
} | {
  type: "MODIFY";
  target: InstanceTarget;
  modifiers: Array<ModifierGrant & {
    expiration: Exclude<ModifierGrant["expiration"], "CONTINUOUS">,
  }>;
} | {
  type: "SHOVE";
  target: InstanceTarget;
  slot: PatrolSlot;
} | {
  type: "CUSTOM";
  sourceInstance: InstanceID;
  trigger: CustomTriggerID;
  targets: InstanceTargets;
});

export type InstanceTarget = InstanceID | InstanceQuery;
export type InstanceTargets = Array<InstanceID> | {
  query: InstanceQuery;
  min: number;
  max: number;
};
