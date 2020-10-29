import { Color, Spec } from "../framework/types";

export const getSpecColor = (
  spec: Spec,
): Color => {
  return colorMap[spec];
};

export const isValidSpec = (
  spec: Spec,
): boolean => {
  return spec in colorMap;
};

const colorMap: Record<Spec, Color> = {
  ANARCHY: "RED",
  BLOOD: "RED",
  FIRE: "RED",

  BALANCE: "GREEN",
  FERAL: "GREEN",
  GROWTH: "GREEN",

  LAW: "BLUE",
  PEACE: "BLUE",
  TRUTH: "BLUE",

  DEMONOLOGY: "BLACK",
  DISEASE: "BLACK",
  NECROMANCY: "BLACK",

  DISCIPLINE: "WHITE",
  NINJUTSU: "WHITE",
  STRENGTH: "WHITE",

  PAST: "PURPLE",
  PRESENT: "PURPLE",
  FUTURE: "PURPLE",

  BASHING: "NEUTRAL",
  FINESSE: "NEUTRAL",
};
