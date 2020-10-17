import { drawCard } from "../framework/actions/hand";
import { giveGold } from "../framework/actions/helpers";
import { getPlayer } from "../framework/queries/common";
import { ModifierEffect } from "../framework/types";

// TODO change these to continuous modifier sources
export const SQUAD_LEADER_ABILITY: ModifierEffect = {
  type: "ATTRIBUTE",
  attribute: "ARMOR",
  amount: 1,
};
export const ELITE_ABILITY: ModifierEffect = {
  type: "ATTRIBUTE",
  attribute: "ATTACK",
  amount: 1,
};
export const TECHNICIAN_ABILITY: ModifierEffect = event("THIS_DIES", ($, I) => {
  const P = getPlayer($, I.controller);
  if (P != null) {
    drawCard(P);
  }
});
export const SCAVENGER_ABILITY: ModifierEffect = event("THIS_DIES", ($, I) => {
  const P = getPlayer($, I.controller);
  if (P != null) {
    giveGold(P, 1);
  }
});
export const LOOKOUT_ABILITY: ModifierEffect = {
  type: "ATTRIBUTE",
  attribute: "RESIST",
  amount: 1,
};
