import { Ability } from "../framework/types";

export const getBuildingAbilities = (
  name: string,
): Array<Ability> => {
  switch (name) {
  case "Sanatorium":
    return [ "TODO" ];
  default:
    throw new Error(`Failed to find abilities for building "${name}"`);
  }
};
