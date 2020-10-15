import { getSpecStarters } from "../../data/spec";

import { shuffleCards } from "../actions/hand";
import { makeInstance } from "../actions/helpers";
import { MAX_HAND_SIZE } from "../constants";
import { GameState, PlayerState, Spec } from "../types";

export type PlayerSetupData = {
  starterDeckSpec: Spec;
  otherSpecs: [Spec, Spec];
};

export const createInitialGameState = (
  players: Array<PlayerSetupData>,
): GameState => {
  const $: GameState = {
    firstPlayer: "nil",
    round: 1,
    activePlayer: "nil",
    turnPhase: "READY",
    instances: {},
    nextInstanceID: 1,
    players: {},
  };

  for (const setupData of players) {
    addPlayer($, setupData);
  }

  if ($.firstPlayer === "nil") {
    throw new Error("unable to create game with no players");
  }

  return $;
};

const addPlayer = (
  $: GameState,
  setupData: PlayerSetupData,
): PlayerState => {
  const index = Object.keys($.players).length;
  const isFirst = index === 0;
  const pid = `P${index + 1}`;

  const base = makeInstance($, pid, "$BASE");

  const startingCards = getSpecStarters(setupData.starterDeckSpec);
  shuffleCards(startingCards);

  if (isFirst) {
    $.activePlayer = pid;
    $.firstPlayer = pid;
  }

  const P: PlayerState = {
    id: pid,
    base: base.id,
    specs: [
      setupData.starterDeckSpec,
      ...setupData.otherSpecs,
    ],
    addon: null,
    techLabSpec: null,
    workers: isFirst ? 4 : 5,
    gold: 0,
    hand: startingCards.slice(0, MAX_HAND_SIZE),
    deck: startingCards.slice(MAX_HAND_SIZE),
    discard: [],
    canSkipTech: false,
    hasShuffledThisTurn: false,
    hasBuiltWorkerThisTurn: false,
    patrol: {
      squadLeader: null,
      elite: null,
      scavenger: null,
      technician: null,
      lookout: null,
    },
    purchasedTechBuildings: 0,
    techBuildings: [ null, null, null ],
    mainSpec: null,
  };

  $.players[pid] = P;

  return P;
};
