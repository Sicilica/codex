import { GameEngine } from "../../engine";

import {
  InstanceState,
  PlayerState,
  ResolvableEffect,
  TriggerEvent,
} from "../serializable";

export type AbilityFn<EventT> = Fn<InstanceState, EventT>;

export type ActivatedAbilityFn = AbilityFn<Record<never, never>>;

export type InstantSpellFn = Fn<PlayerState, void>;

export type TriggeredAbilityFn<EventT = TriggerEvent> = AbilityFn<EventT>;

type Fn<ReceiverT, EventT> = (
  $: GameEngine,
  receiver: ReceiverT,
  event: EventT,
) => Array<ResolvableEffect>;
