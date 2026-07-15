import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import GameSkeleton from "./GameSkeleton";

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
