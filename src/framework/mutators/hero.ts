import { getMaxLevel } from "../accessors";
import { GameEngine } from "../engine";
import { InstanceState } from "../types";

export const giveLevels = (
  $: GameEngine,
  I: InstanceState,
  amount: number,
): void => {
  const maxLevel = getMaxLevel($, I);
  const wasMaxBand = I.level >= maxLevel;
  I.level = Math.min(maxLevel, I.level + amount);
  if (!wasMaxBand && I.level >= maxLevel) {
    $.fireInstanceTrigger(I, {
      type: "MAX_BAND",
    });
  }
};
