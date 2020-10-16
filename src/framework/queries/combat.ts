import { lookupCard } from "../../data";

import {
  GameState,
  InstanceID,
} from "../types";

import { hasSimpleKeyword } from "./abilities";
import {
  getInstance,
  getPlayer,
  isHero,
  isUnit,
  queryInstances,
} from "./common";
import { getOpponents } from "./players";

export const canAttack = (
  $: GameState,
  iid: InstanceID,
): boolean => {
  const I = getInstance($, iid);
  if (I == null) {
    return false;
  }
  const card = lookupCard(I.card);

  // If this isn't a unit or hero, it can't attack.
  if (!isHero(card) && !isUnit(card)) {
    return false;
  }

  if (I.readyState !== "READY") {
    return false;
  }

  if (I.arrivalFatigue && !hasSimpleKeyword($, I, "HASTE")) {
    return false;
  }

  return true;
};

export const canPatrol = (
  $: GameState,
  iid: InstanceID,
): boolean => {
  const I = getInstance($, iid);
  if (I == null) {
    return false;
  }
  const card = lookupCard(I.card);

  if (!isHero(card) && !isUnit(card)) {
    return false;
  }

  if (I.readyState !== "READY") {
    return false;
  }

  return true;
};

export const getPossibleAttackTargets = (
  $: GameState,
  attackerIID: InstanceID,
): Array<InstanceID> => {
  const targets: Array<InstanceID> = [];

  const attackerI = getInstance($, attackerIID);
  if (attackerI != null) {
    for (const pid of getOpponents($, attackerI.controller)) {
      const P = getPlayer($, pid);
      if (P == null) {
        continue;
      }

      // If there's a squad leader, we can't attack anything else
      if (P.patrol.squadLeader != null) {
        targets.push(P.patrol.squadLeader);
        continue;
      }

      // If there are other patrollers, we can't attack anything else
      let foundPatroller = false;
      for (const defenderIID of [
        P.patrol.elite,
        P.patrol.scavenger,
        P.patrol.technician,
        P.patrol.lookout,
      ]) {
        if (defenderIID != null) {
          targets.push(defenderIID);
          foundPatroller = true;
        }
      }
      if (foundPatroller) {
        continue;
      }

      return queryInstances($, {
        player: pid,
        type: [ "BUILDING", "HERO", "UNIT" ],
      });
    }
  }

  return targets;
};
