export type GlobalTurnPhase =
  | "READY"
  | "UPKEEP"
  | "MAIN"
  | "DRAW"
  | "TECH"
  ;

export type Color =
  | "BLACK"
  | "BLUE"
  | "GREEN"
  | "NEUTRAL"
  | "PURPLE"
  | "RED"
  | "WHITE"
  ;

export type Spec =
  | "BASHING" | "FINESSE"
  | "ANARCHY" | "BLOOD" | "FIRE"
  | "BALANCE" | "FERAL" | "GROWTH"
  | "LAW" | "PEACE" | "TRUTH"
  | "DEMONOLOGY" | "DISEASE" | "NECROMANCY"
  | "DISCIPLINE" | "NINJUTSU" | "STRENGTH"
  | "FUTURE" | "PAST" | "PRESENT"
  ;

export type Addon =
  | "HEROES'_HALL"
  | "SURPLUS"
  | "TECH_LAB"
  | "TOWER"
  ;

export interface GameState {
  firstPlayer: PlayerID;
  round: number;
  activePlayer: PlayerID;
  turnPhase: GlobalTurnPhase;
  instances: Record<InstanceID, Instance>;
  nextID: number;
  players: Record<PlayerID, PlayerState>;
}

export type CardID = string;
export type PlayerID = string;
export type InstanceID = string;

export interface PlayerState {
  id: PlayerID;
  base: InstanceID;
  specs: [Spec, Spec, Spec];
  addon: InstanceID | null;
  techLabSpec: Spec | null;
  workers: number;
  gold: number;
  hand: Array<CardID>;
  deck: Array<CardID>;
  discard: Array<CardID>;
  // Ruling: Players can skip tech phase at 10 workers and always thereafter
  canSkipTech: boolean;
  hasShuffledThisTurn: boolean;
  hasBuiltWorkerThisTurn: boolean;
  patrol: {
    squadLeader: InstanceID | null;
    elite: InstanceID | null;
    scavenger: InstanceID | null;
    technician: InstanceID | null;
    lookout: InstanceID | null;
  };
  purchasedTechBuildings: number;
  techBuildings: Record<number, InstanceID | null>;
  mainSpec: Spec | null;
}

export interface Instance {
  id: InstanceID;
  owner: PlayerID;
  controller: PlayerID;
  card: CardID;
  damage: number;
  plusMinusTokens: number;
  specialTokens: Array<string>;
  attachments: Array<Instance>;
  level: number;
  startedTurnAtMaxBand: boolean;
  readyState: "READY" | "EXHAUSTED" | "DISABLED";
  arrivalFatigue: boolean;
  armorDamage: number;
}

export interface TechBuildingState {
  purchased: boolean;
  damage: number;
  ready: boolean;
}

export type Card =
  | UnitCard
  | OngoingSpellCard
  | BuildingCard
  | AttachmentSpellCard
  | InstantSpellCard
  | UpgradeCard
  | HeroCard
  ;

interface CardBase {
  color: Color;
  cost: number;
  name: string;
  tags: Array<string>;
  spec: Spec | null;
  boostCost: number | null;
}

export interface UnitCard extends CardBase {
  type: "UNIT";
  attack: number;
  health: number;
  tech: number;
  legendary: boolean;
  token: boolean;
  abilities: Array<Ability>;
}

export interface BuildingCard extends CardBase {
  type: "BUILDING";
  health: number;
  tech: number;
  legendary: boolean;
  abilities: Array<Ability>;

  /**
   * The base itself, tech buildings, and addons are all base components.
   */
  baseComponent: boolean;
}

export interface UpgradeCard extends CardBase {
  type: "UPGRADE";
  abilities: Array<Ability>;
  legendary: boolean;
  tech: number;
}

export interface InstantSpellCard extends CardBase {
  type: "INSTANT_SPELL";
  ultimate: boolean;
  effects: Array<Effect>;
}

export interface OngoingSpellCard extends CardBase {
  type: "ONGOING_SPELL";
  channeling: boolean;
  ultimate: boolean;
  abilities: Array<Ability>;
}

export interface AttachmentSpellCard extends CardBase {
  type: "ATTACHMENT_SPELL";
  ultimate: boolean;
  abilities: Array<Ability>;
}

export interface HeroCard extends CardBase {
  type: "HERO";
  bands: [HeroCardBand, HeroCardBand, HeroCardBand];
}

interface HeroCardBand {
  nextLevel: number | null;
  health: number;
  attack: number;
  abilities: Array<Ability>;
}

export type Ability = "TODO";
export type Effect = "TODO";
