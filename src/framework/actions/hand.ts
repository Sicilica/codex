import { lookupCard } from "../../data";

import { CardID, GameState, PlayerState } from "../types";

import { makeInstance } from "./helpers";
import { isHero } from "../queries/common";
import { canPlayHero } from "./hero";

/**
 * NOTE: For security purposes, drawing should be handled or confirmed by the
 * server. Active players' clients should not be allowed to manipulate their
 * draw order, and the contents/order of the draw pile for other players needs
 * to be unknown.
 * NOTE: This draws the top card. For abilities that allow drawing an arbitrary
 * card from the player's deck, a different function should be used.
 */
export const drawCard = (P: PlayerState): boolean => {
  if (P.deck.length > 0) {
    P.hand = P.hand.concat(P.deck.splice(0, 1));
    return true;
  } else if (P.hasShuffledThisTurn) {
    return false;
  }

  P.hasShuffledThisTurn = true;
  shuffle(P);
  return drawCard(P);
};

/**
 * NOTE: For security purposes, shuffling should only be handled on the
 * server. This is to avoid clients from controlling the order of their card
 * draw.
 *
 * @param $
 * @param pid
 */
const shuffle = (P: PlayerState): void => {
  if (P.deck.length > 0) {
    throw new Error("deck is not empty");
  }

  shuffleCards(P.discard);

  P.deck = P.discard;
  P.discard = [];
};

/**
 * Shuffles the given set of cards. The array is shuffled in-place.
 * @param cards
 */
export const shuffleCards = (cards: Array<CardID>): void => {
  // Shamelessly copied from https://link.medium.com/1JmrvTx7Y7
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = cards[i];
    cards[i] = cards[j];
    cards[j] = temp;
  }
};

/**
 * For use at the end of a player's turn.
 *
 * @param $
 */
export const discardAll = (P: PlayerState): void => {
  P.discard = P.discard.concat(P.hand);
  P.hand = [];
};

/**
 *
 * @param $
 * @param cid when omitted, the card discarded from the player's hand will be
 * random
 */
export const discardCard = (
  P: PlayerState,
  cid?: string,
): void => {
  if (P.hand.length <= 0) {
    throw new Error("hand is empty");
  }

  const discardID = cid || P.hand[Math.floor(Math.random() * P.hand.length)];

  if (!removeFromHand(P, discardID)) {
    throw new Error("card not in hand");
  }

  P.discard.push(discardID);
};

export const playCard = (
  $: GameState,
  cid: string,
  boost: boolean,
): void => {
  if ($.turnPhase !== "MAIN") {
    throw new Error(`not in main phase (${$.turnPhase})`);
  }

  const card = lookupCard(cid);
  const P = $.players[$.activePlayer];

  let cost = card.cost;

  if (boost) {
    if (card.boostCost == null) {
      throw new Error("card not boostable");
    }

    cost = card.cost + card.boostCost;
  }

  if (P.gold < cost) {
    throw new Error("not enough money");
  }

  if (isHero(card)) {
    if (!canPlayHero($, card)) {
      throw new Error("hero not currently playable");
    }
  } else if (!removeFromHand(P, cid)) {
    throw new Error("card not in hand");
  }

  P.gold -= cost;

  switch (card.type) {
  case "HERO":
    makeInstance($, $.activePlayer, cid);
    break;
  case "UNIT":
    makeInstance($, $.activePlayer, cid);
    break;
  default:
    throw new Error("unexpected card type");
  }
};

export const removeFromHand = (P: PlayerState, cid: string): boolean => {
  const indexInHand = P.hand.indexOf(cid);
  if (indexInHand < 0) {
    return false;
  }

  P.hand = P.hand.slice(0, indexInHand).concat(P.hand.slice(indexInHand + 1));
  return true;
};
