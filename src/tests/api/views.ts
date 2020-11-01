import { expect } from "chai";

import { REDACTED_CARD, getViewForPlayer } from "../..";
import { GameState, PlayerState } from "../../framework/types";

import {
  P1,
  P2,
  makeDefaultGame,
} from "../testhelper";

describe("api", () => {
  describe("getViewForPlayer()", () => {
    let state: GameState;
    let ownView: PlayerState;
    let oppView: PlayerState;

    beforeEach(() => {
      state = makeDefaultGame().state;
      for (const pid in state.players) {
        if (Object.prototype.hasOwnProperty.call(state.players, pid)) {
          state.players[pid].discard.push("Crash Bomber");
        }
      }

      const view = getViewForPlayer(state, P1);
      ownView = view.players[P1];
      oppView = view.players[P2];
    });

    it("doesn't hide own hand", () => {
      expect(ownView.hand).to.deep.equal(state.players[P1].hand);
      expect(ownView.hand.includes(REDACTED_CARD)).to.equal(false);
    });

    it("hides own deck", () => {
      expect(ownView.deck).not.to.deep.equal(state.players[P1].deck);
      expect(ownView.deck.includes(REDACTED_CARD)).to.equal(true);
    });

    it("doesn't hide own discard", () => {
      expect(ownView.discard).to.deep.equal(state.players[P1].discard);
      expect(ownView.discard.includes(REDACTED_CARD)).to.equal(false);
    });

    it("doesn't hide own codex", () => {
      expect(ownView.codex).to.deep.equal(state.players[P1].codex);
      expect(
        Object.keys(ownView.codex).includes(REDACTED_CARD),
      ).to.equal(false);
    });

    it("hides others' hands", () => {
      expect(oppView.hand).not.to.deep.equal(state.players[P2].hand);
      expect(oppView.hand.includes(REDACTED_CARD)).to.equal(true);
    });

    it("hides others' decks", () => {
      expect(oppView.deck).not.to.deep.equal(state.players[P2].deck);
      expect(oppView.deck.includes(REDACTED_CARD)).to.equal(true);
    });

    it("hides others' discards", () => {
      expect(oppView.discard).not.to.deep.equal(state.players[P2].discard);
      expect(oppView.discard.includes(REDACTED_CARD)).to.equal(true);
    });

    it("hides others' codices", () => {
      expect(oppView.codex).not.to.deep.equal(state.players[P2].codex);
      expect(oppView.codex[REDACTED_CARD]).to.equal(72);
      expect(Object.keys(oppView.codex)).to.deep.equal([ REDACTED_CARD ]);
    });
  });
});
