import { expect } from "chai";

import { lookupCard } from "../../data";
import { performAction } from "../../framework/actions";
import { canAttack, canPatrol } from "../../framework/queries/combat";
import {
  findInstance,
} from "../../framework/queries/common";
import {
  CardID,
  GameState,
  Instance,
} from "../../framework/types";

import {
  P1,
  debugGotoNextTurn,
  initDummyGameState,
} from "../testhelper";

const debugPlayCard = (
  $: GameState,
  cid: CardID,
) => {
  const card = lookupCard(cid);
  $.players[$.activePlayer].gold += card.cost;
  $.players[$.activePlayer].hand.push(cid);
  performAction($, {
    type: "PLAY_CARD",
    cardID: cid,
    boost: false,
  });
};

const debugPlayUnit = (
  $: GameState,
  cid: CardID,
): Instance => {
  debugPlayCard($, cid);
  const I = findInstance($, {
    card: cid,
  });
  if (I == null) {
    throw new Error("failed to find played unit");
  }
  return I;
};

describe("basic", () => {
  describe("unit", () => {
    let $: GameState;
    beforeEach(() => {
      $ = initDummyGameState();
    });

    it("can't attack when first played", () => {
      const I = debugPlayUnit($, "Nautical Dog");

      expect(canAttack($, I.id)).to.equal(false);
    });

    it("can attack the turn after it's played", () => {
      const I = debugPlayUnit($, "Nautical Dog");
      debugGotoNextTurn($, P1);

      expect(canAttack($, I.id)).to.equal(true);
    });

    it("can patrol when first played", () => {
      const I = debugPlayUnit($, "Nautical Dog");

      expect(canPatrol($, I.id)).to.equal(true);
    });
  });
});
