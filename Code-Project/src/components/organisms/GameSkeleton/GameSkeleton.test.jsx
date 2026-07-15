import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import GameSkeleton from "./GameSkeleton";

const skeletonStyles = readFileSync(
  resolve("src/components/organisms/GameSkeleton/GameSkeleton.css"),
  "utf8",
);

test.each([
  ["2x2", 4],
  ["4x4", 16],
  ["6x6", 36],
])("matches the %s grid dimensions while loading", (gridSize, totalCards) => {
  render(<GameSkeleton gridSize={gridSize} />);

  expect(screen.getByRole("status")).toHaveTextContent(
    "Sincronizzazione Pokémon in corso",
  );
  expect(screen.getByRole("status")).toHaveClass(
    `game-skeleton--${gridSize}`,
  );
  expect(screen.getAllByTestId("skeleton-card")).toHaveLength(totalCards);
});

test("overlays the accessible loading label without adding flow height", () => {
  expect(skeletonStyles).toMatch(
    /\.game-skeleton\s*{[^}]*position:\s*relative;[^}]*aspect-ratio:\s*1;/s,
  );
  expect(skeletonStyles).toMatch(
    /\.game-skeleton__label\s*{[^}]*position:\s*absolute;/s,
  );
  expect(skeletonStyles).toMatch(
    /\.game-skeleton__grid\s*{[^}]*width:\s*100%;[^}]*height:\s*100%;/s,
  );
});
