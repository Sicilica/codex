import { Ability } from "../framework/types";

export const getUpgradeAbilities = (
  name: string,
): Array<Ability> => {
  switch (name) {
  default:
    throw new Error(`Failed to find abilities for upgrade "${name}"`);
  }
};
