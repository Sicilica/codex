import { CardID, GameState } from "../types";
import { removeFromHand } from "./hand";

export const buyWorker = ($: GameState, cid: CardID): void => {
  const P = $.players[$.activePlayer];

  if (P.hasBuiltWorkerThisTurn) {
    throw new Error("only one worker per turn");
  }

  if (P.gold < 1) {
    throw new Error("cannot afford worker");
  }

  if (!removeFromHand(P, cid)) {
    throw new Error("card not in hand");
  }

  P.gold -= 1;
  P.workers += 1;

  P.hasBuiltWorkerThisTurn = true;
};
