import { getAttribute, hasTrait } from "../framework/accessors";
import { GameEngine } from "../framework/engine";
import { dealDamage, exhaust } from "../framework/mutators";
import { GameState, InstanceState } from "../framework/types";

import { requireInstance } from "./helpers";

export const resolveCombat = (
  $: GameEngine,
  combat: Exclude<GameState["unresolvedCombat"], null>,
): void => {
  const attacker = requireInstance($, combat.attacker);
  const defender = requireInstance($, combat.defender);

  if (!hasTrait($, attacker, "READINESS")) {
    exhaust(attacker);
  }

  // TODO factor in stuff like long range and swift strike and deathtouch and flying...
  dealCombatDamage($, defender, attacker, combat.defenderExtraDamage);
  dealCombatDamage($, attacker, defender, combat.attackerExtraDamage);
};

const dealCombatDamage = (
  $: GameEngine,
  to: InstanceState,
  from: InstanceState | null,
  extraDamage: number,
): void => {
  // TODO this is very wrong still
  dealDamage($, to, getAttribute($, from, "ATTACK") + extraDamage);
};
