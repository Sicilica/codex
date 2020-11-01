import { getTriggeredAbilities } from "../accessors";
import {
  Card,
  DataSource,
  GameState,
  InstanceID,
  InstanceQuery,
  InstanceState,
  PlayerID,
  PlayerState,
  ResolvableEffect,
  TriggerEvent,
} from "../types";

import { queryInstances } from "./internal";

export class GameEngine {

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public readonly state: GameState,
    public readonly data: DataSource,
    private readonly logs: Array<ResolvableEffect>,
  ) {}

  public addInstance(
    P: PlayerState,
    card: Card,
  ): InstanceState {
    const I: InstanceState = {
      id: `I${this.state.nextID++}`,
      card: card.id,
      owner: P.id,
      controller: P.id,
      arrivalFatigue: true,
      readyState: "READY",
      damage: 0,
      armorDamage: 0,
      dead: false,
      level: 1,
      levelAtTurnStart: 1,
      plusMinusRunes: 0,
      timeRunes: 0,
      customRunes: {},
      attachments: [],
      attachedTo: null,
      modifiers: [],
      memory: {},
    };
    this.state.instances[I.id] = I;
    return I;
  }

  public findInstance(q: InstanceQuery): InstanceState | null {
    // eslint-disable-next-line no-unreachable-loop
    for (const I of this.queryInstances(q)) {
      return I;
    }
    return null;
  }

  public fireGlobalTrigger(e: TriggerEvent): void {
    for (const I of this.queryInstances({})) {
      this.fireInstanceTrigger(I, e);
    }
  }

  public fireInstanceTrigger(I: InstanceState, e: TriggerEvent): void {
    for (const ability of getTriggeredAbilities(this, I, e.type)) {
      for (const effect of ability.effect(this, I, e)) {
        this.queueEffect(effect);
      }
    }
  }

  public getInstance(
    iid: InstanceState | InstanceID | null,
  ): InstanceState | null {
    if (typeof iid === "object") {
      return iid;
    }
    return this.state.instances[iid];
  }

  public getPlayer(pid: PlayerState | PlayerID | null): PlayerState | null {
    if (typeof pid === "object") {
      return pid;
    }
    return this.state.players[pid];
  }

  public log(effect: ResolvableEffect): void {
    this.logs.push(effect);
  }

  public queryInstances(q: InstanceQuery): Iterable<InstanceState> {
    return queryInstances(this, Object.values(this.state.instances), q);
  }

  public queueEffect(
    effect: ResolvableEffect,
  ): string {
    const id = `E${this.state.nextID++}`;
    this.state.unresolvedEffects.push({
      ...effect,
      id,
    });
    return id;
  }

  public readRandom(
    max: number,
  ): number {
    this.state.earliestAllowedRewind = this.state.time;

    return Math.floor(Math.random() * max);
  }

  public shuffleArray<T>(
    arr: Array<T>,
  ): void {
    // Shamelessly copied from https://link.medium.com/1JmrvTx7Y7
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.readRandom(i);
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }

  // public updateContinuousModifiers(): void {
  // }

}
