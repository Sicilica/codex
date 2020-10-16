import {
  ARMOR,
  RESIST,
  event,
} from "./helpers";

import { drawCard } from "../framework/actions/hand";
import { giveGold } from "../framework/actions/helpers";
import { getPlayer } from "../framework/queries/common";

export const SQUAD_LEADER_ABILITY = ARMOR(1);
export const ELITE_ABILITY = null;
export const TECHNICIAN_ABILITY = event("THIS_DIES", ($, I) => {
  const P = getPlayer($, I.controller);
  if (P != null) {
    drawCard(P);
  }
});
export const SCAVENGER_ABILITY = event("THIS_DIES", ($, I) => {
  const P = getPlayer($, I.controller);
  if (P != null) {
    giveGold(P, 1);
  }
});
export const LOOKOUT_ABILITY = RESIST(1);
