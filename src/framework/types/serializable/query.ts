import { SingleOrArray } from "../helpers";

import { CardID, CardType } from "./card";
import { InstanceType } from "./instance";
import { PlayerID } from "./player";
import {
  Spec,
  Tag,
  TechLevel,
  Trait,
} from "./property";

export interface CardQuery {
  source: "HAND";
  tech?: SingleOrArray<TechLevel>;
  type?: SingleOrArray<CardType>;
}

export interface InstanceQuery {
  card?: SingleOrArray<CardID>;
  hasPlusRune?: boolean;
  patrolling?: boolean;
  player?: SingleOrArray<PlayerID>;
  spec?: SingleOrArray<Spec>;
  tags?: Array<Tag>
  tech?: SingleOrArray<TechLevel>;
  traits?: Array<Trait>;
  type?: SingleOrArray<InstanceType>;
}
