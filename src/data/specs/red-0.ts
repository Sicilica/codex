import { InstanceCard, ResolvableEffect } from "../../framework/types";
import {
  active,
  constantModifiers,
  constantParam,
  effectBase,
  queryParam,
  trigger,
  valueParam,
} from "../helpers";

export const RedTechZero: {
  [key: string]: (id: string) => Partial<InstanceCard>
} = {
  Bloodburn: (id: string) => {
    let aid = 1;
    return {
      activatedAbilities: [
        active(id, aid++, [
          { type: "EXHAUST_THIS" },
          { type: "CUSTOM_RUNES", rune: "BLOOD", amount: 2 },
        ], (_, I) => [
          {
            ...effectBase(id, I, "DAMAGE"),
            target: queryParam("INSTANCE", {
              type: [ "BUILDING", "UNIT" ],
            }),
            amount: constantParam(1),
          },
        ]),
      ],
      triggeredAbilities: [
        trigger("INSTANCE_DIES", ($, I, e) => {
          const targetCard = $.data.lookupCard(e.instance.card);
          if (targetCard.type === "UNIT") {
            I.customRunes.BLOOD = Math.min((I.customRunes.BLOOD ?? 0) + 1, 4);
          }
          return [];
        }),
      ],
    };
  },
  BloodrageOgre: (id: string) => {
    return {
      triggeredAbilities: [
        trigger("END_OF_TURN", ($, I) => {
          if ($.state.activePlayer !== I.controller) {
            return [];
          }
          if (I._arrivalFatigue) {
            return [];
          }
          if (I.memory.attackedThisTurn === "true") {
            return [];
          }
          return [
            {
              ...effectBase(id, I, "BOUNCE_TO_HAND"),
              target: valueParam("INSTANCE", I.id),
            },
          ];
        }),
        trigger("THIS_ATTACKS", (_, I) => {
          I.memory.attackedThisTurn = "true";
          return [];
        }),
        trigger("UPKEEP", (_, I) => {
          I.memory.attackedThisTurn = "false";
          return [];
        }),
      ],
    };
  },
  Bombaster: (id: string) => {
    let aid = 1;
    return {
      activatedAbilities: [
        active(id, aid++, [
          { type: "GOLD", amount: 1 },
          { type: "SACRIFICE_THIS" },
        ], (_, I) => [
          {
            ...effectBase(id, I, "DAMAGE"),
            target: queryParam("INSTANCE", {
              patrolling: true,
              type: "UNIT",
            }),
            amount: constantParam(2),
          },
        ]),
      ],
    };
  },
  CarelessMusketeer: (id: string) => {
    let aid = 1;
    return {
      activatedAbilities: [
        active(id, aid++, [ { type: "EXHAUST_THIS" } ], ($, I) => {
          const effects: Array<ResolvableEffect> = [
            {
              ...effectBase(id, I, "DAMAGE"),
              target: queryParam("INSTANCE", {
                type: [ "BUILDING", "UNIT" ],
              }),
              amount: constantParam(1),
            },
          ];

          const base = $.getPlayer(I.controller)?.base;
          if (base != null) {
            effects.push({
              ...effectBase(id, I, "DAMAGE"),
              target: valueParam("INSTANCE", base),
              amount: constantParam(1),
            });
          }

          return effects;
        }),
      ],
    };
  },
  MadMan: () => {
    return {
      traits: [ "HASTE" ],
    };
  },
  MakeshiftRambaster: (id: string) => {
    return {
      traits: [ "HASTE", "NO_PATROL" ],
      triggeredAbilities: [
        trigger("THIS_ATTACKS", ($, I, e) => {
          const targetCard = $.data.lookupCard(e.instance.card);
          if (targetCard.type !== "BUILDING") {
            return [];
          }
          return [
            {
              ...effectBase(id, I, "MODIFY"),
              target: valueParam("INSTANCE", I.id),
              modifiers: constantModifiers([
                {
                  expiration: "END_OF_COMBAT",
                  sourceCard: I.card,
                  effect: {
                    type: "ATTRIBUTE",
                    attribute: "ATTACK",
                    amount: 2,
                  },
                },
              ]),
            },
          ];
        }),
      ],
    };
  },
  NauticalDog: () => {
    return {
      attributes: { FRENZY: 1 },
    };
  },
};
