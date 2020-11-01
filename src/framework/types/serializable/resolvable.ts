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
  player: PlayerParam;
  amount: ConstantParam<number>;
} | {
  type: "DISCARD_SELECTED";
  player: PlayerParam;
  card: ConstantParam<CardID>;
} | {
  type:
    | "ARRIVE"
    | "BOUNCE_TO_HAND"
    | "DESTROY"
    | "SIDELINE"
    | "TAKE_CONTROL"
    | "TRASH"
    ;
  target: InstanceParam;
} | {
  type:
    | "DAMAGE"
    | "GIVE_LEVELS"
    | "STEAL_GOLD"
    ;
  target: InstanceParam;
  amount: ConstantParam<number>;
} | {
  type: "MODIFY";
  target: InstanceParam;
  modifiers: ConstantParam<Array<ModifierGrant & {
    expiration: Exclude<ModifierGrant["expiration"], "CONTINUOUS">,
  }>>;
} | {
  type: "SHOVE";
  target: InstanceParam;
  slot: PatrolSlotParam;
} | {
  type: "CUSTOM";
  sourceInstance: InstanceID;
  trigger: ConstantParam<CustomTriggerID>;
  params: Record<string, EffectParam>;
});

export type EffectParam =
  | ConstantParam<unknown>
  | InstanceParam
  | PatrolSlotParam
  | PlayerParam
  ;

export interface EffectParamQuery<T> {
  query: T;
  count?: {
    min: number;
    max: number;
  };
}

export interface EffectParamValue<T> {
  value: T;
}

type CommonEffectParam<TypeT, ValueT, QueryT> = {
  type: TypeT;
} & (
  EffectParamValue<ValueT> | EffectParamQuery<QueryT>
);

export interface ConstantParam<T> extends EffectParamValue<T> {
  type: "CONSTANT"
}

export type InstanceParam =
  CommonEffectParam<"INSTANCE", InstanceID, InstanceQuery>;

export type PatrolSlotParam =
  CommonEffectParam<"PATROL_SLOT", PatrolSlot, unknown>;

export type PlayerParam =
  CommonEffectParam<"PLAYER", PlayerID, unknown>;
