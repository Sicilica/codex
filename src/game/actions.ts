import { TECH_BUILDING_CARDS } from "../data/core";

import {
  getActivatedAbility,
  getTech,
  hasTrait,
  isMaxLevel,
  isSpell,
} from "../framework/accessors";
import { PATROL_SLOTS } from "../framework/constants";
import { GameEngine } from "../framework/engine";
import {
  createInstance,
  exhaust,
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
  effectParamsAreValid,
  executeEffect,
} from "./effects";
import {
  checkCanExhaust,
  checkHasControl,
  checkReady,
  checkUnitOrHero,
  requireActivePlayer,
  requireCardInHand,
  requireGold,
  requireInstance,
  requireMainPhase,
  requireUsableTechBuilding,
} from "./helpers";
import {
  gotoDrawPhase, gotoReadyPhase,
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
  case "PLAY_CARD":
    playCard($, action.card, action.boost);
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
    case "SACRIFICE_THIS":
      $.queueEffect({
        type: "DESTROY",
        sourceCard: I.card,
        sourceInstance: I.id,
        target: I.id,
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
  checkUnitOrHero($, attacker);

  // TODO make sure the attack is valid (and maybe consume detector)

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

const playCard = (
  $: GameEngine,
  cid: CardID,
  boost: boolean,
): void => {
  requireMainPhase($);

  const P = requireActivePlayer($);

  requireCardInHand(P, cid);

  const card = $.data.lookupCard(cid);

  const tech = getTech(card);
  if (tech != null) {
    if (tech > 0) {
      requireUsableTechBuilding($, P, tech);
    }

    if (tech > 1) {
      if (P.mainSpec !== card.spec && P.techLabSpec !== card.spec) {
        throw new Error("this spec is inaccessible");
      }
    }
  }

  let cost: number;
  if (boost) {
    if (card.boostCost == null) {
      throw new Error("card is not boostable");
    }
    cost = card.boostCost;
  } else {
    cost = card.cost;
  }

  if (isSpell(card)) {
    if (card.spec == null) {
      // For basic spells, must have any hero, but have to pay extra for
      // cross-color
      const freeHero = $.findInstance({
        color: card.color,
        player: P.id,
        type: "HERO",
      });
      if (freeHero == null) {
        const crossHero = $.findInstance({
          player: P.id,
          type: "HERO",
        });
        if (crossHero == null) {
          throw new Error("cannot cast without a hero");
        }
        cost += 1;
      }
    } else {
      // For non-basic spells, must have the correct hero, and must be max-band
      // for ultimate spells
      const hero = $.findInstance({
        player: P.id,
        spec: card.spec,
        type: "HERO",
      });
      if (hero == null) {
        throw new Error("cannot cast without the associated hero");
      }

      if (card.ultimate) {
        if (!isMaxLevel($, hero) || hero.level !== hero.levelAtTurnStart) {
          throw new Error("hero must have started the turn at max band");
        }
      }
    }
  }

  requireGold(P, cost);

  reduceGold(P, cost);
  removeCardFromHand(P, cid);

  // TODO enqueue card effects
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

  if (!effectParamsAreValid($, effect, params)) {
    throw new Error("invalid params for effect");
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
  if (P.canSkipTech && cids.length !== 2) {
    throw new Error("teching is not optional until you attain 10 workers");
  }

  const cidsAsMap: Record<CardID, number> = {};
  for (const cid of cids) {
    cidsAsMap[cid] = (cidsAsMap[cid] ?? 0) + 1;
  }

  for (const cid in cidsAsMap) {
    if ((P.codex[cid] ?? 0) < cidsAsMap[cid]) {
      throw new Error("card does not exist in codex");
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
