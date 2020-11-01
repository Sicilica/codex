import { CustomTriggerID } from "./ability";
import { CardID } from "./card";
import { InstanceID } from "./instance";
import { ModifierGrant } from "./modifier";
import { PatrolSlot, PlayerID } from "./player";
import { InstanceQuery } from "./query";

export type ResolvableEffectID = string;

export type ResolvableEffect = {
  sourceCard: CardID | null;
  sourceInstance: InstanceID | null;
} & ({
  type:
    | "DISCARD"
    | "DRAW"
    | "GIVE_GOLD"
    ;
  player: PlayerID;
  amount: number;
} | {
  type: "DISCARD_SELECTED";
  player: PlayerID;
  card: CardID;
} | {
  type:
    | "ARRIVE"
    | "BOUNCE_TO_HAND"
    | "DESTROY"
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
  // TODO there's currently no way to represent this query...
  slot: PatrolSlot | null;
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
