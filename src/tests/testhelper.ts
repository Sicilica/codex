import { lookupCard } from "../data";
import { performAction } from "../framework/actions";
import {
  CardID,
  GameState,
  InstanceID,
  PlayerState,
  Spec,
} from "../framework/types";
import { InstanceQuery, queryInstances } from "../framework/queries/common";


export const P1 = "P1";
export const P2 = "P2";

export const initDummyGameState: () => GameState = () => {
  return {
    firstPlayer: P1,
    round: 1,
    activePlayer: P1,
    turnPhase: "MAIN",
    instances: {},
    nextID: 100,
    players: {
      [P1]: generatePlayer([ "ANARCHY", "BLOOD", "FIRE" ], true),
      [P2]: generatePlayer([ "BALANCE", "FERAL", "GROWTH" ]),
    },
  };
};

const generatePlayer = (
  specs: [Spec, Spec, Spec],
  first = false
): PlayerState => {
  return {
    addon: null,
    base: {
      damage: 0,
    },
    workers: first ? 4 : 5,
    gold: 0,
    specs,
    mainSpec: null,
    hand: [],
    discard: [],
    deck: [],
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
    techBuildings: [
      {
        damage: 0,
        purchased: false,
        ready: false,
      },
      {
        damage: 0,
        purchased: false,
        ready: false,
      },
      {
        damage: 0,
        purchased: false,
        ready: false,
      },
    ],
  };
};


const findInstance = (
  $: GameState,
  query: InstanceQuery,
): InstanceID => {
  return queryInstances($, query)[0];
};

export const debugPlayCard = (
  $: GameState,
  cid: CardID,
): void => {
  const card = lookupCard(cid);
  $.players[$.activePlayer].gold += card.cost;
  $.players[$.activePlayer].hand.push(cid);
  performAction($, {
    type: "PLAY_CARD",
    cardID: cid,
    boost: false,
  });
};

export const debugPlayUnit = (
  $: GameState,
  cid: CardID,
): InstanceID => {
  debugPlayCard($, cid);
  return findInstance($, {
    card: cid,
  });
};
