import { describe, it, expect } from "vitest";
import { getWerewolfCount, MIN_PLAYERS, MAX_PLAYERS, EMOTIONS, REACTIONS } from "shared";

describe("getWerewolfCount", () => {
  it("returns 1 for 3 players", () => {
    expect(getWerewolfCount(3)).toBe(1);
  });

  it("returns 1 for 5 players", () => {
    expect(getWerewolfCount(5)).toBe(1);
  });

  it("returns 2 for 6 players", () => {
    expect(getWerewolfCount(6)).toBe(2);
  });

  it("returns 2 for 8 players", () => {
    expect(getWerewolfCount(8)).toBe(2);
  });
});

describe("constants", () => {
  it("has valid player range", () => {
    expect(MIN_PLAYERS).toBe(3);
    expect(MAX_PLAYERS).toBe(8);
    expect(MIN_PLAYERS).toBeLessThan(MAX_PLAYERS);
  });

  it("has 8 emotions", () => {
    expect(EMOTIONS).toHaveLength(8);
    EMOTIONS.forEach((e) => {
      expect(e.id).toBeTruthy();
      expect(e.label).toBeTruthy();
      expect(e.emoji).toBeTruthy();
    });
  });

  it("has 4 reactions", () => {
    expect(REACTIONS).toHaveLength(4);
  });
});
