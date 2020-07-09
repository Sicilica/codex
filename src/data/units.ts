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
  case "Nautical Dog":
    return [ "TODO" ];
  default:
    throw new Error(`Failed to find abilities for unit "${name}"`);
  }
};
