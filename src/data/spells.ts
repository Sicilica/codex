import {
  Ability,
  Effect,
} from "../framework/types";

const spellBoostCosts: Record<string, number | undefined> = {
  // such empty
};

export const getSpellBoostCost = (
  name: string,
): number | null => {
  return spellBoostCosts[name] ?? null;
};

export const getSpellDetails = (
  name: string,
): SpellDetails => {
  switch (name) {
  case "Scorch":
    return {
      type: "INSTANT_SPELL",
      effects: [ "TODO" ],
    };
  default:
    throw new Error(`Failed to find details for spell "${name}"`);
  }
};

type SpellDetails = {
  type: "ATTACHMENT_SPELL",
  abilities: Array<Ability>,
} | {
  type: "INSTANT_SPELL",
  effects: Array<Effect>,
} | {
  type: "ONGOING_SPELL",
  abilities: Array<Ability>,
  channeling: boolean,
};
