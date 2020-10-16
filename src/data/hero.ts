import { drawCard } from "../framework/actions/hand";
import { giveGold } from "../framework/actions/helpers";
import { enqueuePrompt } from "../framework/prompts";
import { getPlayer } from "../framework/queries/common";
import {
  isScavenger,
  isTechnician,
} from "../framework/queries/patrol";
import { Ability } from "../framework/types";

import {
  HASTE,
  event,
} from "./helpers";

export const getHeroAbilities = (
  name: string,
  index: 0 | 1 | 2,
): Array<Ability> => {
  switch (name) {
  case "Captain Zane":
    switch (index) {
    case 0:
      return [ HASTE ];
    case 1:
      return [
        event("KILLS", ($, I, e) => {
          const P = getPlayer($, I.controller);
          if (P == null) {
            return;
          }

          if (isScavenger($, e.instance)) {
            giveGold(P, 1);
          } else if (isTechnician($, e.instance)) {
            drawCard(P);
          }
        }),
      ];
    case 2:
      return [
        event("MAX_LEVEL", ($, I) => {
          if ($.activePlayer !== I.controller) {
            return;
          }

          enqueuePrompt($, {
            type: "ZANE_MAX_BAND",
          });
        }),
      ];
    default:
      return [];
    }
  default:
    throw new Error(`Failed to find abilities for hero "${name}"`);
  }
};
