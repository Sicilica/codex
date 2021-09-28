import { isPatrolling } from "../framework/accessors";

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
import { RedTechZero } from "./specs/red-0";

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
    return RedTechZero.BloodrageOgre(id);
  case "Bombaster":
    return RedTechZero.Bombaster(id);
  case "Careless Musketeer":
    return RedTechZero.CarelessMusketeer(id);
  case "Ironbark Treant":
    return {
      continuousModifiers: [
        {
          condition: ($, iid) => isPatrolling($, $.instances[iid]),
          query: "SELF",
          effect: () => {
            return {
              type: "ATTRIBUTE",
              attribute: "ATTACK",
              amount: -2,
            };
          },
        },
        {
          condition: ($, iid) => isPatrolling($, $.instances[iid]),
          query: "SELF",
          effect: () => {
            return {
              type: "ATTRIBUTE",
              attribute: "ARMOR",
              amount: 2,
            };
          },
        },
      ],
    };
  case "Mad Man":
    return RedTechZero.MadMan(id);
  case "Makeshift Rambaster":
    return RedTechZero.MakeshiftRambaster(id);
  case "Merfolk Prospector":
    return {
      activatedAbilities: [
        active(
          id,
          aid++,
          [ { type: "EXHAUST_THIS" } ],
          (_, I) => {
            return [
              {
                ...effectBase(id, I, "GIVE_GOLD"),
                player: valueParam("PLAYER", I.controller),
                amount: constantParam(1),
              },
            ];
          },
        ),
      ],
    };
  case "Nautical Dog":
    return RedTechZero.NauticalDog(id);
  case "Playful Panda":
    return {
      triggeredAbilities: [
        trigger("THIS_ARRIVES", (_, I) => {
          return [
            {
              ...effectBase(id, I, "READY_STATE"),
              target: valueParam("INSTANCE", I.id),
              state: constantParam("EXHAUSTED"),
            },
            {
              ...effectBase(id, I, "SUMMON_TOKEN"),
              player: valueParam("PLAYER", I.controller),
              card: constantParam("Wisp"),
              amount: constantParam(1),
            },
          ];
        }),
      ],
    };
  case "Spore Shambler":
    return {
      activatedAbilities: [
        active(id, aid++, [
          { type: "EXHAUST_THIS" },
          { type: "PLUS_MINUS_RUNES", amount: 1 },
        ], (_, I) => [
          {
            ...effectBase(id, I, "GIVE_PLUS_MINUS_RUNES"),
            target: queryParam("INSTANCE", {
              type: [ "UNIT" ],
            }),
            amount: constantParam(1),
          },
        ]),
        active(id, aid++, [
          { type: "GOLD", amount: 1 },
          { type: "PLUS_MINUS_RUNES", amount: 1 },
        ], (_, I) => [
          {
            ...effectBase(id, I, "GIVE_PLUS_MINUS_RUNES"),
            target: queryParam("INSTANCE", {
              type: [ "UNIT" ],
            }),
            amount: constantParam(1),
          },
        ]),
      ],
      triggeredAbilities: [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        trigger("THIS_ARRIVES", (_, I) => {
          return [
            {
              ...effectBase(id, I, "GIVE_PLUS_MINUS_RUNES"),
              target: valueParam("INSTANCE", I.id),
              amount: constantParam(2),
            },
          ];
        }),
      ],
    };
  case "Tiger Cub":
    return {};
  case "Young Treant":
    return {
      traits: [ "NO_ATTACK" ],
      triggeredAbilities: [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        trigger("THIS_ARRIVES", (_, I) => {
          return [
            {
              ...effectBase(id, I, "DRAW"),
              player: valueParam("PLAYER", I.controller),
              amount: constantParam(1),
            },
          ];
        }),
      ],
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
