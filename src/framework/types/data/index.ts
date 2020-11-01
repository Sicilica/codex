import {
  AbilityFnID,
  CardID,
} from "../serializable";

import { Card } from "./card";
import { AbilityFn } from "./fn";

export * from "./card";
export * from "./fn";

export interface DataSource {
  allCards: () => Iterable<Card>;
  lookupAbilityFn: (aid: AbilityFnID) => AbilityFn<unknown>;
  lookupCard: (cid: CardID) => Card;
}
