import {
  InstanceID,
  InstanceState,
} from "./instance";
import {
  PlayerID,
  PlayerState,
} from "./player";
import {
  ResolvableEffect, ResolvableEffectID,
} from "./resolvable";

export type AddonType =
  | "HEROES' HALL"
  | "SURPLUS"
  | "TECH LAB"
  | "TOWER"
  ;

export interface GameState {
  time: number;
  round: number;
  activePlayer: PlayerID;
  turnPhase: TurnPhase;
  players: Record<PlayerID, PlayerState>;
  instances: Record<InstanceID, InstanceState>;
  unresolvedEffects: Array<ResolvableEffect & {
    id: ResolvableEffectID;
  }>;
  unresolvedCombat: {
    attacker: InstanceID;
    attackerExtraDamage: number;
    defender: InstanceID;
    defenderExtraDamage: number;
  } | null;
  nextID: number;
  earliestAllowedRewind: number;
}

export type TurnPhase =
  | "TECH"
  | "READY"
  | "UPKEEP"
  | "MAIN"
  | "DRAW"
  | "END_OF_TURN"
  | "GAME_OVER"
  ;
