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

  expect(screen.getByText("Tempo: 01:05")).toBeInTheDocument();
  expect(screen.getByText("Minimo: 8")).toBeInTheDocument();
  expect(screen.getByText("Record: 00:59 · 10 mosse")).toBeInTheDocument();
  expect(screen.getByText("Combo: ×3")).toBeInTheDocument();
  expect(screen.getByText("Mosse: 10")).toBeInTheDocument();
  expect(screen.getByText("4x4 · Kanto")).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "Statistiche partita" })).toBe(
    screen.getByText("Mosse: 10").parentElement,
  );
});
