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
): card is (AttachmentSpellCard | InstantSpellCard | OngoingSpellCard) => {
  return card.type === "ATTACHMENT_SPELL"
    || card.type === "INSTANT_SPELL"
    || card.type === "ONGOING_SPELL";
};
