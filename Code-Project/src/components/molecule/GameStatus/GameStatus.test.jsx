import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import GameStatus from "./GameStatus";

test("announces a message through one polite live region", () => {
  render(<GameStatus message="Coppia trovata: Pikachu." feedback="match" />);

  const status = screen.getByRole("status");
  expect(status).toHaveAttribute("aria-live", "polite");
  expect(status).toHaveAttribute("aria-atomic", "true");
  expect(status).toHaveTextContent("Coppia trovata: Pikachu.");
  expect(status).toHaveClass("game-status--match");
});
