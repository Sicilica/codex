
import { newGame, simulateAction } from "..";
import { CachedDataSource, loadCards } from "../data";
import { GameEngine } from "../framework/engine";
import {
  Action,
  CardID,
  InstanceQuery,
  InstanceState,
  PlayerID,
  ResolvableEffect,
} from "../framework/types";
import { requireActivePlayer } from "../game/helpers";

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
        cards: [ "Crash Bomber", "Firebat" ],
      });
    }
  } while ($.state.activePlayer !== pid);
};

export const debugPlayCard = (
  $: GameEngine,
  cid: CardID,
): void => {
  const card = $.data.lookupCard(cid);
  requireActivePlayer($).gold += card.cost;
  requireActivePlayer($).hand.push(cid);
  debugAction($, {
    type: "PLAY_CARD",
    card: cid,
    boost: false,
  });
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

export const debugAction = (
  $: GameEngine,
  action: Action,
): void => {
  const res = simulateAction($.state, action, data);
  if (res.error != null) {
    throw new Error(`${res.error}`);
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
