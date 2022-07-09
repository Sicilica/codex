import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import { getProperties } from "./helpers";
import { RedTechZero } from "./specs/red-0";

export const getUpgradeProperties = getProperties(id => {
  switch (id) {
  case "Bloodburn":
    return RedTechZero.Bloodburn(id);
  case "Rich Earth":
    return {
      continuousModifiers: [
        {
          query: (_, I) => {
            return {
              card: "Base",
              player: I.controller,
            };
          },
          effect: () => {
            return {
              type: "TRAIT",
              trait: "FREE_WORKERS",
            };
          },
        },
      ],
    };
  default:
    if (REQUIRE_ALL_CARD_PROPERTIES) {
      throw new Error(`Failed to find properties for upgrade "${id}"`);
    }
    return {};
  }
});
