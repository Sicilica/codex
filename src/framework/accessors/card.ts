import {
  AttachmentSpellCard,
  Card,
  InstantSpellCard,
  OngoingSpellCard,
  TechLevel,
} from "../types";

export const getTech = (
  card: Card,
): TechLevel | null => {
  if (card.type === "ATTACHMENT_SPELL"
    || card.type === "HERO"
    || card.type === "INSTANT_SPELL"
    || card.type === "ONGOING_SPELL") {
    return null;
  }
  return card.tech;
};

export const isSpell = (
  card: Card,
): card is SpellCard => {
  return card.type === "ATTACHMENT_SPELL"
    || card.type === "INSTANT_SPELL"
    || card.type === "ONGOING_SPELL";
};

export const isTransient = (
  card: Card,
): boolean => {
  if (card.type === "BUILDING") {
    return card.baseComponent;
  }
  if (card.type === "HERO") {
    return true;
  }
  if (card.type === "UNIT") {
    return card.token;
  }
  return false;
};

type SpellCard =
  | AttachmentSpellCard
  | InstantSpellCard
  | OngoingSpellCard
  ;
