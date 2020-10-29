import { GameEngine } from "../framework/engine";
import {
  dealDamage,
  destroy,
  giveGold,
  reduceGold,
  removeCardFromHand,
  returnInstanceToHand,
  sideline,
  trash,
} from "../framework/mutators";
import {
  InstanceID,
  InstanceQuery,
  InstanceState,
  InstanceTarget,
  ResolvableEffect,
} from "../framework/types";

const GLOBAL_EFFECT_KEYS = [
  "id",
  "sourceCard",
  "sourceInstance",
  "type",
];

export const effectParamsAreValid = (
  $: GameEngine,
  effect: ResolvableEffect,
  params: Record<string, string>,
): boolean => {
  const effectAsMap = effect as Record<string, unknown>;
  for (const key in effectAsMap) {
    if (Object.prototype.hasOwnProperty.call(effectAsMap, key)) {
      if (GLOBAL_EFFECT_KEYS.includes(key)) {
        continue;
      }

      const fromEffect = effectAsMap[key];
      if (Array.isArray(fromEffect)) {
        // TODO
        return false;
      } else if (typeof fromEffect === "object" && fromEffect != null) {
        const query = fromEffect as InstanceQuery;

        // valid if:
        // - the param exists and matches the query
        // - the param doesn't exist and the query has only one option
        const possibleTargets = Array.from($.queryInstances(query));
        if (params[key] == null) {
          if (possibleTargets.length !== 1) {
            return false;
          }
        } else {
          const possibleIDs = possibleTargets.map(I => I.id);
          if (!possibleIDs.includes(params[key])) {
            return false;
          }
        }
      }
    }
  }

  return true;
};

export const executeEffect = (
  $: GameEngine,
  effect: ResolvableEffect,
  params: Record<string, string>,
): void => {
  switch (effect.type) {
  case "BOUNCE_TO_HAND": {
    const I = resolveInstanceTarget($, effect, params, "target");
    if (I != null) {
      returnInstanceToHand($, I);
    }
    break;
  }
  case "CUSTOM": {
    const I = $.getInstance(effect.sourceInstance);
    if (I != null) {
      $.fireInstanceTrigger(I, {
        type: "CUSTOM",
        id: effect.trigger,
        // TODO pass effect.targets
      });
    }
    break;
  }
  case "DAMAGE": {
    const I = resolveInstanceTarget($, effect, params, "target");
    if (I != null) {
      dealDamage($, I, effect.amount);
    }
    break;
  }
  case "DESTROY": {
    const I = resolveInstanceTarget($, effect, params, "target");
    if (I != null) {
      destroy($, I);
    }
    break;
  }
  case "DISCARD": {
    const P = $.getPlayer(effect.player);
    if (P != null) {
      if (effect.amount >= P.hand.length) {
        P.discard.push(...P.hand);
        P.hand = [];
      } else {
        for (let i = 0; i < effect.amount; i++) {
          const cid = P.hand[$.readRandom(P.hand.length)];
          removeCardFromHand(P, cid);
          P.discard.push(cid);
        }
      }
    }
    break;
  }
  case "DRAW": {
    const P = $.getPlayer(effect.player);
    if (P != null) {
      for (let i = 0; i < effect.amount; i++) {
        if (P.deck.length === 0) {
          if ($.state.turnPhase === "MAIN"
            && $.state.activePlayer === P.id
            && P.hasShuffledThisTurn) {
            break;
          }
          P.hasShuffledThisTurn = true;
          P.deck = P.discard;
          P.discard = [];
          $.shuffleArray(P.deck);
        }
      }
      const cid = P.deck.pop();
      if (cid != null) {
        P.hand.push(cid);
      }
    }
    break;
  }
  case "GIVE_GOLD": {
    const P = $.getPlayer(effect.player);
    if (P != null) {
      giveGold(P, effect.amount);
    }
    break;
  }
  case "MODIFY": {
    const I = resolveInstanceTarget($, effect, params, "target");
    if (I != null) {
      I.modifiers.push(...effect.modifiers);
    }
    break;
  }
  case "SHOVE": {
    const I = resolveInstanceTarget($, effect, params, "target");
    // TODO resolve dest slot
    if (I != null) {
      sideline($, I);
      // TODO move to new slot
    }
    break;
  }
  case "SIDELINE": {
    const I = resolveInstanceTarget($, effect, params, "target");
    if (I != null) {
      sideline($, I);
    }
    break;
  }
  case "STEAL_GOLD": {
    const I = resolveInstanceTarget($, effect, params, "target");
    const targetP = $.getPlayer(I?.controller ?? null);
    const activeP = $.getPlayer($.state.activePlayer);
    if (targetP != null && activeP != null && activeP !== targetP) {
      const amount = Math.min(effect.amount, targetP.gold);
      reduceGold(targetP, amount);
      giveGold(activeP, amount);
    }
    break;
  }
  case "TAKE_CONTROL": {
    const I = resolveInstanceTarget($, effect, params, "target");
    if (I != null) {
      I.controller = $.state.activePlayer;
    }
    break;
  }
  case "TRASH": {
    const I = resolveInstanceTarget($, effect, params, "target");
    if (I != null) {
      trash($, I);
    }
    break;
  }
  default:
    throw new Error(`unrecognized effect type "${effect.type}"`);
  }
};

export const shouldCancelEffect = (
  $: GameEngine,
  effect: ResolvableEffect,
): boolean => {
  // Cancel if some target is no longer possible
  const effectAsMap = effect as Record<string, unknown>;
  for (const key in effectAsMap) {
    if (Object.prototype.hasOwnProperty.call(effectAsMap, key)) {
      if (GLOBAL_EFFECT_KEYS.includes(key)) {
        continue;
      }

      const fromEffect = effectAsMap[key];
      if (typeof fromEffect === "object" && fromEffect != null) {
        const query = fromEffect as InstanceQuery;
        if ($.findInstance(query) == null) {
          return true;
        }
      } else if (typeof fromEffect === "string") {
        const iid = fromEffect as string;
        if ($.getInstance(iid) == null) {
          return true;
        }
      }
    }
  }

  // TODO we might need to cancel certain types of effects under other situtations,
  // such as if the source no longer exists

  return false;
};

const resolveInstanceTarget = <Key extends string>(
  $: GameEngine,
  effect: Record<Key, InstanceTarget>,
  params: Record<Key, InstanceID | null>,
  key: Key,
): InstanceState | null => {
  const fromEffect = effect[key];
  if (typeof fromEffect === "string") {
    return $.getInstance(fromEffect);
  }

  if (params[key] != null) {
    return $.getInstance(params[key]);
  }

  return $.findInstance(
    // NOTE this cast is necessary because TS sucks
    fromEffect as Exclude<typeof fromEffect, string>,
  );
};
