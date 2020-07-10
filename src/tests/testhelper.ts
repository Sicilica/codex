import { GameState } from "../framework/types";

export const P1 = "P1";
export const P2 = "P2";

export const initDummyGameState: () => GameState = () => {
  return {
    activePlayer: P1,
    instances: {},
    nextID: 100,
    players: {
      [P1]: {
        addon: null,
        base: {
          damage: 0,
        },
        gold: 0,
        specs: [ "ANARCHY", "BLOOD", "FIRE" ],
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
      },
      [P2]: {
        addon: null,
        base: {
          damage: 0,
        },
        gold: 0,
        specs: [ "BALANCE", "FERAL", "GROWTH" ],
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
      },
    },
  };
};
