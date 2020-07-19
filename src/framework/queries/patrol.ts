import {
  GameState,
  Instance,
} from "../types";

import {
  getPlayer,
} from "./common";

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
