import { PatrolSlot } from "./types";

// Players cannot have more than this many cards after the draw phase
export const MAX_HAND_SIZE = 5;

// Players cannot have more gold than this at any time
export const MAX_GOLD = 20;

export const PATROL_SLOTS: Array<PatrolSlot> = [
  "SQUAD_LEADER",
  "ELITE",
  "SCAVENGER",
  "TECHNICIAN",
  "LOOKOUT",
];

// Upon hitting this worker count ever, player no longer must tech 2 each turn
export const WORKERS_TO_SKIP_TECH = 10;
