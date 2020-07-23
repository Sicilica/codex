import { GameState, PlayerID, PlayerState, Spec } from "../types";
import { MAX_HAND_SIZE } from "../constants";
import { shuffleCards } from "../actions/hand";
import { getSpecStarters } from "../../data/spec";

export type PlayerSetupData = {
  starterDeckSpec: Spec;
  otherSpecs: [Spec, Spec];
};

export const createInitialGameState = (
  players: Array<PlayerSetupData>
): GameState => {
  const playerStates = players.map((player, idx) => {
    return createPlayer(player, idx === 0);
  });

  const playerMap: Record<PlayerID, PlayerState> = {};
  playerStates.forEach((player, idx) => {
    playerMap[idxToPlayerID(idx)] = player;
  });

  return <GameState>{
    firstPlayer: idxToPlayerID(0),
    round: 1,
    activePlayer: idxToPlayerID(0),
    turnPhase: "READY",
    instances: {},
    nextID: 100,
    players: playerMap,
  };
};

const createPlayer = (
  playerData: PlayerSetupData,
  isFirst: boolean
): PlayerState => {
  // One day, we might allow just a single spec
  const specs: [Spec, Spec, Spec] = [
    playerData.starterDeckSpec,
    playerData.otherSpecs[0],
    playerData.otherSpecs[1],
  ];

  const startingCards = getSpecStarters(playerData.starterDeckSpec);
  shuffleCards(startingCards);

  return <PlayerState>{
    addon: null,
    base: {
      damage: 0,
    },
    workers: isFirst ? 4 : 5,
    gold: 0,
    specs,
    mainSpec: null,
    hand: startingCards.slice(0, MAX_HAND_SIZE),
    discard: [],
    deck: startingCards.slice(MAX_HAND_SIZE),
    heroFatigue: [ 0, 0, 0 ],
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

const idxToPlayerID = (idx: number): PlayerID => {
  return `P${idx + 1}`;
};
