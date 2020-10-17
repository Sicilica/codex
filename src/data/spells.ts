import {
  Attribute,
  InstanceCard,
  InstantSpellCard,
  SpellCard,
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
    return instantSpell({
      effect: () => {
        throw new Error("todo");
      },
    });
  default:
    throw new Error(`Failed to find details for spell "${name}"`);
  }
};

type SpellDetails = Pick<SpellCard, Exclude<keyof SpellCard, "ultimate">> & ({
  type: "INSTANT_SPELL";
  effect: InstantSpellCard["effect"];
} | (InstanceCard & {
  type: "ATTACHMENT_SPELL" | "ONGOING_SPELL";
}));

const attachmentSpell = (
  details: Partial<InstanceCard>,
): SpellDetails => ({
  type: "ATTACHMENT_SPELL",
  activatedAbilities: [],
  attributes: {} as Record<Attribute, number>,
  continuousModifiers: [],
  traits: [],
  triggeredAbilities: [],
  ...details,
});

const instantSpell = (
  details: Pick<InstantSpellCard, "effect">,
): SpellDetails => ({
  type: "INSTANT_SPELL",
  ...details,
});

const ongoingSpell = (
  details: Partial<InstanceCard>,
): SpellDetails => ({
  type: "ONGOING_SPELL",
  activatedAbilities: [],
  attributes: {} as Record<Attribute, number>,
  continuousModifiers: [],
  traits: [],
  triggeredAbilities: [],
  ...details,
});
