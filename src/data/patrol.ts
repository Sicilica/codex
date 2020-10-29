import { ModifierEffect } from "../framework/types";

import {
  scavengerDies,
  technicianDies,
} from "./registered_abilities";

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
export const TECHNICIAN_ABILITY: ModifierEffect = {
  type: "TRIGGERED_ABILITY",
  ability: technicianDies,
};
export const SCAVENGER_ABILITY: ModifierEffect = {
  type: "TRIGGERED_ABILITY",
  ability: scavengerDies,
};
export const LOOKOUT_ABILITY: ModifierEffect = {
  type: "ATTRIBUTE",
  attribute: "RESIST",
  amount: 1,
};
