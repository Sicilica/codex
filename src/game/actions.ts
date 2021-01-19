import { TECH_BUILDING_CARDS } from "../data/core";

import {
  getActivatedAbility,
  getMaxLevel,
  hasTrait,
} from "../framework/accessors";
import { PATROL_SLOTS } from "../framework/constants";
import { GameEngine } from "../framework/engine";
import {
  createInstance,
  exhaust,
  giveLevels,
  reduceGold,
  removeCardFromHand,
} from "../framework/mutators";
import {
  Action,
  ActivatedAbilityID,
  CardID,
  InstanceID,
  PatrolZone,
  ResolvableEffectID,
  Spec,
} from "../framework/types";

import {
  executeEffect,
  validateEffectParams,
} from "./effects";
import {
  checkCanAttack,
  checkCanExhaust,
  checkHasControl,
  checkReady,
  checkUnitOrHero,
  requireActivePlayer,
  requireCardInHand,
  requireCardPlayableAndGetCost,
  requireGold,
  requireHeroPlayable,
  requireInstance,
  requireMainPhase,
  requireUsableTechBuilding,
} from "./helpers";
import {
  gotoDrawPhase,
  gotoReadyPhase,
} from "./turn_phases";

export const performAction = (
  $: GameEngine,
  action: Action,
): void => {
  switch (action.type) {
  case "ACTIVATE_ABILITY":
    activateAbility($, action.instance, action.ability);
    break;
  case "ATTACK":
    attack($, action.attacker, action.defender);
    break;
  case "BUY_WORKER":
    buyWorker($, action.card);
    break;
  case "END_TURN":
    endTurn($, action.patrol);
    break;
  case "LEVEL_UP":
    levelUp($, action.hero, action.amount);
    break;
  case "PLAY_CARD":
    playCard($, action.card, action.boost);
    break;
  case "PLAY_HERO":
    playHero($, action.hero);
    break;
  case "PURCHASE_TECH_BUILDING":
    purchaseTechBuilding($, action.spec ?? null);
    break;
  case "RESOLVE_EFFECT":
    resolveEffect($, action.effect, action.params);
    break;
  case "TECH":
    tech($, action.cards);
    break;
  default:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error(`unknown action type "${(action as any)?.type}"`);
  }
};

const activateAbility = (
  $: GameEngine,
  iid: InstanceID,
  aid: ActivatedAbilityID,
): void => {
  requireMainPhase($);

  const P = requireActivePlayer($);

  const I = requireInstance($, iid);

  checkHasControl(P, I);

  const ability = getActivatedAbility($, I, aid);
  if (ability == null) {
    throw new Error("ability not found");
  }

  for (const cost of ability.cost) {
    switch (cost.type) {
    case "CUSTOM_RUNES":
      if ((I.customRunes[cost.rune] ?? 0) < cost.amount) {
        throw new Error("insufficient runes");
      }
      break;
    case "EXHAUST_THIS":
      checkCanExhaust($, I);
      break;
    case "GOLD":
      requireGold(P, cost.amount);
      break;
    case "PLUS_MINUS_RUNES":
      // +1/+1 runes
      if (cost.amount > 0) {
        if (I.plusMinusRunes < cost.amount) {
          throw new Error("insufficient runes");
        }
      // -1/-1 runes
      } else if (cost.amount < 0) {
        if (I.plusMinusRunes > cost.amount) {
          throw new Error("insufficient runes");
        }
      }
      break;
    case "SACRIFICE_THIS":
      if (hasTrait($, I, "INDESTRUCTIBLE")) {
        throw new Error("INDESTRUCTIBLE instances cannot be sacrificed");
      }
      break;
    case "TIME_RUNES":
      if (I.timeRunes < cost.amount) {
        throw new Error("insufficient time runes");
      }
      break;
    }
  }

  for (const cost of ability.cost) {
    switch (cost.type) {
    case "CUSTOM_RUNES":
      I.customRunes[cost.rune] -= cost.amount;
      break;
    case "EXHAUST_THIS":
      exhaust(I);
      break;
    case "GOLD":
      reduceGold(P, cost.amount);
      break;
    case "PLUS_MINUS_RUNES":
      I.plusMinusRunes -= cost.amount;
      break;
    case "SACRIFICE_THIS":
      $.queueEffect({
        type: "DESTROY",
        sourceCard: I.card,
        sourceInstance: I.id,
        target: {
          type: "INSTANCE",
          value: I.id,
        },
      });
      break;
    case "TIME_RUNES":
      I.timeRunes -= cost.amount;
      break;
    }
  }

  for (const effect of ability.effect($, I, {})) {
    $.queueEffect(effect);
  }
};

const attack = (
  $: GameEngine,
  atkID: InstanceID,
  defID: InstanceID,
): void => {
  requireMainPhase($);

  const P = requireActivePlayer($);

  const attacker = requireInstance($, atkID);
  const defender = requireInstance($, defID);

  checkHasControl(P, attacker);
  checkCanExhaust($, attacker);
  checkCanAttack($, attacker);

  // make sure the attack is valid (and maybe consume detector)

  $.state.unresolvedCombat = {
    attacker: attacker.id,
    attackerExtraDamage: 0,
    defender: defender.id,
    defenderExtraDamage: 0,
  };

  $.fireInstanceTrigger(attacker, {
    type: "THIS_ATTACKS",
    instance: defender,
  });
};

const buyWorker = (
  $: GameEngine,
  cid: CardID,
): void => {
  requireMainPhase($);

  const P = requireActivePlayer($);

  requireGold(P, 1);
  requireCardInHand(P, cid);

  if (P.hasBuiltWorkerThisTurn) {
    throw new Error("only one worker may be built per turn");
  }

  reduceGold(P, 1);
  removeCardFromHand(P, cid);
  P.workers++;
  P.hasBuiltWorkerThisTurn = true;

  if (P.workers >= 10) {
    P.canSkipTech = true;
  }
};

const endTurn = (
  $: GameEngine,
  patrol: PatrolZone,
): void => {
  requireMainPhase($);

  const P = requireActivePlayer($);

  for (const slot of PATROL_SLOTS) {
    if (patrol[slot] == null) {
      continue;
    }

    const I = requireInstance($, patrol[slot]);

    for (const otherSlot of PATROL_SLOTS) {
      if (patrol[otherSlot] === I.id) {
        throw new Error("cannot patrol in multiple slots");
      }
    }

    checkHasControl(P, I);
    checkReady(I);
    checkUnitOrHero($, I);

    if (hasTrait($, I, "NO_PATROL")) {
      throw new Error("instance has NO_PATROL");
    }
  }

  for (const slot of PATROL_SLOTS) {
    P.patrol[slot] = patrol[slot];
  }

  gotoDrawPhase($);
};

const levelUp = (
  $: GameEngine,
  iid: InstanceID,
  amount: number,
): void => {
  requireMainPhase($);

  const P = requireActivePlayer($);
  const I = requireInstance($, iid);
  checkHasControl(P, I);

  const availableLevels = getMaxLevel($, I) - I.level;
  if (availableLevels < amount) {
    throw new Error("this would cause the target to exceed max level");
  }

  requireGold(P, amount);

  reduceGold(P, amount);
  giveLevels($, I, amount);
};

const playCard = (
  $: GameEngine,
  cid: CardID,
  boost: boolean,
): void => {
  requireMainPhase($);

  const P = requireActivePlayer($);

  requireCardInHand(P, cid);

  const card = $.data.lookupCard(cid);

  const cost = requireCardPlayableAndGetCost($, P, card, boost);

  reduceGold(P, cost);
  removeCardFromHand(P, cid);

  if (card.type === "INSTANT_SPELL") {
    for (const effect of card.effect($, P)) {
      $.queueEffect(effect);
    }
    P.discard.push(card.id);
  } else if (card.type === "ATTACHMENT_SPELL") {
    throw new Error("attachment spells are not yet supported");
  } else {
    createInstance($, P, card);
  }
};

const playHero = (
  $: GameEngine,
  cid: CardID,
): void => {
  requireMainPhase($);

  const P = requireActivePlayer($);

  const card = $.data.lookupCard(cid);
  if (card.type !== "HERO") {
    throw new Error("must specify a hero card");
  }

  requireHeroPlayable($, P, card);

  requireGold(P, 2);

  reduceGold(P, 2);
  P.heroes[card.id] = "IN_PLAY";
  createInstance($, P, card);
};

const purchaseTechBuilding = (
  $: GameEngine,
  spec: Spec | null,
): void => {
  requireMainPhase($);

  const P = requireActivePlayer($);

  const card = TECH_BUILDING_CARDS[P.purchasedTechBuildings];

  requireGold(P, card.cost);

  if (P.workers < card.workerRequirement) {
    throw new Error("insufficient workers");
  }

  if (card.tech > 1) {
    requireUsableTechBuilding($, P, card.tech - 1);
  }

  if (card.tech === 2) {
    if (spec == null || !P.specs.includes(spec)) {
      throw new Error("invalid or missing spec choice");
    }
  } else if (spec != null) {
    throw new Error("spec should only be specified for tech 2 building");
  }

  reduceGold(P, card.cost);

  P.techBuildings[card.tech - 1] = createInstance($, P, card).id;

  P.purchasedTechBuildings++;

  if (spec != null) {
    P.mainSpec = spec;
  }
};

export const resolveEffect = (
  $: GameEngine,
  eid: ResolvableEffectID,
  params: Record<string, string>,
): void => {
  const indexOfEffect = $.state.unresolvedEffects.findIndex(e => e.id === eid);
  if (indexOfEffect < 0) {
    throw new Error("effect not found");
  }
  const effect = $.state.unresolvedEffects[indexOfEffect];

  const err = validateEffectParams($, effect, params);
  if (err != null) {
    throw new Error(`invalid params for effect: ${err}`);
  }

  $.state.unresolvedEffects.splice(indexOfEffect, 1);

  $.log(effect);

  executeEffect($, effect, params);
};

const tech = (
  $: GameEngine,
  cids: Array<CardID>,
): void => {
  if ($.state.turnPhase !== "TECH") {
    throw new Error("it is not the tech phase");
  }

  const P = requireActivePlayer($);

  if (cids.length > 2) {
    throw new Error("can only tech 2 cards per turn");
  }
  if (cids.length !== 2 && !P.canSkipTech) {
    throw new Error("teching is not optional until you attain 10 workers");
  }

  const cidsAsMap: Record<CardID, number> = {};
  for (const cid of cids) {
    cidsAsMap[cid] = (cidsAsMap[cid] ?? 0) + 1;
  }

  for (const cid in cidsAsMap) {
    if ((P.codex[cid] ?? 0) < cidsAsMap[cid]) {
      throw new Error("card is not in codex");
    }
  }

  for (const cid in cidsAsMap) {
    if (Object.prototype.hasOwnProperty.call(cidsAsMap, cid)) {
      P.codex[cid] = (P.codex[cid] ?? 0) - cidsAsMap[cid];
    }
  }

  P.discard.push(...cids);

  gotoReadyPhase($);
};
