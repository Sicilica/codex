import { SingleOrArray } from "../helpers";

import { CardID, CardType } from "./card";
import { ModifierGrant } from "./modifier";
import { PlayerID } from "./player";
import { CustomRuneID } from "./property";

export type InstanceID = string;

export interface InstanceState {
  id: InstanceID;
  card: CardID;
  owner: PlayerID;
  controller: PlayerID;
  arrivalFatigue: boolean;
  readyState: ReadyState;
  damage: number;
  armorDamage: number;
  level: number;
  levelAtTurnStart: number;
  plusMinusRunes: number;
  timeRunes: number;
  customRunes: Record<CustomRuneID, number>;
  attachments: Array<InstanceID>;
  attachedTo: InstanceID | null;
  modifiers: Array<ModifierGrant>;
  memory: Record<string, SingleOrArray<CardID | InstanceID>>;
}

export type InstanceType = Exclude<CardType, "INSTANT_SPELL">;

export type ReadyState =
  | "READY"
  | "EXHAUSTED"
  | "DISABLED"
  ;
