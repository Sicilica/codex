import { InstanceCard } from "../framework/types";
import { HeroBands } from "../framework/types/data/hero";
import { REQUIRE_ALL_CARD_PROPERTIES } from "./config";
import { defaultProperties } from "./helpers";
import { CaptainZane } from "./heroes/captainzane";

const getBandProperties = (
  fn: (id: string, band: 0 | 1 | 2) => Partial<InstanceCard>,
) => (
  id: string,
  band: 0 | 1 | 2,
  health: number | null,
  attack: number | null,
): InstanceCard => {
  const properties = {
    ...defaultProperties(),
    ...fn(id, band),
  };

  if (health != null) {
    properties.attributes.HEALTH = health;
  }
  if (attack != null) {
    properties.attributes.ATTACK = attack;
  }

  return properties;
};

export const getHeroBandProperties = getBandProperties((id, band) => {
  switch (id) {
  case "Captain Zane":
    return getHeroBand(id, band, CaptainZane);
  default:
    if (REQUIRE_ALL_CARD_PROPERTIES) {
      throw new Error(`Failed to find abilities for hero "${name}"`);
    }
    return {};
  }
});

const getHeroBand = (
  id: string,
  band: 0 | 1 | 2,
  heroBands: HeroBands
): Partial<InstanceCard> => {
  switch (band) {
  case 0:
    return heroBands.topBand(id);
  case 1:
    return heroBands.midBand(id);
  case 2:
    return heroBands.maxBand(id);
  default:
    return {};
  }
};
