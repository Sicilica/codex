import { CardID, GameState } from "../types";
import { discardAll, drawCard } from "./hand";
import { MAX_GOLD, MAX_HAND_SIZE, WORKERS_TO_SKIP_TECH } from "../constants";
import { queryInstances } from "../queries/common";

const handleReadyPhase = ($: GameState): void => {
  if ($.turnPhase !== "READY") {
    throw new Error(`not in ready phase (${$.turnPhase})`);
  }

  const P = $.players[$.activePlayer];

  P.hasShuffledThisTurn = false;
  P.hasBuiltWorkerThisTurn = false;

  P.patrol.squadLeader = null;
  P.patrol.elite = null;
  P.patrol.scavenger = null;
  P.patrol.technician = null;
  P.patrol.lookout = null;

  for (const iid of queryInstances($, {
    player: $.activePlayer,
  })) {
    const I = $.instances[iid];

    I.arrivalFatigue = false;
    I.readyState = I.readyState === "DISABLED" ? "EXHAUSTED" : "READY";

    // Make dead heroes available
  }

  rebuildTechBuildings($, $.players[$.activePlayer]);

  $.turnPhase = "UPKEEP";

  handleUpkeepPhase($);
};

const handleUpkeepPhase = ($: GameState): void => {
  if ($.turnPhase !== "UPKEEP") {
    throw new Error(`not in upkeep phase (${$.turnPhase})`);
  }

  const P = $.players[$.activePlayer];

  P.gold = Math.min(P.gold + P.workers, MAX_GOLD);

  // Run any upkeep actions

  $.turnPhase = "MAIN";
};

import { rebuildTechBuildings } from "./buildings";

export const endTurn = (
  $: GameState,
): void => {
  if ($.turnPhase !== "MAIN") {
    throw new Error(`not in main phase (${$.turnPhase})`);
  }

  $.turnPhase = "DRAW";

  handleDrawPhase($);
};

const handleDrawPhase = ($: GameState): void => {
  const P = $.players[$.activePlayer];
  if ($.turnPhase !== "DRAW") {
    throw new Error(`not in draw phase (${$.turnPhase})`);
  }

  const handSize = Math.min(P.hand.length + 2, MAX_HAND_SIZE);
  discardAll(P);
  for (let i = 0; i < handSize; i++) {
    drawCard(P);
  }

  advancePlayer($);

  $.turnPhase = "TECH";

  if ($.round === 1) {
    techCards($, []);
  }
};

const advancePlayer = ($: GameState): void => {
  const pids = Object.keys($.players);
  const currentIndex = pids.indexOf($.activePlayer);
  $.activePlayer = pids[(currentIndex + 1) % pids.length];

  if ($.activePlayer === $.firstPlayer) {
    $.round++;
  }
};

export const techCards = ($: GameState, cardsToTech: Array<CardID>): void => {
  const P = $.players[$.activePlayer];

  if ($.turnPhase !== "TECH") {
    throw new Error(`not in tech phase (${$.turnPhase})`);
  }

  if (!enoughCardsToStartTurn($, cardsToTech)) {
    throw new Error("not enough cards to tech");
  }

  if (!cardSelectionIsValid(cardsToTech)) {
    throw new Error("invalid tech card selection");
  }

  P.discard = P.discard.concat(cardsToTech);

  $.turnPhase = "READY";
  handleReadyPhase($);
};

const enoughCardsToStartTurn = (
  $: GameState,
  cardsToTech: Array<CardID>
): boolean => {
  const P = $.players[$.activePlayer];

  P.canSkipTech = P.canSkipTech || P.workers >= WORKERS_TO_SKIP_TECH;

  return $.round === 1 || P.canSkipTech || cardsToTech.length === 2;
};

const cardSelectionIsValid = (
  cardsToTech: Array<CardID>
): boolean => {
  // Also check that cards are valid options by the player's codex

  return cardsToTech.length <= 2;
};
