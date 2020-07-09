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
  describe("hand", () => {
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
            hand: [ "Nautical Dog", "Mad Man", "Bombaster" ],
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

    it("moves cards from hand to discard pile when discarding", () => {
      performAction($, {
        type: "DISCARD_SELECTED_CARD",
        cardID: "Nautical Dog",
      });

      expect($.players[P1].hand.length).to.equal(2);
      expect($.players[P1].hand.indexOf("Nautical Dog")).to.equal(-1);
      expect($.players[P1].discard.length).to.equal(1);
      expect($.players[P1].discard.indexOf("Nautical Dog")).to.equal(0);
    });

    it("fails to discard when card is not in the player's hand", () => {
      expect(() =>
        performAction($, {
          type: "DISCARD_SELECTED_CARD",
          cardID: "Careless Musketeer",
        })).to.throw("card not in hand");

      expect($.players[P1].hand.length).to.equal(3);
      expect($.players[P1].hand.indexOf("Nautical Dog")).to.equal(0);
    });
  });
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
