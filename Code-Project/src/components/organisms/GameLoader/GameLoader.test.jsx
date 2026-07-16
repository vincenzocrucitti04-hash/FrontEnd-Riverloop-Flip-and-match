import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import GameLoader from "./GameLoader";

test("renders one accessible spinner without synchronization copy", () => {
  const { container } = render(<GameLoader />);
  expect(
    screen.getByRole("status", { name: "Caricamento Pokémon in corso" }),
  ).toBeInTheDocument();
  expect(container.querySelectorAll(".game-loader__spinner")).toHaveLength(1);
  expect(screen.queryByText(/Sincronizzazione/i)).not.toBeInTheDocument();
});

test("stops rotating when reduced motion is requested", () => {
  const styles = readFileSync(
    resolve("src/components/organisms/GameLoader/GameLoader.css"),
    "utf8",
  );
  expect(styles).toMatch(
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.game-loader__spinner[\s\S]*animation:\s*none;/,
  );
});
