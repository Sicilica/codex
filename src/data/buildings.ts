import { getProperties } from "./helpers";

export const getBuildingProperties = getProperties(id => {
  switch (id) {
  default:
    throw new Error(`Failed to find properties for building "${id}"`);
  }
});
