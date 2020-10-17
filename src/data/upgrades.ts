import { getProperties } from "./helpers";

export const getUpgradeProperties = getProperties(id => {
  switch (id) {
  default:
    throw new Error(`Failed to find properties for upgrade "${id}"`);
  }
});
