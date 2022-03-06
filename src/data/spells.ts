import {
  AttachmentSpellCard,
  InstanceCard,
  InstantSpellCard,
  OngoingSpellCard,
} from "../framework/types";

import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import { BASE_CARD } from "./core";
import {
  constantModifiers,
  constantParam,
  effectBase,
  inheritParam,
  queryParam,
  trigger,
  valueParam,
} from "./helpers";

const spellBoostCosts: Record<string, number | undefined> = {
  // such empty
};

export const getSpellBoostCost = (
  name: string,
): number | null => {
  return spellBoostCosts[name] ?? null;
};

export const getSpellDetails = (
  id: string,
): SpellDetails<AttachmentSpellCard>
  | SpellDetails<InstantSpellCard>
  | SpellDetails<OngoingSpellCard> => {
  switch (id) {
  case "Charge":
    return instantSpell({
      effect: (_, P) => [
        {
          ...effectBase(id, null, "MODIFY"),
          target: queryParam("INSTANCE", {
            player: P.id,
            type: "UNIT",
          }),
          modifiers: constantModifiers([
            {
              expiration: "END_OF_TURN",
              sourceCard: id,
              effect: {
                type: "ATTRIBUTE",
                attribute: "ATTACK",
                amount: 1,
              },
            },
            {
              expiration: "END_OF_TURN",
              sourceCard: id,
              effect: {
                type: "TRAIT",
                trait: "HASTE",
              },
            },
          ]),
        },
      ],
    });
  case "Forest's Favor":
    return instantSpell({
      effect: (_, P) => [
        {
          ...effectBase(id, null, "GIVE_PLUS_MINUS_RUNES"),
          target: queryParam(
            "INSTANCE",
            {
              hasPlusRune: false,
              player: P.id,
              type: [
                "HERO",
                "UNIT",
              ],
            },
          ),
          amount: constantParam(1),
        },
      ],
    });
  case "Pillage":
    return instantSpell({
      effect: ($, P) => {
        const hasPirate = $.findInstance({
          player: P.id,
          tags: [ "PIRATE" ],
        }) != null;

        return [
          {
            ...effectBase(id, null, "DAMAGE"),
            target: queryParam("INSTANCE", {
              card: BASE_CARD.id,
            }),
            amount: constantParam(hasPirate ? 2 : 1),
            chainedEffects: [
              {
                type: "STEAL_GOLD",
                player: inheritParam("PLAYER", "target", "GET_CONTROLLER"),
                amount: constantParam(hasPirate ? 2 : 1),
              },
            ],
          },
        ];
      },
    });
  case "Rampant Growth":
    return instantSpell({
      effect: () => [
        {
          ...effectBase(id, null, "MODIFY"),
          target: queryParam("INSTANCE", {
            type: [ "HERO", "UNIT" ],
          }),
          modifiers: constantModifiers([
            {
              sourceCard: id,
              effect: {
                type: "ATTRIBUTE",
                attribute: "ATTACK",
                amount: 2,
              },
              expiration: "END_OF_TURN",
            },
            {
              sourceCard: id,
              effect: {
                type: "ATTRIBUTE",
                attribute: "ARMOR",
                amount: 2,
              },
              expiration: "END_OF_TURN",
            },
          ]),
        },
      ],
    });
  case "Scorch":
    return instantSpell({
      effect: () => [
        {
          ...effectBase(id, null, "DAMAGE"),
          target: queryParam("INSTANCE", {
            OR: [
              { patrolling: true },
              { type: "BUILDING" },
            ],
          }),
          amount: constantParam(2),
        },
      ],
    });
  case "Spirit of the Panda":
    return attachmentSpell({
      query: {
        type: "UNIT",
      },
      attributes: {
        ATTACK: 2,
        HEALING: 1,
        HEALTH: 2,
      },
      triggeredAbilities: [
        trigger("THIS_ATTACKS", (_, I) => [
          {
            type: "GIVE_GOLD",
            sourceCard: id,
            sourceInstance: I.id,
            player: valueParam("PLAYER", I.controller),
            amount: constantParam(1),
          },
        ]),
      ],
    });
  case "War Drums":
    return ongoingSpell({
      continuousModifiers: [
        {
          query: () => {
            return {
              type: "UNIT",
            };
          },
          effect: ($, I) => {
            const numUnits = Array.from($.queryInstances({
              player: I.controller,
              type: "UNIT",
            })).length;
            return {
              type: "ATTRIBUTE",
              attribute: "ATTACK",
              amount: numUnits,
            };
          },
        },
      ],
    });
  default:
    if (REQUIRE_ALL_CARD_PROPERTIES) {
      throw new Error(`Failed to find details for spell "${id}"`);
    }
    return instantSpell({
      effect: () => [],
    });
  }
};

type SpellDetails<T> = Pick<T, Exclude<keyof T,
  "id" | "color" | "spec" | "cost" | "boostCost" | "tags" | "ultimate">>;

const attachmentSpell = (
  details: Partial<InstanceCard> & Pick<AttachmentSpellCard, "query">,
): SpellDetails<AttachmentSpellCard> => ({
  type: "ATTACHMENT_SPELL",
  activatedAbilities: [],
  attributes: {},
  continuousModifiers: [],
  traits: [],
  triggeredAbilities: [],
  ...details,
});

const instantSpell = (
  details: Pick<InstantSpellCard, "effect">,
): SpellDetails<InstantSpellCard> => ({
  type: "INSTANT_SPELL",
  ...details,
});

const ongoingSpell = (
  details: Partial<InstanceCard>,
): SpellDetails<OngoingSpellCard> => ({
  type: "ONGOING_SPELL",
  activatedAbilities: [],
  attributes: {},
  continuousModifiers: [],
  traits: [],
  triggeredAbilities: [],
  ...details,
});
