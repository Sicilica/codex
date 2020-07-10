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
  PlayerID,
} from "../../framework/types";
import { P1, initDummyGameState } from "../testhelper";

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

const debugGotoNextTurn = (
  $: GameState,
  pid: PlayerID,
) => {
  for (let i = 0; i < Object.keys($.players).length; i++) {
    const P = $.players[$.activePlayer];
    while (P.deck.length < 2) {
      P.deck.push("Nautical Dog");
    }

    performAction($, {
      type: "END_TURN",
    });

    if ($.turnPhase === "TECH") {
      performAction($, {
        type: "TECH",
        cards: [ "Crash Bomber", "Firebat" ],
      });
    }

    if ($.activePlayer === pid) {
      return;
    }
  }
  throw new Error("unknown player");
};

describe("basic", () => {
  let $: GameState;
  beforeEach(() => {
    $ = initDummyGameState();
  });
  describe("card", () => {
    it("can't play card not in hand", () => {
      expect(() => performAction($, {
        type: "PLAY_CARD",
        cardID: "Nautical Dog",
        boost: false,
      })).to.throw("card not in hand");
    });

    it("played card is removed from hand", () => {
      debugPlayCard($, "Nautical Dog");

      const P = $.players[$.activePlayer];
      expect(P.hand.pop() === "Nautical Dog").to.equal(false);
    });

    it("played card goes to discard", () => {
      debugPlayCard($, "Nautical Dog");

      const P = $.players[$.activePlayer];
      expect(P.discard.pop() === "Nautical Dog").to.equal(true);
    });
  });

  describe("unit", () => {
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
