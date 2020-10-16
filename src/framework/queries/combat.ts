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
import { getOpponents, hasDetection } from "./players";

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
    const isFlying = hasSimpleKeyword($, attackerI, "FLYING");
    const hasStealth = hasSimpleKeyword($, attackerI, "STEALTH");
    const canAttackAir =
      isFlying || hasSimpleKeyword($, attackerI, "ANTI-AIR");

    for (const pid of getOpponents($, attackerI.controller)) {
      const P = getPlayer($, pid);
      if (P == null) {
        continue;
      }

      const unstoppable = hasStealth && !hasDetection($, P.id);

      // If we're blocked by a squad leader, we can't attack anything else
      if (canAttackInstance($, P.patrol.squadLeader, canAttackAir)) {
        targets.push(P.patrol.squadLeader);
        if (!unstoppable
          && blocksAttackers($, P.patrol.squadLeader, isFlying)) {
          continue;
        }
      }

      // If we're blocked by other patrollers, we can't attack anything else
      let foundPatroller = false;
      for (const patroller of [
        P.patrol.elite,
        P.patrol.scavenger,
        P.patrol.technician,
        P.patrol.lookout,
      ]) {
        if (canAttackInstance($, patroller, canAttackAir)) {
          targets.push(patroller);
          if (!unstoppable && blocksAttackers($, patroller, isFlying)) {
            foundPatroller = true;
          }
        }
      }
      if (foundPatroller) {
        continue;
      }

      targets.push(...queryInstances($, {
        patrolling: false,
        player: pid,
        type: [ "BUILDING", "HERO", "UNIT" ],
      }).filter(iid => canAttackInstance($, iid, canAttackAir)));
    }
  }

  return targets;
};

const blocksAttackers = (
  $: GameState,
  iid: InstanceID,
  attackerHasFlying: boolean,
): boolean => {
  const I = getInstance($, iid);
  if (I == null) {
    return false;
  }

  const hasFlying = hasSimpleKeyword($, I, "FLYING");

  if (attackerHasFlying) {
    return hasFlying || hasSimpleKeyword($, I, "ANTI-AIR");
  }

  return !hasFlying;
};

const canAttackInstance = (
  $: GameState,
  iid: InstanceID | null,
  canAttackAir: boolean,
): iid is InstanceID => {
  const I = getInstance($, iid);
  if (I == null) {
    return false;
  }
  return canAttackAir || !hasSimpleKeyword($, I, "FLYING");
};
