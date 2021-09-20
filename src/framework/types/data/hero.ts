import { InstanceCard } from "./card";

export type HeroBand = (id: string) => Partial<InstanceCard>;

export interface HeroBands {
  topBand: HeroBand;
  midBand: HeroBand;
  maxBand: HeroBand;
}
