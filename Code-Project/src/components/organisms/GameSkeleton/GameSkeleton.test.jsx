import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import GameSkeleton from "./GameSkeleton";

test("keeps the selected grid dimensions while loading", () => {
  render(<GameSkeleton gridSize="6x6" />);

  expect(screen.getByRole("status")).toHaveTextContent(
    "Sincronizzazione Pokémon in corso",
  );
  expect(screen.getAllByTestId("skeleton-card")).toHaveLength(36);
});
