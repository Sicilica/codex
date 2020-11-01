import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import {
  getProperties,
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
  switch (id) {
  case "Mad Man":
    return {
      traits: [ "HASTE" ],
    };
  case "Bloodrage Ogre":
  case "Calypso Vystari":
  case "Chameleon":
  case "Disguised Monkey":
  case "Gemscout Owl":
  case "Nautical Dog":
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
