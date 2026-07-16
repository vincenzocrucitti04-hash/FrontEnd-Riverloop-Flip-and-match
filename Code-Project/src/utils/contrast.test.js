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

test("Pokedex control-center data and focus blues meet contrast in both themes", () => {
  const textPairs = [
    ["#245F9E", "#F7FAFC"],
    ["#65AAF2", "#29313D"],
  ];
  const focusPairs = [
    ["#245F9E", "#FFFFFF"],
    ["#65AAF2", "#202630"],
  ];

  textPairs.forEach(([foreground, background]) => {
    expect(meetsAaContrast(foreground, background)).toBe(true);
  });
  focusPairs.forEach(([indicator, adjacentColor]) => {
    expect(contrastRatio(indicator, adjacentColor)).toBeGreaterThanOrEqual(3);
  });
});

test("Task 3 foreground and focus consumers use theme-aware blue tokens", () => {
  const tokens = readFileSync(resolve("src/index.css"), "utf8");
  const startScreen = readFileSync(
    resolve("src/components/templates/StartScreen/StartScreen.css"),
    "utf8",
  );
  const gridControls = readFileSync(
    resolve("src/components/molecule/GridControls/GridControls.css"),
    "utf8",
  );
  const taskThreeStyles = `${startScreen}\n${gridControls}`;

  expect(tokens).toMatch(
    /body\.light\s*{[^}]*--data-text:\s*#245f9e;[^}]*--focus-ring:\s*#245f9e;/s,
  );
  expect(tokens).toMatch(
    /body\.dark\s*{[^}]*--data-text:\s*#65aaf2;[^}]*--focus-ring:\s*#65aaf2;/s,
  );
  expect(startScreen).toMatch(
    /\.control-center__protocol li > span\s*{[^}]*color:\s*var\(--data-text\)/s,
  );
  expect(gridControls).toMatch(
    /select:focus-visible\s*{[^}]*outline:\s*3px solid var\(--focus-ring\)/s,
  );
  expect(taskThreeStyles).not.toMatch(
    /(?:^|\n)\s*(?:color|outline):[^;]*var\(--(?:poke|signal|color-focus)/,
  );
});

test("contrastRatio is order independent", () => {
  expect(contrastRatio("#1C2A39", "#FFF8EA")).toBeCloseTo(
    contrastRatio("#FFF8EA", "#1C2A39"),
  );
});
