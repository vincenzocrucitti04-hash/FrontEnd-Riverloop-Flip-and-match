import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";

import GameStats from "./GameStats";

test("shows five game metrics in the telemetry description list", () => {
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

  const telemetry = screen.getByRole("group", {
    name: "Telemetria partita",
  });

  expect(telemetry.tagName).toBe("DL");
  expect(within(telemetry).getByText("01:05")).toHaveClass(
    "game-stats__value",
  );
  expect(within(telemetry).getByText("8")).toHaveClass("game-stats__value");
  expect(within(telemetry).getByText("00:59 · 10 mosse")).toHaveClass(
    "game-stats__value",
  );
  expect(within(telemetry).getByText("×3")).toHaveClass(
    "game-stats__value",
    "game-stats__combo--active",
  );
  expect(within(telemetry).getByText("10")).toHaveClass("game-stats__value");
  expect(within(telemetry).getAllByRole("term")).toHaveLength(5);
  expect(within(telemetry).getAllByRole("definition")).toHaveLength(5);
  expect(screen.getByRole("status")).toHaveTextContent("10 mosse. Combo 3.");
});
