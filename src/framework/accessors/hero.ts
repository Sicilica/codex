import { GameEngine } from "../engine";
import { InstanceState } from "../types";

export const getMaxLevel = (
  $: GameEngine,
  I: InstanceState | null,
): number => {
  if (I == null) {
    return 0;
  }

  const card = $.data.lookupCard(I.card);
  if (card.type !== "HERO") {
    return 0;
  }

  return card.bands[1].nextLevel ?? 0;
};

export const isMaxLevel = (
  $: GameEngine,
  I: InstanceState | null,
): boolean => {
  return (I?.level ?? 0) >= getMaxLevel($, I);
};
