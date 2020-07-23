// When heroes die, they are unplayable until the owner's next turn
// We decrement a player's hero fatigue on their Ready and Draw phases
// 3-4 Ready/Draw phases before "next turn" requirements are met
export const HERO_DEATH_FATIGUE = 3;

// Players cannot have more than this many cards after the draw phase
export const MAX_HAND_SIZE = 5;

// Players cannot have more gold than this at any time
export const MAX_GOLD = 20;

// Upon hitting this worker count ever, player no longer must tech 2 each turn
export const WORKERS_TO_SKIP_TECH = 10;
