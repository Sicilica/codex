import { GameEngine } from "../engine";
import { InstanceState } from "../types";

export const getCurrentBand = (
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

  for (let i = 0; i < 3; i++) {
    if (I.level < (card.bands[i].nextLevel ?? 999)) {
      return i;
    }
  }

  throw new Error("panic: failed to determine hero current band");
};

export const getMaxLevel = (
  $: GameEngine,
  I: InstanceState | null,
): number => {
  if (I == null) {
    return 1;
  }

  const card = $.data.lookupCard(I.card);
  if (card.type !== "HERO") {
    return 1;
  }

  return card.bands[1].nextLevel ?? 1;
};

export const isMaxLevel = (
  $: GameEngine,
  I: InstanceState | null,
): boolean => {
  return (I?.level ?? 0) >= getMaxLevel($, I);
};
