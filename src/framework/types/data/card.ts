import {
  ActivatedAbilityCost,
  ActivatedAbilityID,
  Attribute,
  Color,
  GameState,
  InstanceID,
  InstanceQuery,
  ModifierEffect,
  PlayerID,
  ResolvableEffect,
  Spec,
  Tag,
  TechLevel,
  Trait,
  TriggerEvent,
} from "../serializable";

export interface AttachmentSpellCard
  extends CardBase, InstanceCard, SpellCard {
  type: "ATTACHMENT_SPELL";
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
  effect: (
    $: GameState,
    pid: PlayerID,
  ) => Array<ResolvableEffect>;
}

export interface OngoingSpellCard extends CardBase, InstanceCard, SpellCard {
  type: "ONGOING_SPELL";
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
  attributes: Record<Attribute, number>;
  triggeredAbilities: Array<{
    type: TriggerEvent["type"];
    effect: (
      $: GameState,
      iid: InstanceID,
      e: TriggerEvent,
    ) => Array<ResolvableEffect>;
  }>;
  activatedAbilities: Array<{
    id: ActivatedAbilityID;
    cost: Array<ActivatedAbilityCost>;
    effect: (
      $: GameState,
      iid: InstanceID,
      boosted: boolean,
    ) => Array<ResolvableEffect>;
  }>;
  continuousModifiers: Array<{
    condition: (($: GameState, iid: InstanceID) => boolean) | null,
    query: InstanceQuery | "SELF";
    effect: ModifierEffect;
  }>;
}

export interface SpellCard {
  ultimate: boolean;
}

export interface TechCard {
  tech: TechLevel;
}
