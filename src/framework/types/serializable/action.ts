import { ActivatedAbilityID } from "./ability";
import { CardID } from "./card";
import { InstanceID } from "./instance";
import { PatrolZone } from "./player";
import { Spec } from "./property";
import { ResolvableEffectID } from "./resolvable";

export type Action = {
  type: "ACTIVATE_ABILITY";
  instance: InstanceID;
  ability: ActivatedAbilityID;
} | {
  type: "ATTACK";
  attacker: InstanceID;
  defender: InstanceID;
} | {
  type: "BUY_WORKER";
  card: CardID;
} | {
  type: "END_TURN";
  patrol: PatrolZone;
} | {
  type: "PLAY_CARD";
  card: CardID;
  boost: boolean;
} | {
  type: "PURCHASE_TECH_BUILDING";
  spec?: Spec;
} | {
  type: "RESOLVE_EFFECT";
  effect: ResolvableEffectID;
  params: Record<string, string>;
} | {
  type: "TECH";
  cards: Array<CardID>;
};
