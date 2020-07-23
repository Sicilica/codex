import { Ability } from "../framework/types";
import { ERROR_ON_MISSING_ABILITIES } from ".";

export const getHeroAbilities = (
  name: string,
  index: 0 | 1 | 2,
): Array<Ability> => {
  switch (name) {
  case "Captain Zane":
    switch (index) {
    case 0:
      return [ "TODO" ];
    case 1:
      return [ "TODO" ];
    case 2:
      return [ "TODO" ];
    default:
      return [];
    }
  default:
    if (ERROR_ON_MISSING_ABILITIES) {
      throw new Error(`Failed to find abilities for hero "${name}"`);
    }

    return [];
  }
};
