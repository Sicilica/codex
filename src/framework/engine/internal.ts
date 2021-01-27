import {
  getTech,
  hasTag,
  hasTrait,
  isMaxLevel,
  isPatrolling,
} from "../accessors";
import { GameEngine } from "./engine";
import {
  InstanceQuery,
  InstanceState,
  OrQuery,
} from "../types";

export function *queryInstances(
  $: GameEngine,
  instances: Iterable<InstanceState>,
  query: InstanceQuery,
): Iterable<InstanceState> {
  const options = isOR(query) ? query.OR : [ query ];
  for (const I of instances) {
    if (options.some(q => {
      const C = $.data.lookupCard(I.card);

      if (q.card != null && !matches(C.id, q.card)) {
        return false;
      }

      if (q.color != null && !matches(C.color, q.color)) {
        return false;
      }

      if (q.hasPlusRune != null) {
        const hasPlusRune = I.plusMinusRunes > 0;
        if (hasPlusRune !== q.hasPlusRune) {
          return false;
        }
      }

      if (q.isMaxLevel != null) {
        if (isMaxLevel($, I) !== q.isMaxLevel) {
          return false;
        }
      }

      if (q.patrolling != null) {
        const patrolling = isPatrolling($.state, I);
        if (patrolling !== q.patrolling) {
          return false;
        }
      }

      if (q.player != null && !matches(I.controller, q.player)) {
        return false;
      }

      if (q.spec != null && !matches(C.spec, q.spec)) {
        return false;
      }

      if (q.tags != null) {
        if (q.tags.some(tag => !hasTag($, I, tag))) {
          return false;
        }
      }

      if (q.tech != null && !matches(getTech(C), q.tech)) {
        return false;
      }

      if (q.traits != null) {
        if (q.traits.some(trait => !hasTrait($, I, trait))) {
          return false;
        }
      }

      if (q.type != null && !matches(C.type, q.type)) {
        return false;
      }

      return true;
    })) {
      yield I;
    }
  }
}

const isOR = <T>(
  query: T | OrQuery<T>,
): query is OrQuery<T> =>
    (query as OrQuery<T>).OR != null;

const matches = <T extends boolean | number | string>(
  val: T | null,
  cond: T | Array<T>,
): boolean => {
  if (Array.isArray(cond)) {
    return cond.some(c => val === c);
  }
  return val === cond;
};
