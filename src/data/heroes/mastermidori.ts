import { HeroBands } from "../../framework/types/data/hero";

export const MasterMidori: HeroBands = {
  topBand: () => {
    return {};
  },
  midBand: () => {
    return {
      continuousModifiers: [
        {
          query: () => {
            return {
              type: "UNIT",
            };
          },
          effect: () => {
            return {
              type: "ATTRIBUTE",
              attribute: "ATTACK",
              amount: 1,
            };
          },
        },
        {
          query: () => {
            return {
              type: "UNIT",
            };
          },
          effect: () => {
            return {
              type: "ATTRIBUTE",
              attribute: "HEALTH",
              amount: 1,
            };
          },
        },
      ],
    };
  },
  maxBand: () => {
    return {
      continuousModifiers: [
        {
          condition: ($, iid) => {
            return $.activePlayer === $.instances[iid]?.owner;
          },
          query: "SELF",
          // effect: ($, I) => {
          effect: () => {
            return {
              type: "TRAIT",
              trait: "FLYING",
            };
          },
        },
      ],
    };
  },
};
