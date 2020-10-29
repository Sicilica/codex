import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import { getProperties } from "./helpers";

export const getUpgradeProperties = getProperties(id => {
  switch (id) {
  default:
    if (REQUIRE_ALL_CARD_PROPERTIES) {
      throw new Error(`Failed to find properties for upgrade "${id}"`);
    }
    return {};
  }
});
