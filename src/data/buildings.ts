import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import { getProperties } from "./helpers";

export const getBuildingProperties = getProperties(id => {
  switch (id) {
  case "Verdant Tree":
    // WIP
    // No way to target bases
    // No way to say "Your tech buildings build instantly"
    return {
      attributes: {
        HEALING: 1,
      },
      // activatedAbilities: [
      //   active(id, aid++, [
      //     {
      //       type: "EXHAUST_THIS",
      //     },
      //   ],
      //   )
      // ]
    };
  default:
    if (REQUIRE_ALL_CARD_PROPERTIES) {
      throw new Error(`Failed to find properties for building "${id}"`);
    }
    return {};
  }
});
