import { Ability } from "../framework/types";

export const getBuildingAbilities = (
  name: string,
): Array<Ability> => {
  switch (name) {
  default:
    throw new Error(`Failed to find abilities for building "${name}"`);
  }
};
