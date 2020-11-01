import { expect } from "chai";

describe("upgrades", () => {
  describe("red", () => {
    describe("Bloodburn", () => {
      it("can't be used on its first turn because it doesn't have " +
        "haste", () => {
        expect(true).to.equal(false);
      });
    });
  });
});
