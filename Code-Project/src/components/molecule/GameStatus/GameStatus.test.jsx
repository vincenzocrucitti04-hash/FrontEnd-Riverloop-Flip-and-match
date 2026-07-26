import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

test("uses the in-progress message when no announcement is active", () => {
  const styles = readFileSync(
    resolve("src/components/molecule/GameStatus/GameStatus.css"),
    "utf8",
  );
  expect(styles).toContain(
    'content: "Partita in corso: trova tutte le coppie.";',
  );
});
