import {
  getEmptyPatrolSlots,
  getOpponents,
  getPatrolSlot, hasEmptyPatrolSlot,
} from "../framework/accessors";
import { InstanceCard } from "../framework/types";
import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";

import {
  constantParam,
  defaultProperties,
  effectBase,
  inheritParam,
  queryParam,
  trigger,
  valueParam,
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
                  player: valueParam("PLAYER", I.controller),
                  amount: constantParam(1),
                },
              ];
            } else if (patrolSlot === "TECHNICIAN") {
              return [
                {
                  type: "DRAW",
                  sourceCard: I.card,
                  sourceInstance: I.id,
                  player: valueParam("PLAYER", I.controller),
                  amount: constantParam(1),
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
          trigger("MAX_BAND", ($, I) => {
            if ($.state.activePlayer !== I.controller) {
              return [];
            }

            const opponents = Array.from(
              getOpponents($, $.getPlayer(I.controller)),
            );
            const opponentsWithEmptySlots =
              opponents.filter(P => hasEmptyPatrolSlot(P));

            if (opponentsWithEmptySlots.length === 0) {
              // The enemy patrol zone is full, so we just do damage to a
              // patroller without moving it
              return [
                {
                  ...effectBase(id, I, "DAMAGE"),
                  target: queryParam("INSTANCE", {
                    patrolling: true,
                  }),
                  amount: constantParam(1),
                },
              ];
            }

            if (opponentsWithEmptySlots.length > 1) {
              // This is difficult to support atm, since we wouldn't know which
              // patrol slots are valid until we know which player was chosen.
              throw new Error("shove unsupported vs multiple opponents");
            }
            const emptySlots = getEmptyPatrolSlots(opponentsWithEmptySlots[0]);

            // Move a patroller to an empty slot, then deal 1 damage to it
            return [
              {
                ...effectBase(id, I, "MOVE_TO_SLOT"),
                target: queryParam("INSTANCE", {
                  patrolling: true,
                  player: opponentsWithEmptySlots[0].id,
                }),
                slot: queryParam("PATROL_SLOT", emptySlots),
                chainedEffects: [
                  {
                    type: "DAMAGE",
                    target: inheritParam("INSTANCE", "target"),
                    amount: constantParam(1),
                  },
                ],
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
