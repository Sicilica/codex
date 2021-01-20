import { newGame, simulateAction } from "..";
import { CachedDataSource, loadCards } from "../data";
import { GameEngine } from "../framework/engine";
import {
  Action,
  CardID,
  InstanceQuery,
  InstanceState,
  PlayerID,
  PlayerState,
  ResolvableEffect,
} from "../framework/types";
import { performAction, resolveEffect } from "../game/actions";
import { effectParamsAreValid } from "../game/effects";
import { requireActivePlayer } from "../game/helpers";
import { cancelInvalidEffects, simulateUntilIdle } from "../game/system";

export const P1 = "P1";
export const P2 = "P2";

const data = new CachedDataSource(loadCards());

export const makeDefaultGame = (): GameEngine => {
  const state = newGame([
    {
      startingColor: "RED",
      specs: [ "ANARCHY", "BLOOD", "FIRE" ],
    },
    {
      startingColor: "GREEN",
      specs: [ "BALANCE", "FERAL", "GROWTH" ],
    },
  ], data);

  return new GameEngine(state, data, []);
};

export const debugAutoResolve = (
  $: GameEngine,
): void => {
  while ($.state.unresolvedEffects.length > 0) {
    simulateUntilIdle($);

    const nextEffect = $.state.unresolvedEffects[0];
    if (nextEffect != null) {
      if (effectParamsAreValid($, nextEffect, {})) {
        resolveEffect($, nextEffect.id, {});
      } else {
        throw new Error("encountered effect that cannot be auto-resolved");
      }
    }
  }
};

export const debugGotoNextTurn = (
  $: GameEngine,
  pid: PlayerID,
): void => {
  do {
    debugAction($, {
      type: "END_TURN",
      patrol: {
        SQUAD_LEADER: null,
        ELITE: null,
        SCAVENGER: null,
        TECHNICIAN: null,
        LOOKOUT: null,
      },
    });

    if ($.state.turnPhase === "TECH") {
      debugAction($, {
        type: "TECH",
        cards: pickNextCardsFromCodex(requireActivePlayer($)),
      });
    }
  } while ($.state.activePlayer !== pid);
};

export const debugPlayCard = (
  $: GameEngine,
  cid: CardID,
  simulate = true,
): void => {
  const card = $.data.lookupCard(cid);
  requireActivePlayer($).gold += card.cost;
  requireActivePlayer($).hand.push(cid);
  debugAction(
    $,
    {
      type: "PLAY_CARD",
      card: cid,
      boost: false,
    },
    simulate
  );
};

export const debugPlayUnit = (
  $: GameEngine,
  cid: CardID,
): InstanceState => {
  debugPlayCard($, cid);
  const I = findLastInstance($, {
    card: cid,
  });
  if (I == null) {
    throw new Error("failed to find played unit");
  }
  return I;
};

export const debugValidateEffects = (
  $: GameEngine,
): void => {
  cancelInvalidEffects($);
};

export const debugAction = (
  $: GameEngine,
  action: Action,
  simulate = true,
): void => {
  if (simulate) {
    const res = simulateAction($.state, action, data);
    if (res.error != null) {
      throw new Error(`${res.error}`);
    }
  } else {
    performAction($, action);
  }
};

export const debugEffect = (
  $: GameEngine,
  effect: ResolvableEffect,
): void => {
  debugAction($, {
    type: "RESOLVE_EFFECT",
    effect: $.queueEffect(effect),
    params: {},
  });
};

const findLastInstance = (
  $: GameEngine,
  q: InstanceQuery,
): InstanceState | null => {
  let toRet = null;
  for (const I of $.queryInstances(q)) {
    toRet = I;
  }
  return toRet;
};

const pickNextCardsFromCodex = (
  P: PlayerState,
): Array<CardID> => {
  let foundOne: CardID | undefined;
  for (const cid in P.codex) {
    if (Object.prototype.hasOwnProperty.call(P.codex, cid)) {
      const count = P.codex[cid] ?? 0;
      if (count >= 2) {
        return [ cid, cid ];
      } else if (count > 0) {
        if (foundOne == null) {
          foundOne = cid;
        } else {
          return [ foundOne, cid ];
        }
      }
    }
  }
  throw new Error("unable to pick techable cards from codex");
};
