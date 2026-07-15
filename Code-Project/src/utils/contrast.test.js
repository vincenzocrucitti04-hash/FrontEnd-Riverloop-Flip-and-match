import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

test("Pokedex semantic foregrounds meet WCAG AA in both themes", () => {
  const pairs = [
    ["#A81820", "#FFFFFF"],
    ["#FF8F8A", "#202630"],
    ["#245F9E", "#FFFFFF"],
    ["#65AAF2", "#202630"],
    ["#FFFFFF", "#245F9E"],
    ["#10141B", "#65AAF2"],
    ["#146C43", "#F7FAFC"],
    ["#63D6A2", "#29313D"],
  ];

  pairs.forEach(([foreground, background]) => {
    expect(meetsAaContrast(foreground, background)).toBe(true);
  });
});

test("foreground consumers avoid invariant dark-red aliases", () => {
  const stylePaths = [
    "src/components/organisms/ProfilePanel/ProfilePanel.css",
    "src/components/molecule/GameError/GameError.css",
    "src/components/molecule/GameStats/GameStats.css",
  ];
  const invariantForeground =
    /(?:^|\n)\s*color:\s*var\(--(?:accent-primary-strong|color-primary|poke-red-dark|primary-color)\)/;

  stylePaths.forEach((stylePath) => {
    expect(readFileSync(resolve(stylePath), "utf8")).not.toMatch(
      invariantForeground,
    );
  });
});

test("contrastRatio is order independent", () => {
  expect(contrastRatio("#1C2A39", "#FFF8EA")).toBeCloseTo(
    contrastRatio("#FFF8EA", "#1C2A39"),
  );
});
