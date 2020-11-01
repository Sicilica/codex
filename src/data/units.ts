import { ResolvableEffect } from "../framework/types";

import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import {
  active,
  constantParam,
  effectBase,
  getProperties,
  queryParam,
  trigger,
  valueParam,
} from "./helpers";

const unitBoostCosts: Record<string, number | undefined> = {
  // such empty
};

export const getUnitBoostCost = (
  name: string,
): number | null => {
  return unitBoostCosts[name] ?? null;
};

export const getUnitProperties = getProperties(id => {
  let aid = 1;
  switch (id) {
  case "Bloodrage Ogre":
    return {
      triggeredAbilities: [
        trigger("END_OF_TURN", ($, I) => {
          if ($.state.activePlayer !== I.controller) {
            return [];
          }
          if (I.arrivalFatigue) {
            return [];
          }
          if (I.memory.attackedThisTurn === "true") {
            return [];
          }
          return [
            {
              ...effectBase(id, I, "BOUNCE_TO_HAND"),
              target: valueParam("INSTANCE", I.id),
            },
          ];
        }),
        trigger("THIS_ATTACKS", (_, I) => {
          I.memory.attackedThisTurn = "true";
          return [];
        }),
        trigger("UPKEEP", (_, I) => {
          I.memory.attackedThisTurn = "false";
          return [];
        }),
      ],
    };
  case "Bombaster":
    return {
      activatedAbilities: [
        active(id, aid++, [
          { type: "GOLD", amount: 1 },
          { type: "SACRIFICE_THIS" },
        ], (_, I) => [
          {
            ...effectBase(id, I, "DAMAGE"),
            target: queryParam("INSTANCE", {
              patrolling: true,
              type: "UNIT",
            }),
            amount: constantParam(2),
          },
        ]),
      ],
    };
  case "Careless Musketeer":
    return {
      activatedAbilities: [
        active(id, aid++, [ { type: "EXHAUST_THIS" } ], ($, I) => {
          const effects: Array<ResolvableEffect> = [
            {
              ...effectBase(id, I, "DAMAGE"),
              target: queryParam("INSTANCE", {
                type: [ "BUILDING", "UNIT" ],
              }),
              amount: constantParam(1),
            },
          ];

          const base = $.getPlayer(I.controller)?.base;
          if (base != null) {
            effects.push({
              ...effectBase(id, I, "DAMAGE"),
              target: valueParam("INSTANCE", base),
              amount: constantParam(1),
            });
          }

          return effects;
        }),
      ],
    };
  case "Mad Man":
    return {
      traits: [ "HASTE" ],
    };
  case "Makeshift Rambaster":
    return {
      traits: [ "HASTE", "NO_PATROL" ],
      triggeredAbilities: [
        trigger("THIS_ATTACKS", ($, I, e) => {
          const targetCard = $.data.lookupCard(e.instance.card);
          if (targetCard.type !== "BUILDING") {
            return [];
          }
          return [
            {
              ...effectBase(id, I, "MODIFY"),
              target: valueParam("INSTANCE", I.id),
              modifiers: constantParam([
                {
                  expiration: "END_OF_COMBAT",
                  sourceCard: I.card,
                  effect: {
                    type: "ATTRIBUTE",
                    attribute: "ATTACK",
                    amount: 2,
                  },
                },
              ]),
            },
          ];
        }),
      ],
    };
  case "Nautical Dog":
    return {
      attributes: { FRENZY: 1 },
    };
  case "Calypso Vystari":
  case "Chameleon":
  case "Disguised Monkey":
  case "Gemscout Owl":
  case "Pirate Gunship":
  case "Tyrannosaurus Rex":
    // WIP
    return {};
  default:
    if (REQUIRE_ALL_CARD_PROPERTIES) {
      throw new Error(`Failed to find properties for unit "${id}"`);
    }
    return {};
  }
});
