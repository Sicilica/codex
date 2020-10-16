// TODO this import is bad and scary
import { lookupCard } from ".";

import {
  dealDamage,
  giveGold,
  reduceGold,
  returnInstanceToHand,
} from "../framework/actions/helpers";
import { enqueuePrompt } from "../framework/prompts";
import {
  getInstance,
  getPlayer,
  isUnit,
} from "../framework/queries/common";
import { isPatrolling } from "../framework/queries/patrol";
import { getOpponents } from "../framework/queries/players";
import {
  Ability,
  PlayerID,
} from "../framework/types";

import {
  ANTI_AIR,
  EPHEMERAL,
  FLYING,
  FRENZY,
  HASTE,
  LONG_RANGE,
  OBLITERATE,
  OVERPOWER,
  RESIST,
  STEALTH,
  event,
} from "./helpers";

const unitBoostCosts: Record<string, number | undefined> = {
  Marauder: 3,
};

export const getUnitBoostCost = (
  name: string,
): number | null => {
  return unitBoostCosts[name] ?? null;
};

export const getUnitAbilities = (
  name: string,
): Array<Ability> => {
  switch (name) {
  case "Bloodrage Ogre":
    return [
      event("END_OF_TURN", ($, I) => {
        if ($.activePlayer === I.controller) {
          return;
        }

        if (!I.arrivalFatigue && !I.attackedThisTurn) {
          returnInstanceToHand($, I);
        }
      }),
    ];
  case "Calypso Vystari":
    // TODO exhaust this, then IF you played a spell this turn, sideline a patroller
    return [];
  case "Captured Bugblatter":
    return [
      event("INSTANCE_DIES", ($, I) => {
        if (!isUnit(lookupCard(I.card))) {
          return;
        }

        const opponents = getOpponents($, I.controller);
        let pid: PlayerID;

        if ($.activePlayer === I.controller) {
          if (opponents.length === 0) {
            return;
          }

          // TODO in 2v2, each team has only one base (fwiw), so this should never be a decision
          if (opponents.length > 1) {
            // TODO create blocking prompt to choose opponent
            return;
          }

          pid = opponents[0];
        } else if (opponents.includes($.activePlayer)) {
          pid = $.activePlayer;
        } else {
          return;
        }

        const base = getInstance($, getPlayer($, pid)?.base ?? null);
        if (base != null) {
          dealDamage($, base, 1, I);
        }
      }),
    ];
  case "Chameleon":
    return [ STEALTH ];
  case "Chameleon Lizzo":
    return [
      HASTE,
      STEALTH,
      event("END_OF_TURN", ($, I) => {
        // TODO trigger this on either player's turn for sanity?
        returnInstanceToHand($, I);
      }),
    ];
  case "Crash Bomber":
    return [
      event("THIS_DIES", ($, I) => {
        if ($.activePlayer === I.controller) {
          // TODO deal 1 dmg to a patroller or bldg, might have to choose
        } else {
          const baseID = getPlayer($, $.activePlayer)?.base ?? null;
          const base = getInstance($, baseID);
          if (base != null) {
            dealDamage($, base, 1, I);
          }
        }
      }),
    ];
  case "Crashbarrow":
    return [ HASTE, EPHEMERAL, OVERPOWER ];
  case "Disguised Monkey":
    return [
      HASTE,
      event("THIS_ARRIVES", ($, I) => {
        // TODO give this stealth this turn
      }),
    ];
  case "Gemscout Owl":
    return [
      FLYING,
      RESIST(1),
      event("UPKEEP", ($, I) => {
        const P = getPlayer($, I.controller);
        if (P == null) {
          return;
        }
        giveGold(P, 1);
      }),
    ];
  case "Gunpoint Taxman":
    return [
      ANTI_AIR,
      event("THIS_KILLS_OTHER", ($, I, e) => {
        if (!isPatrolling($, e.instance)) {
          return;
        }

        const thisP = getPlayer($, I.controller);
        const otherP = getPlayer($, e.instance.controller);
        if (thisP == null || otherP == null) {
          return;
        }

        const otherGold = otherP.gold;
        reduceGold(otherP, 1);
        giveGold(thisP, Math.min(otherGold, 1));
      }),
    ];
  case "Mad Man":
    return [ HASTE ];
  case "Marauder":
    return [
      HASTE,
      event("THIS_ARRIVES", ($, I) => {
        // TODO if this was boosted, trash a worker (target a player)
      }),
    ];
  case "Nautical Dog":
    return [ FRENZY(1) ];
  case "Pirate Gunship":
    return [ FLYING, HASTE, LONG_RANGE, RESIST(2), OBLITERATE(2) ];
  case "Shoddy Glider":
    return [ HASTE, EPHEMERAL, FLYING ];
  case "Tyrannosaurus Rex":
    return [
      OVERPOWER,
      RESIST(2),
      event("THIS_ARRIVES", ($, I) => {
        enqueuePrompt($, {
          type: "TREX_ARRIVES",
          instance: I.id,
        });
        // TODO destroy up to 2 units, upgrades, workers in any combination
      }),
    ];
  default:
    throw new Error(`Failed to find abilities for unit "${name}"`);
  }
};
