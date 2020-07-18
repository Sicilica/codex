import { Ability } from "../framework/types";

const unitBoostCosts: Record<string, number | undefined> = {
  // such empty
};

export const getUnitBoostCost = (
  name: string,
): number | null => {
  return unitBoostCosts[name] ?? null;
};

export const getUnitAbilities = (
  name: string,
): Array<Ability> => {
  switch (name) {
  case "Calypso Vystari":
  case "Chameleon":
  case "Disguised Monkey":
  case "Gemscout Owl":
  case "Nautical Dog":
  case "Pirate Gunship":
  case "Tyrannosaurus Rex":
    return [ "TODO" ];
  default:
    throw new Error(`Failed to find abilities for unit "${name}"`);
  }
};
