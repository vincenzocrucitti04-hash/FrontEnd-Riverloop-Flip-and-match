import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import GameStats from "./GameStats";

test("shows elapsed time, theoretical minimum, and best result", () => {
  render(
    <GameStats
      elapsedMs={65000}
      minimumMoves={8}
      bestRecord={{ timeMs: 59000, moves: 10 }}
      combo={3}
      moves={10}
      contextLabel="4x4 · Kanto"
    />,
  );

  expect(screen.getByText("01:05")).toHaveClass("game-stats__value");
  expect(screen.getByText("8")).toHaveClass("game-stats__value");
  expect(screen.getByText("00:59 · 10 mosse")).toHaveClass("game-stats__value");
  expect(screen.getByText("×3")).toHaveClass(
    "game-stats__value",
    "game-stats__combo--active",
  );
  expect(screen.getByText("10")).toHaveClass("game-stats__value");
  expect(
    screen.getByRole("group", { name: "Statistiche partita" }),
  ).toContainElement(screen.getByText("Mosse"));
  expect(screen.getByRole("status")).toHaveTextContent("10 mosse. Combo 3.");
});
