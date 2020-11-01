import { CardID } from "./card";
import { InstanceID } from "./instance";
import { Spec } from "./property";

export type HeroAvailability =
  | "AVAILABLE"
  | "DIED_BEFORE_THIS_TURN"
  | "DIED_THIS_TURN"
  | "IN_PLAY"
  ;

export type PatrolSlot =
  | "SQUAD_LEADER"
  | "ELITE"
  | "SCAVENGER"
  | "TECHNICIAN"
  | "LOOKOUT"
  ;

export type PatrolZone = Record<PatrolSlot, InstanceID | null>;

export type PlayerID = string;

export interface PlayerState {
  id: PlayerID;
  isFirstPlayer: boolean;
  specs: [Spec, Spec, Spec];
  base: InstanceID;
  techBuildings: Array<InstanceID | null>;
  mainSpec: Spec | null;
  addon: InstanceID | null;
  techLabSpec: Spec | null;
  heroes: Record<CardID, HeroAvailability>;
  gold: number;
  workers: number;
  patrol: PatrolZone;
  hand: Array<CardID>;
  deck: Array<CardID>;
  discard: Array<CardID>;
  codex: Record<CardID, number | null>;
  canSkipTech: boolean;
  hasBuiltWorkerThisTurn: boolean;
  hasShuffledThisTurn: boolean;
  purchasedTechBuildings: number;
}
