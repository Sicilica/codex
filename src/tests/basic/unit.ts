import { expect } from "chai";

import { lookupCard } from "../../data";
import { performAction } from "../../framework/actions";
import { canAttack, canPatrol } from "../../framework/queries/combat";
import {
  InstanceQuery,
  queryInstances,
} from "../../framework/queries/common";
import {
  CardID,
  GameState,
  InstanceID,
} from "../../framework/types";

import {
  P1,
  debugGotoNextTurn,
  initDummyGameState,
} from "../testhelper";

const findInstance = (
  $: GameState,
  query: InstanceQuery,
): InstanceID => {
  return queryInstances($, query)[0];
};

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
): InstanceID => {
  debugPlayCard($, cid);
  return findInstance($, {
    card: cid,
  });
};

describe("basic", () => {
  describe("unit", () => {
    let $: GameState;
    beforeEach(() => {
      $ = initDummyGameState();
    });

    it("can't attack when first played", () => {
      const iid = debugPlayUnit($, "Nautical Dog");

      expect(canAttack($, iid)).to.equal(false);
    });

    it("can attack the turn after it's played", () => {
      const iid = debugPlayUnit($, "Nautical Dog");
      debugGotoNextTurn($, P1);

      expect(canAttack($, iid)).to.equal(true);
    });

    it("can patrol when first played", () => {
      const iid = debugPlayUnit($, "Nautical Dog");

      expect(canPatrol($, iid)).to.equal(true);
    });
  });
});
