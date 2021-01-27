import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import { getProperties } from "./helpers";

export const getTokenProperties = getProperties(id => {
  switch (id) {
  case "Shark":
    return {
      traits: [ "HASTE", "EPHEMERAL" ],
    };
  case "Hunter":
    return {
      traits: [ "ANTI_AIR" ],
    };
  case "Water Elemental":
    return {
      traits: [ "ANTI_AIR" ],
    };
  case "Soldier":
    return {
      traits: [ "SPARKSHOT" ],
    };
  case "Horror":
    return {
      traits: [ "DEATHTOUCH" ],
    };
  case "Daigo Stormborne":
    return {
      traits: [ "INDESTRUCTIBLE", "UNTARGETABLE", "UNSTOPPABLE", "NO_PATROL" ],
    };
  case "Bird":
    return {
      traits: [ "FLYING" ],
    };
  case "Mech":
    return {
      attributes: { FORECAST: 2 },
      traits: [ "UNTARGETABLE" ],
    };
  case "Pirate":
  case "Wisp":
  case "Beast":
  case "Frog":
  case "Squirrel":
  case "Mirror Illusion":
  case "Skeleton":
  case "Warlock":
  case "Zombie":
  case "Ninja":
  case "Stinger":
  case "Dancer":
    return {};
  default:
    if (REQUIRE_ALL_CARD_PROPERTIES) {
      throw new Error(`Failed to find properties for token "${id}"`);
    }
    return {};
  }
});
