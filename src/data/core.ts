import { BuildingCard, Card } from "../framework/types";

import {
  constantParam,
  defaultProperties,
  trigger,
  valueParam,
} from "./helpers";

export const BASE_CARD: BuildingCard = {
  id: "Base",
  type: "BUILDING",
  color: "NEUTRAL",
  spec: null,
  tech: 0,
  cost: 0,
  boostCost: null,
  baseComponent: true,
  tags: [],
  ...defaultProperties(),
  attributes: {
    HEALTH: 20,
  },
  triggeredAbilities: [
    trigger("THIS_DIES", $ => {
      $.state.turnPhase = "GAME_OVER";
      return [];
    }),
  ],
};

const techBuildingCommon = {
  type: "BUILDING" as const,
  color: "NEUTRAL" as const,
  spec: null,
  boostCost: null,
  tags: [],
  baseComponent: true,
  ...defaultProperties(),
  attributes: {
    HEALTH: 5,
  },
  triggeredAbilities: [
    trigger("THIS_DIES", ($, I) => {
      const base = $.getPlayer(I.controller)?.base;
      if (base == null) {
        return [];
      }
      return [
        {
          type: "DAMAGE",
          sourceCard: I.card,
          sourceInstance: I.id,
          target: valueParam("INSTANCE", base),
          amount: constantParam(2),
        },
      ];
    }),
  ],
};

export const TECH_BUILDING_CARDS: Array<BuildingCard & {
  workerRequirement: number,
}> = [
  {
    ...techBuildingCommon,
    id: "Tech I Building",
    cost: 1,
    workerRequirement: 6,
    tech: 1,
  },
  {
    ...techBuildingCommon,
    id: "Tech II Building",
    cost: 4,
    workerRequirement: 8,
    tech: 2,
  },
  {
    ...techBuildingCommon,
    id: "Tech III Building",
    cost: 5,
    workerRequirement: 10,
    tech: 3,
  },
];

export const CORE_CARDS: Array<Card> = [
  BASE_CARD,
  ...TECH_BUILDING_CARDS,
];
