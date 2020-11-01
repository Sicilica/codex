import { SingleOrArray } from "../helpers";

import { CardID, CardType } from "./card";
import { InstanceType } from "./instance";
import { PlayerID } from "./player";
import {
  Color,
  Spec,
  Tag,
  TechLevel,
  Trait,
} from "./property";

export type CardQuery = MaybeOrQuery<{
  source: "HAND";
  tech?: SingleOrArray<TechLevel>;
  type?: SingleOrArray<CardType>;
}>;

export type InstanceQuery = MaybeOrQuery<SimpleInstanceQuery>;

export interface OrQuery<T> {
  OR: Array<T>;
}

export interface SimpleInstanceQuery {
  card?: SingleOrArray<CardID>;
  color?: SingleOrArray<Color>;
  hasPlusRune?: boolean;
  isMaxLevel?: boolean;
  patrolling?: boolean;
  player?: SingleOrArray<PlayerID>;
  spec?: SingleOrArray<Spec>;
  tags?: Array<Tag>;
  tech?: SingleOrArray<TechLevel>;
  traits?: Array<Trait>;
  type?: SingleOrArray<InstanceType>;
}

type MaybeOrQuery<T> = T | OrQuery<T>;
