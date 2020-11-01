import { getPatrolSlot, hasEmptyPatrolSlot } from "../framework/accessors";
import { PATROL_SLOTS } from "../framework/constants";
import { GameEngine } from "../framework/engine";
import {
  dealDamage,
  destroy,
  giveGold,
  giveLevels,
  reduceGold,
  removeCardFromHand,
  returnInstanceToHand,
  sideline,
  trash,
} from "../framework/mutators";
import {
  EffectParam,
  EffectParamQuery,
  EffectParamValue,
  InstanceID,
  InstanceParam,
  InstanceState,
  PatrolSlot,
  PatrolSlotParam,
  PlayerID,
  PlayerParam,
  PlayerState,
  ResolvableEffect,
} from "../framework/types";

const GLOBAL_EFFECT_KEYS = [
  "id",
  "sourceCard",
  "sourceInstance",
  "type",
  "params",
];

export const effectParamsAreValid = (
  $: GameEngine,
  effect: ResolvableEffect,
  params: Record<string, string>,
): boolean =>
  validateEffectParams($, effect, params) == null;

export const validateEffectParams = (
  $: GameEngine,
  effect: ResolvableEffect,
  params: Record<string, string>,
): string | null => {
  const effectAsMap = effect as unknown as Record<string, EffectParam>;
  for (const key in effectAsMap) {
    if (Object.prototype.hasOwnProperty.call(effectAsMap, key)) {
      if (GLOBAL_EFFECT_KEYS.includes(key)) {
        continue;
      }

      const fromEffect = effectAsMap[key];
      if (isQueryParam(fromEffect)) {
        // valid if:
        // - the param exists and matches the query
        // - the param doesn't exist and the query has only one option
        const possibleTargets = getPossibleQueryTargets($, fromEffect);
        if (params[key] == null) {
          if (possibleTargets.length !== 1) {
            return `missing required param [${key}]`;
          }
        } else if (!possibleTargets.includes(params[key])) {
          return `invalid param [${key}]`;
        }
      }
    }
  }

  switch (effect.type) {
  case "SHOVE": {
    const I = resolveInstanceParam($, effect, params, "target");
    const slot = resolvePatrolSlotParam(effect, params, "slot");
    const P = $.getPlayer(I?.controller ?? null);
    if (I == null || slot == null || P == null) {
      throw new Error("panic: bad shove didn't fail early validation");
    }
    if (getPatrolSlot($, I) === slot) {
      if (hasEmptyPatrolSlot(P)) {
        return "must shove target to empty slot";
      }
    } else if (P.patrol[slot] != null) {
      return "destination slot is not empty";
    }
    break;
  }
  }

  return null;
};

export const executeEffect = (
  $: GameEngine,
  effect: ResolvableEffect,
  params: Record<string, string>,
): void => {
  switch (effect.type) {
  case "BOUNCE_TO_HAND": {
    const I = resolveInstanceParam($, effect, params, "target");
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
        id: effect.trigger.value,
        // pass effect.params...
      });
    }
    break;
  }
  case "DAMAGE": {
    const I = resolveInstanceParam($, effect, params, "target");
    if (I != null) {
      dealDamage($, I, effect.amount.value, null);
    }
    break;
  }
  case "DESTROY": {
    const I = resolveInstanceParam($, effect, params, "target");
    if (I != null) {
      destroy($, I, $.getInstance(effect.sourceInstance));
    }
    break;
  }
  case "DISCARD": {
    const P = resolvePlayerParam($, effect, params, "player");
    if (P != null) {
      if (effect.amount.value >= P.hand.length) {
        P.discard.push(...P.hand);
        P.hand = [];
      } else {
        for (let i = 0; i < effect.amount.value; i++) {
          const cid = P.hand[$.readRandom(P.hand.length)];
          removeCardFromHand(P, cid);
          P.discard.push(cid);
        }
      }
    }
    break;
  }
  case "DISCARD_SELECTED": {
    const P = resolvePlayerParam($, effect, params, "player");
    if (P != null && P.hand.includes(effect.card.value)) {
      removeCardFromHand(P, effect.card.value);
      P.discard.push(effect.card.value);
    }
    break;
  }
  case "DRAW": {
    const P = resolvePlayerParam($, effect, params, "player");
    if (P != null) {
      for (let i = 0; i < effect.amount.value; i++) {
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
        const cid = P.deck.pop();
        if (cid != null) {
          P.hand.push(cid);
        }
      }
    }
    break;
  }
  case "GIVE_GOLD": {
    const P = resolvePlayerParam($, effect, params, "player");
    if (P != null) {
      giveGold(P, effect.amount.value);
    }
    break;
  }
  case "GIVE_LEVELS": {
    const I = resolveInstanceParam($, effect, params, "target");
    if (I != null) {
      giveLevels($, I, effect.amount.value);
    }
    break;
  }
  case "MODIFY": {
    const I = resolveInstanceParam($, effect, params, "target");
    if (I != null) {
      I.modifiers.push(...effect.modifiers.value);
    }
    break;
  }
  case "SHOVE": {
    const I = resolveInstanceParam($, effect, params, "target");
    const slot = resolvePatrolSlotParam(effect, params, "slot");
    const P = $.getPlayer(I?.controller ?? null);
    if (I != null && slot != null && P != null) {
      sideline($, I);
      P.patrol[slot] = I.id;
      dealDamage($, I, 1, $.getInstance(effect.sourceInstance));
    }
    break;
  }
  case "SIDELINE": {
    const I = resolveInstanceParam($, effect, params, "target");
    if (I != null) {
      sideline($, I);
    }
    break;
  }
  case "STEAL_GOLD": {
    const I = resolveInstanceParam($, effect, params, "target");
    const targetP = $.getPlayer(I?.controller ?? null);
    const activeP = $.getPlayer($.state.activePlayer);
    if (targetP != null && activeP != null && activeP !== targetP) {
      const amount = Math.min(effect.amount.value, targetP.gold);
      reduceGold(targetP, amount);
      giveGold(activeP, amount);
    }
    break;
  }
  case "TAKE_CONTROL": {
    const I = resolveInstanceParam($, effect, params, "target");
    if (I != null) {
      I.controller = $.state.activePlayer;
    }
    break;
  }
  case "TRASH": {
    const I = resolveInstanceParam($, effect, params, "target");
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
  const effectAsMap = effect as unknown as Record<string, EffectParam>;
  for (const key in effectAsMap) {
    if (Object.prototype.hasOwnProperty.call(effectAsMap, key)) {
      if (GLOBAL_EFFECT_KEYS.includes(key)) {
        continue;
      }

      const fromEffect = effectAsMap[key];
      if (isQueryParam(fromEffect)) {
        if (getPossibleQueryTargets($, fromEffect).length === 0) {
          return true;
        }
      } else if (isValueParam(fromEffect)) {
        switch (fromEffect.type) {
        case "INSTANCE":
          if ($.getInstance(fromEffect.value) == null) {
            return true;
          }
          break;
        }
      }
    }
  }

  return false;
};

const resolveInstanceParam = <Key extends string> (
  $: GameEngine,
  effect: Record<Key, InstanceParam>,
  params: Record<Key, InstanceID | null>,
  key: Key,
): InstanceState | null => {
  const fromEffect = effect[key];
  if (isValueParam(fromEffect)) {
    return $.getInstance(fromEffect.value);
  }

  if (params[key] != null) {
    return $.getInstance(params[key]);
  }

  if (isQueryParam(fromEffect) && fromEffect.count == null) {
    return $.findInstance(fromEffect.query);
  }

  return null;
};

const resolvePatrolSlotParam = <Key extends string> (
  effect: Record<Key, PatrolSlotParam>,
  params: Record<Key, string | null>,
  key: Key,
): PatrolSlot | null => {
  const fromEffect = effect[key];
  if (isValueParam(fromEffect)) {
    return fromEffect.value;
  }

  if (params[key] != null) {
    const fromParams = params[key] as PatrolSlot;
    if (PATROL_SLOTS.includes(fromParams)) {
      return fromParams;
    }
  }

  return null;
};

const resolvePlayerParam = <Key extends string> (
  $: GameEngine,
  effect: Record<Key, PlayerParam>,
  params: Record<Key, PlayerID | null>,
  key: Key,
): PlayerState | null => {
  const fromEffect = effect[key];
  if (isValueParam(fromEffect)) {
    return $.getPlayer(fromEffect.value);
  }

  if (params[key] != null) {
    return $.getPlayer(params[key]);
  }

  return null;
};

const getPossibleQueryTargets = (
  $: GameEngine,
  param: EffectParam,
): Array<unknown> => {
  if (!isQueryParam(param)) {
    throw new Error("panic: this isn't a query param");
  }

  switch (param.type) {
  case "INSTANCE": {
    return Array.from(
      $.queryInstances(param.query),
    ).map(I => I.id);
  }
  case "PATROL_SLOT":
    return PATROL_SLOTS;
  case "PLAYER":
    throw new Error("player queries are not yet supported");
  default:
    throw new Error("unrecognized queryable effect param type");
  }
};

const isQueryParam = <QueryT> (
  param: EffectParamQuery<QueryT> | EffectParamValue<unknown>,
): param is EffectParamQuery<QueryT> => {
  return "query" in param;
};

const isValueParam = <ValueT> (
  param: EffectParamValue<ValueT> | EffectParamQuery<unknown>,
): param is EffectParamValue<ValueT> => {
  return "value" in param;
};
