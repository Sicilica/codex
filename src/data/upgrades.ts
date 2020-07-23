import { Ability } from "../framework/types";
import { ERROR_ON_MISSING_ABILITIES } from ".";

export const getUpgradeAbilities = (
  name: string,
): Array<Ability> => {
  switch (name) {
  default:
    if (ERROR_ON_MISSING_ABILITIES) {
      throw new Error(`Failed to find abilities for upgrade "${name}"`);
    }

    return [];
  }
};
