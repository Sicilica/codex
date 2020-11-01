import {
  AttachmentSpellCard,
  InstanceCard,
  InstantSpellCard,
  ModifierGrant,
  OngoingSpellCard,
} from "../framework/types";

import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import { BASE_CARD } from "./core";
import {
  constantParam,
  effectBase,
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
          modifiers: constantParam([
            {
              expiration: "END_OF_TURN",
              sourceCard: id,
              effect: {
                type: "ATTRIBUTE",
                trait: "ATTACK",
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
            // TODO clean this up, make some modifier helpers
          ] as Array<ModifierGrant & { expiration: "END_OF_TURN" }>),
        },
      ],
    });
  case "Pillage":
    return instantSpell({
      // TODO can't use a custom trigger because there's no instance...
      // there may be some way to do this by adding a trigger to the target base...
      // in general it feels like we just need a way to use the same params for multiple effects
      // this shouldn't be hard, just add an optional field for "chained" effects, and a new param source "previous"
      effect: () => [
        {
          ...effectBase(id, null, "PILLAGE"),
          target: queryParam("INSTANCE", {
            card: BASE_CARD.id,
          }),
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
          condition: null,
          query: {
            type: "UNIT",
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
