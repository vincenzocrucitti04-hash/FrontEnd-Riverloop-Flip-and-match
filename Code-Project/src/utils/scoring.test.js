import { describe, expect, test } from "vitest";

import { calculateScore } from "./scoring";

describe("calculateScore", () => {
  test("applies the versioned base, combo, move, and time formula", () => {
    const result = calculateScore({
      difficulty: "4x4",
      matchedPairs: 8,
      comboBonus: 175,
      moves: 10,
      elapsedMs: 42_900,
    });

    expect(result).toEqual({
      version: 1,
      score: 861,
      stars: 2,
      basePoints: 800,
      comboBonus: 175,
      movePenalty: 30,
      timePenalty: 84,
    });
  });

  test("is deterministic and never returns a negative score", () => {
    const input = {
      difficulty: "2x2",
      matchedPairs: 2,
      comboBonus: 0,
      moves: 100,
      elapsedMs: 600_000,
    };

    expect(calculateScore(input)).toEqual(calculateScore(input));
    expect(calculateScore(input).score).toBe(0);
    expect(calculateScore(input).stars).toBe(1);
  });

  test("rejects unknown difficulties", () => {
    expect(() =>
      calculateScore({
        difficulty: "8x8",
        matchedPairs: 0,
        comboBonus: 0,
        moves: 0,
        elapsedMs: 0,
      }),
    ).toThrow(/difficoltà/i);
  });
});
