import { CardID, GameState } from "../types";

export const buyWorker = ($: GameState, cid: CardID): void => {
  const P = $.players[$.activePlayer];

  if (P.hasBuiltWorkerThisTurn) {
    throw new Error("only one worker per turn");
  }

  if (P.gold < 1) {
    throw new Error("cannot afford worker");
  }

  const indexInHand = P.hand.indexOf(cid);
  if (indexInHand < 0) {
    throw new Error("card not in hand");
  }

  P.hand = P.hand.slice(0, indexInHand).concat(P.hand.slice(indexInHand + 1));
  P.gold -= 1;
  P.workers += 1;

  P.hasBuiltWorkerThisTurn = true;
};
