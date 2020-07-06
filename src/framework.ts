export type Color =
  | 'BLACK'
  | 'BLUE'
  | 'GREEN'
  | 'NEUTRAL'
  | 'PURPLE'
  | 'RED'
  | 'WHITE'
  ;

export type Spec =
  | 'BASHING' | 'FINESSE'
  | 'ANARCHY' | 'BLOOD' | 'FIRE'
  | 'BALANCE' | 'FERAL' | 'GROWTH'
  | 'LAW' | 'PEACE' | 'TRUTH'
  | 'DEMONOLOGY' | 'DISEASE' | 'NECROMANCY'
  | 'DISCIPLINE' | 'NINJUTSU' | 'STRENGTH'
  | 'FUTURE' | 'PAST' | 'PRESENT'
  ;

export type ReadyState = 'READY' | 'EXHAUSTED' | 'DISABLED';

export interface Player {
  baseHealth: number;
  hasShuffledDeckThisTurn: boolean;
  patrols: {
    scavenger: Unit;
    technician: Unit;
    lookout: Unit;
    squadLeader: Unit;
    elite: Unit;
  };
  // need to be here??? we need a general effect for card costs, but not for spell eligibility... but we need card eligibility...
  silenced: boolean;
}

export interface Card {
  color: Color;
  cost: number;
  name: string;
  spec?: Spec;
  boostCost?: number;
}

// NOTE all card types except upgrades can have tags

// TODO think more about effects that modify card costs
// TODO need to track sources of effects; that'll be good for UI, but also in
// case of removing one source for an ability that came from multiple sources

// A card that represents a unit. This is distinct from an instance of a unit
// and acts as a sort of template.
export interface UnitCard extends Card {
  abilities: Array<Ability>;
  health: number;
  tech: number;
  tags: Array<string>;
  legendary: boolean;
  attack: number;
  // token: boolean;
}

export interface BuildingCard extends Card {
  abilities: Array<Ability>;
  health: number;
  tech: number;
  tags: Array<string>;
  legendary: boolean;
}

export interface UpgradeCard extends Card {
  abilities: Array<Ability>;
  tech: number;
  legendary: boolean;
}

export interface SpellCard extends Card {
  tags: Array<string>;
  ultimate: boolean;
}

export interface InstantSpellCard extends SpellCard {
  effects: Array<Effect>;
}

export interface OngoingSpellCard extends SpellCard {
  abilities: Array<Effect>;
  channeling?: boolean;
}

export interface AttachmentSpellCard extends SpellCard {
  abilities: Array<Effect>;
}

export interface Unit {
  card: UnitCard;
  token: boolean;
  owner: Player;
  controller: Player;
  permanentEffects: Array<Effect>;
  turnEffects: Array<Effect>;

  armorDamage: number;
  damage: number;
  plusMinusTokens: number;
  arrivalFatigue: number;
  readyState: ReadyState;
}

export interface ActiveAbility {
  // cost could be:
  // - money
  // - exhaust (user)
  // - sacrifice (user)
  // - remove runes
  // - discard cards

  effect: Effect;
}

export interface TriggerAbility {
  // events:
  // - arrives (this)
  // - attacks (this) (play effect, or modify the attack in question)
  // - controller plays a spell
  // - (psuedo) automatic effect on all units (with certain condition)
  // - upkeep (controller)
  // - end of turn (controller)
  // - any unit dies
  // - hero hits max level (this)
  // - dies (this) (need to know whether it was from combat damage or not)
  // - arrives (any card) (for drakk max, need to have arbitrary turn memory)
  // - end of main phase (controller) (for desperation, this isn't really attached to a card but to the player)
  // - upkeep (controller)
  // - deals damage (this) (ie, post combat, unlike attacks)
  // - any status change? (for mimic to know when to gain / lose abilities)
  // - exhausts (this) (for elephant, again needs turn memory)
  // - own status change? (for bluecoat etc to know whether own attack triggers an ability)
  // - unit played from hand (this is before arrives)
  // - card played from hand (this is generic form of ^)

  effect: Effect;
}

export interface PassiveAbility {
  // types:
  // - resist N
  // - haste
  // - healing N
  // - frenzy N
  // - readiness
  // - flagbearer (this is sort of a tag...)
  // - sparkshot
  // - stealth
  // - flying
  // - overpower
  // - obliterate N
  // - channeling (could implement this elsewhere, since this is a spell property...)
  // - invisible
  // - anti-air
  // - swift strike
  // - can't patrol
  // - ephemeral (which is shorthand for other stuff...)
  // - long-range
  // - can't attack
  // - deathtouch
  // - unattackable (can be conditional...)
  // - unstoppable (can be conditional...)
  // - untargetable
  // - armor piercing
  // - illusion (this is sort of a tag again)
  // - two lives (this could be on a die event or sth...)
  // - stash (only _really_ needs to be here if there's more than one possible source)
}
