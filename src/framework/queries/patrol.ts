import {
  GameState,
  Instance,
  PatrolSlot,
  PlayerState,
} from "../types";

import {
  getPlayer,
} from "./common";

export const getPatrollingSlot = (
  $: GameState,
  I: Instance,
): PatrolSlot | null => {
  const P = getPlayer($, I.controller);
  for (const slot in P?.patrol ?? {}) {
    if (P?.patrol[slot as PatrolSlot] === I.id) {
      return slot as PatrolSlot;
    }
  }
  return null;
};

export const hasEmptyPatrolSlot = (
  P: PlayerState,
): boolean => {
  return Object.values(P.patrol).some(iid => iid == null);
};

export const isPatrolling = (
  $: GameState,
  I: Instance,
): boolean => {
  return getPatrollingSlot($, I) != null;
};

export const isScavenger = (
  $: GameState,
  I: Instance,
): boolean => {
  const P = getPlayer($, I.controller);
  if (P == null || $.activePlayer === P.id) {
    return false;
  }
  return P.patrol.scavenger === I.id;
};

export const isTechnician = (
  $: GameState,
  I: Instance,
): boolean => {
  const P = getPlayer($, I.controller);
  if (P == null || $.activePlayer === P.id) {
    return false;
  }
  return P.patrol.technician === I.id;
};
