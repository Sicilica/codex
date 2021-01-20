import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import {
  active,
  constantParam,
  effectBase,
  getProperties,
  queryParam,
  trigger,
} from "./helpers";

export const getUpgradeProperties = getProperties(id => {
  let aid = 1;
  switch (id) {
  case "Bloodburn":
    return {
      activatedAbilities: [
        active(id, aid++, [
          { type: "EXHAUST_THIS" },
          { type: "CUSTOM_RUNES", rune: "BLOOD", amount: 2 },
        ], (_, I) => [
          {
            ...effectBase(id, I, "DAMAGE"),
            target: queryParam("INSTANCE", {
              type: [ "BUILDING", "UNIT" ],
            }),
            amount: constantParam(1),
          },
        ]),
      ],
      triggeredAbilities: [
        trigger("INSTANCE_DIES", ($, I, e) => {
          const targetCard = $.data.lookupCard(e.instance.card);
          if (targetCard.type === "UNIT") {
            I.customRunes.BLOOD = Math.min((I.customRunes.BLOOD ?? 0) + 1, 4);
          }
          return [];
        }),
      ],
    };
  case "Rich Earth":
    // WIP
    // Unable to target bases with modifiers
    // No "free worker" modifier effect currently exists
    return {};
    // return {
    //   continuousModifiers: [
    //     {
    //       condition: () => null,
    //       query: AllYourBase,
    //       effect: ($, I) => {
    //         ...effectBase()
    //       }
    //     },
    //   ],
    // };
  default:
    if (REQUIRE_ALL_CARD_PROPERTIES) {
      throw new Error(`Failed to find properties for upgrade "${id}"`);
    }
    return {};
  }
});
