import { GameState, PlayerState, Spec } from "../framework/types";

export const P1 = "P1";
export const P2 = "P2";

export const initDummyGameState: () => GameState = () => {
  return {
    activePlayer: P1,
    instances: {},
    nextID: 100,
    players: {
      [P1]: generatePlayer([ "ANARCHY", "BLOOD", "FIRE" ]),
      [P2]: generatePlayer([ "BALANCE", "FERAL", "GROWTH" ]),
    },
  };
};

const generatePlayer = (specs: [Spec, Spec, Spec]): PlayerState => {
  return {
    addon: null,
    base: {
      damage: 0,
    },
    gold: 0,
    specs,
    mainSpec: null,
    hand: [],
    discard: [],
    deck: [],
    hasShuffledThisTurn: false,
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
