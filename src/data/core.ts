import { BuildingCard, Card } from "../framework/types";

export const BASE_CARD: BuildingCard = {
  type: "BUILDING",
  name: "Base",
  health: 20,
  legendary: false,
  color: "NEUTRAL",
  spec: null,
  tech: 0,
  abilities: [
    // Dies: lose game
    "TODO",
  ],
  tags: [],
  cost: 0,
  boostCost: null,
  baseComponent: true,
};

const techBuildingCommon = {
  type: "BUILDING" as const,
  health: 5,
  legendary: false,
  color: "NEUTRAL" as const,
  spec: null,
  abilities: [
    // Dies: 2 damage to base
    "TODO" as const,
  ],
  tags: [],
  boostCost: null,
  baseComponent: true,
};

export const TECH_BUILDING_CARDS: Array<BuildingCard & {
  workerRequirement: number,
}> = [
  {
    ...techBuildingCommon,
    name: "Tech I Building",
    cost: 1,
    workerRequirement: 6,
    tech: 1,
  },
  {
    ...techBuildingCommon,
    name: "Tech II Building",
    cost: 4,
    workerRequirement: 8,
    tech: 2,
  },
  {
    ...techBuildingCommon,
    name: "Tech III Building",
    cost: 5,
    workerRequirement: 10,
    tech: 3,
  },
];

export const CORE_CARDS: Record<string, Card> = {
  $BASE: BASE_CARD,
  $TECH1: TECH_BUILDING_CARDS[0],
  $TECH2: TECH_BUILDING_CARDS[1],
  $TECH3: TECH_BUILDING_CARDS[2],
};
