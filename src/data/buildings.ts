import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import {
  active,
  constantModifiers,
  effectBase,
  getProperties,
  queryParam,
} from "./helpers";

export const getBuildingProperties = getProperties(id => {
  let aid = 1;
  switch (id) {
  case "Verdant Tree":
    return {
      attributes: {
        HEALING: 1,
      },
      activatedAbilities: [
        active(
          id,
          aid++,
          [
            {
              type: "EXHAUST_THIS",
            },
          ],
          ($, I) => {
            const player = $.getPlayer(I.controller);

            if (player != null) {
              // See extensive note in Verdant Tree unit tests
              return [
                {
                  ...effectBase(id, I, "MODIFY"),
                  target: queryParam("INSTANCE", {
                    card: [
                      "Tech I Building",
                      "Tech II Building",
                      "Tech III Building",
                    ],
                  }),
                  modifiers: constantModifiers([
                    {
                      effect: {
                        type: "TRAIT",
                        trait: "HASTE",
                      },
                      expiration: "END_OF_TURN",
                      sourceCard: id,
                    },
                  ]),
                },
              ];
            }
            return [];
          },
        ),
      ],
    };
  default:
    if (REQUIRE_ALL_CARD_PROPERTIES) {
      throw new Error(`Failed to find properties for building "${id}"`);
    }
    return {};
  }
});
