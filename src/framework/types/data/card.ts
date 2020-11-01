import { GameEngine } from "../../engine";

import {
  ActivatedAbilityCost,
  ActivatedAbilityID,
  Attribute,
  Color,
  GameState,
  InstanceID,
  InstanceQuery,
  InstanceState,
  ModifierEffect,
  Spec,
  Tag,
  TechLevel,
  Trait,
  TriggerType,
} from "../serializable";

import {
  ActivatedAbilityFn,
  InstantSpellFn,
  TriggeredAbilityFn,
} from "./fn";

export interface ActivatedAbility {
  id: ActivatedAbilityID;
  cost: Array<ActivatedAbilityCost>;
  effect: ActivatedAbilityFn;
}

export interface AttachmentSpellCard
  extends CardBase, InstanceCard, SpellCard {
  type: "ATTACHMENT_SPELL";
  query: InstanceQuery;
}

export interface BuildingCard extends CardBase, InstanceCard, TechCard {
  type: "BUILDING";

  /**
   * The base itself, tech buildings, and addons are all base components.
   */
  baseComponent: boolean;
}

export type Card =
  | AttachmentSpellCard
  | BuildingCard
  | HeroCard
  | InstantSpellCard
  | OngoingSpellCard
  | UnitCard
  | UpgradeCard
  ;

export interface HeroCard extends CardBase {
  type: "HERO";
  spec: Spec;
  bands: [HeroCardBand, HeroCardBand, HeroCardBand];
}

export interface HeroCardBand extends InstanceCard {
  nextLevel: number | null;
}

export interface InstantSpellCard extends CardBase, SpellCard {
  type: "INSTANT_SPELL";
  effect: InstantSpellFn;
}

export interface OngoingSpellCard extends CardBase, InstanceCard, SpellCard {
  type: "ONGOING_SPELL";
}

export interface TriggeredAbility {
  type: TriggerType;
  effect: TriggeredAbilityFn;
}

export interface UnitCard extends CardBase, InstanceCard, TechCard {
  type: "UNIT";
  token: boolean;
}

export interface UpgradeCard extends CardBase, InstanceCard, TechCard {
  type: "UPGRADE";
}

interface CardBase {
  id: string;
  color: Color;
  spec: Spec | null;
  cost: number;
  boostCost: number | null;
  tags: Array<Tag>;
}

export interface InstanceCard {
  traits: Array<Trait>;
  attributes: Partial<Record<Attribute, number>>;
  triggeredAbilities: Array<TriggeredAbility>;
  activatedAbilities: Array<ActivatedAbility>;
  continuousModifiers: Array<{
    condition: (($: GameState, iid: InstanceID) => boolean) | null,
    query: InstanceQuery | "SELF";
    effect: ($: GameEngine, I: InstanceState) => ModifierEffect;
  }>;
}

export interface SpellCard {
  ultimate: boolean;
}

export interface TechCard {
  tech: TechLevel;
}
