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

const P1 = "P1";
const P2 = "P2";

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
    performAction($, {
      type: "END_TURN",
    });
    if ($.activePlayer === pid) {
      return;
    }
  }
  throw new Error("unknown player");
};

describe("basic", () => {
  let $: GameState;
  beforeEach(() => {
    $ = {
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

    it("discarding hand leaves hand empty", () => {
      const P = $.players[$.activePlayer];
      P.hand.push("Nautical Dog");

      performAction($, {
        type: "DISCARD_HAND",
      });

      expect(P.hand.length === 0).to.equal(true);
    });

    it("discarded hand goes to discard", () => {
      const P = $.players[$.activePlayer];
      P.hand.push("Nautical Dog");

      performAction($, {
        type: "DISCARD_HAND",
      });

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
