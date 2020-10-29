import { hasTrait } from "../framework/accessors";
import { GameEngine } from "../framework/engine";
import {
  CardID,
  InstanceID,
  InstanceState,
  PlayerState,
} from "../framework/types";

export const checkHasControl = (
  P: PlayerState,
  I: InstanceState,
): void => {
  if (I.controller !== P.id) {
    throw new Error("instance is not under your control");
  }
};

export const checkCanExhaust = (
  $: GameEngine,
  I: InstanceState,
): void => {
  checkReady(I);
  if (I.arrivalFatigue && !hasTrait($, I, "HASTE")) {
    throw new Error("instance cannot attack on the turn it arrived");
  }
};

export const checkReady = (
  I: InstanceState,
): void => {
  if (I.readyState !== "READY") {
    throw new Error("instance is not ready");
  }
};

export const checkUnitOrHero = (
  $: GameEngine,
  I: InstanceState,
): void => {
  const card = $.data.lookupCard(I.card);
  if (card.type !== "UNIT" && card.type !== "HERO") {
    throw new Error("instance is not a unit or hero");
  }
};

export const requireActivePlayer = (
  $: GameEngine,
): PlayerState => {
  const P = $.getPlayer($.state.activePlayer);
  if (P == null) {
    throw new Error("failed to find active player");
  }
  return P;
};

export const requireCardInHand = (
  P: PlayerState,
  cid: CardID,
): void => {
  if (!P.hand.includes(cid)) {
    throw new Error("card not in hand");
  }
};

export const requireGold = (
  P: PlayerState,
  amount: number,
): void => {
  if (P.gold < amount) {
    throw new Error("not enough gold");
  }
};

export const requireInstance = (
  $: GameEngine,
  iid: InstanceID | null,
): InstanceState => {
  const I = $.getInstance(iid);
  if (I == null) {
    throw new Error("instance not found");
  }
  return I;
};

export const requireMainPhase = (
  $: GameEngine,
): void => {
  if ($.state.turnPhase !== "MAIN") {
    throw new Error("this action is only available during the main phase");
  }
  if ($.state.unresolvedEffects.length > 0) {
    throw new Error("all pending effects must be resolved first");
  }
};

export const requireUsableTechBuilding = (
  $: GameEngine,
  P: PlayerState,
  tech: number,
): void => {
  const techBuilding = $.getInstance(P.techBuildings[tech - 1]);
  if (techBuilding == null) {
    throw new Error("missing tech building");
  }
  if (techBuilding.arrivalFatigue) {
    throw new Error("tech building is still being built");
  }
  if (techBuilding.readyState !== "READY") {
    throw new Error("tech building is disabled");
  }
};
