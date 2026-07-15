import { expect, test } from "vitest";

import { contrastRatio, meetsAaContrast } from "./contrast";

test("Pokemon Adventure token pairs meet WCAG AA contrast", () => {
  const pairs = [
    ["#1C2A39", "#FFF8EA"],
    ["#1C2A39", "#FFFDF7"],
    ["#FFFFFF", "#C43B3B"],
    ["#F6F3EC", "#122032"],
    ["#F6F3EC", "#1D3147"],
    ["#122032", "#F4C95D"],
  ];

  pairs.forEach(([foreground, background]) => {
    expect(meetsAaContrast(foreground, background)).toBe(true);
  });
});

test("Expedition Journal text accents meet WCAG AA contrast", () => {
  const pairs = [
    ["#B9473A", "#FFFDF6"],
    ["#9B6818", "#FFFDF6"],
    ["#FF8A78", "#1C342C"],
    ["#F2C56B", "#1C342C"],
  ];

  pairs.forEach(([foreground, background]) => {
    expect(meetsAaContrast(foreground, background)).toBe(true);
  });
});

test("contrastRatio is order independent", () => {
  expect(contrastRatio("#1C2A39", "#FFF8EA")).toBeCloseTo(
    contrastRatio("#FFF8EA", "#1C2A39"),
  );
});
