import { CardID } from "../serializable";

import { Card } from "./card";

export * from "./card";

export interface DataSource {
  lookupCard: (cid: CardID) => Card;
}
