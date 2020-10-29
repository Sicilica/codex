import { BASE_CARD } from "./data/core";
import { getSpecColor, isValidSpec } from "./data/spec";
import { GameEngine } from "./framework/engine";
import { createInstance } from "./framework/mutators";
import {
  Action,
  Card,
  Color,
  DataSource,
  GameState,
  PlayerState,
  ResolvableEffect,
  Spec,
} from "./framework/types";
import { performAction, resolveEffect } from "./game/actions";
import { resolveCombat } from "./game/combat";
import { effectParamsAreValid } from "./game/effects";
import {
  gotoEndOfTurnPhase,
  gotoMainPhase,
  gotoReadyPhase,
  gotoTechPhase,
  gotoUpkeepPhase,
} from "./game/turn_phases";

export interface ErrorResult {
  error: string;
}

export interface SimulationResult {
  error: null;
  log: Array<ResolvableEffect>;
  state: GameState;
}

export const newGame = (
  players: Array<{
    specs: PlayerState["specs"],
    startingColor: Color,
  }>,
  dataSource: DataSource,
): GameState => {
  const state: GameState = {
    time: 1,
    round: 1,
    activePlayer: null as any,
    turnPhase: "TECH",
    players: {},
    instances: {},
    unresolvedEffects: [],
    unresolvedCombat: null,
    nextID: 1,
    earliestAllowedRewind: 1,
  };

  const $ = new GameEngine(state, dataSource, []);

  let nextPID = 1;
  for (const playerDef of players) {
    if (playerDef.specs.length !== 3) {
      throw new Error("invalid number of specs");
    }
    for (const spec of playerDef.specs) {
      if (playerDef.specs.filter(s => s === spec).length > 1) {
        throw new Error("cannot have two copies of the same spec");
      }
      if (!isValidSpec(spec)) {
        throw new Error(`invalid spec "${spec}"`);
      }
    }
    if (playerDef.specs.every(
      s => getSpecColor(s) !== playerDef.startingColor,
    )) {
      throw new Error("starting color doesn't match any of the chosen specs");
    }

    const pid = `P${nextPID++}`;

    const isFirstPlayer = state.activePlayer == null;
    if (isFirstPlayer) {
      state.activePlayer = pid;
    }

    const P: PlayerState = {
      id: pid,
      isFirstPlayer,
      specs: playerDef.specs,
      base: null as any,
      techBuildings: [ null, null, null ],
      mainSpec: null,
      addon: null,
      techLabSpec: null,
      gold: 0,
      workers: isFirstPlayer ? 4 : 5,
      patrol: {
        SQUAD_LEADER: null,
        ELITE: null,
        SCAVENGER: null,
        TECHNICIAN: null,
        LOOKOUT: null,
      },
      hand: [],
      deck: [],
      discard: [],
      codex: {},
      canSkipTech: false,
      hasBuiltWorkerThisTurn: false,
      hasShuffledThisTurn: false,
      purchasedTechBuildings: 0,
    };
    state.players[pid] = P;

    state.players[pid].base = createInstance($, P, BASE_CARD).id;

    const startingDeck = Array.from(
      getStartingDeck($, playerDef.startingColor),
    ).map(card => card.id);
    $.shuffleArray(startingDeck);
    P.hand = startingDeck.slice(0, 5);
    P.deck = startingDeck.slice(5);

    for (const spec of P.specs) {
      for (const card of getCodex($, spec)) {
        P.codex[card.id] = 2;
      }
    }
  }

  gotoReadyPhase($);
  simulateUntilIdle($);

  return state;
};

export const simulateAction = (
  state: GameState,
  action: Action,
  dataSource: DataSource,
): ErrorResult | SimulationResult => {
  const log: Array<ResolvableEffect> = [];
  const $ = new GameEngine(state, dataSource, log);

  // We should never expect any errors other than directly from executing the
  // requested action. Actions should always do all of their validation before
  // manipulating state, though this isn't actually an external guarantee of
  // this API.
  try {
    performAction($, action);
  } catch (e) {
    return {
      error: e.message,
    };
  }

  simulateUntilIdle($);

  state.time++;

  return {
    error: null,
    log,
    state,
  };
};

function *getCodex(
  $: GameEngine,
  spec: Spec,
): Iterable<Card> {
  for (const card of $.data.allCards()) {
    if (card.spec === spec) {
      yield card;
    }
  }
}

function *getStartingDeck(
  $: GameEngine,
  color: Color,
): Iterable<Card> {
  for (const card of $.data.allCards()) {
    if (card.spec == null && card.color === color) {
      yield card;
    }
  }
}

const simulateUntilIdle = (
  $: GameEngine,
): void => {
  let returnControlToPlayer = false;
  while (!returnControlToPlayer) {
    // TODO if instance was added or removed, recalc continuous effects
    // TODO check validity of all effects

    if ($.state.unresolvedEffects.length === 0) {
      // There are no pending effects. We should automatically advance the
      // game.
      if ($.state.unresolvedCombat == null) {
        switch ($.state.turnPhase) {
        case "TECH":
          // Prompt the player to choose their techs.
          returnControlToPlayer = true;
          break;
        case "READY":
          gotoUpkeepPhase($);
          break;
        case "UPKEEP":
          gotoMainPhase($);
          break;
        case "MAIN":
          // Wait for the player's next action.
          returnControlToPlayer = true;
          break;
        case "DRAW":
          gotoEndOfTurnPhase($);
          break;
        case "END_OF_TURN":
          gotoTechPhase($);
          break;
        case "GAME_OVER":
          returnControlToPlayer = true;
          break;
        }
      } else {
        resolveCombat($, $.state.unresolvedCombat);
        $.state.unresolvedCombat = null;
      }
    } else if ($.state.unresolvedEffects.length === 1
      && effectParamsAreValid($, $.state.unresolvedEffects[0], {})) {
      // There's only one pending effect and it requires no params, so we can
      // just resolve it immediately without needing player input.
      resolveEffect($, $.state.unresolvedEffects[0].id, {});
    } else {
      // There are multiple pending effects to choose from, or we need params.
      returnControlToPlayer = true;
    }
  }
};