import {
  InstanceID,
  InstanceState,
} from "./instance";
import {
  PlayerID,
  PlayerState,
} from "./player";
import {
  ResolvableEffect,
} from "./resolvable";

export type AddonType =
  | "HEROES' HALL"
  | "SURPLUS"
  | "TECH LAB"
  | "TOWER"
  ;

export interface GameState {
  time: number;
  players: Record<PlayerID, PlayerState>;
  instances: Record<InstanceID, InstanceState>;
  activePlayer: PlayerID;
  turnPhase: TurnPhase;
  unresolvedEffects: Array<ResolvableEffect>;
  unresolvedCombat: {
    attacker: InstanceID;
    defender: InstanceID;
  } | null;
}

export type TurnPhase =
  | "TECH"
  | "READY"
  | "UPKEEP"
  | "MAIN"
  | "DRAW"
  | "END_OF_TURN"
  ;
