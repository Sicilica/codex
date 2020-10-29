import {
  getPatrolSlot,
} from "../framework/accessors";
import { InstanceCard } from "../framework/types";
import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";

import {
  defaultProperties,
  trigger,
} from "./helpers";

const getBandProperties = (
  fn: (id: string, band: 0 | 1 | 2) => Partial<InstanceCard>,
) => (
  id: string,
  band: 0 | 1 | 2,
  health: number | null,
  attack: number | null,
): InstanceCard => {
  const properties = {
    ...defaultProperties(),
    ...fn(id, band),
  };

  if (health != null) {
    properties.attributes.HEALTH = health;
  }
  if (attack != null) {
    properties.attributes.ATTACK = attack;
  }

  return properties;
};

export const getHeroBandProperties = getBandProperties((id, band) => {
  switch (id) {
  case "Captain Zane":
    switch (band) {
    case 0:
      return {
        traits: [ "HASTE" ],
      };
    case 1:
      return {
        triggeredAbilities: [
          trigger("THIS_KILLS", ($, I, e) => {
            const patrolSlot = getPatrolSlot($, e.instance);
            if (patrolSlot === "SCAVENGER") {
              return [
                {
                  type: "GIVE_GOLD",
                  sourceCard: I.card,
                  sourceInstance: I.id,
                  player: I.controller,
                  amount: 1,
                },
              ];
            } else if (patrolSlot === "TECHNICIAN") {
              return [
                {
                  type: "DRAW",
                  sourceCard: I.card,
                  sourceInstance: I.id,
                  player: I.controller,
                  amount: 1,
                },
              ];
            }

            return [];
          }),
        ],
      };
    case 2:
      return {
        triggeredAbilities: [
          trigger("MAX_LEVEL", ($, I) => {
            if ($.state.activePlayer !== I.controller) {
              return [];
            }

            return [
              {
                type: "SHOVE",
                sourceCard: I.card,
                sourceInstance: I.id,
                target: {
                  patrolling: true,
                },
                slot: null,
              },
            ];
          }),
        ],
      };
    default:
      return {};
    }
  default:
    if (REQUIRE_ALL_CARD_PROPERTIES) {
      throw new Error(`Failed to find abilities for hero "${name}"`);
    }
    return {};
  }
});
