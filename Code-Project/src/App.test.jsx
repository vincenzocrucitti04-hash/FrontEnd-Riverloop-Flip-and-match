import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

import App from "./App";

vi.mock("./components/organisms/Header/Header", () => ({
  default: () => <header>Header</header>,
}));
vi.mock("./components/organisms/Footer/Footer", () => ({
  default: () => <footer>Footer</footer>,
}));
vi.mock("./components/templates/GameBoard/GameBoard", () => ({
  default: ({ initialOptions }) => (
    <div data-testid="game-board">{JSON.stringify(initialOptions)}</div>
  ),
}));

beforeEach(() => {
  window.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

test("does not mount the game before confirming persisted selections", () => {
  localStorage.setItem(
    "flip-and-match:user-data",
    JSON.stringify({
      version: 1,
      preferences: {
        theme: "system",
        difficulty: "2x2",
        deck: "offline",
        previewMs: 0,
      },
      records: {},
    }),
  );

  render(<App />);

  expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Riepilogo partita")).toHaveTextContent(
    "2x2 · Locale offline · Anteprima nessuna",
  );

  fireEvent.click(screen.getByRole("button", { name: "Inizia avventura" }));
  expect(screen.getByTestId("game-board")).toHaveTextContent(
    '"difficulty":"2x2"',
  );
  expect(screen.getByTestId("game-board")).toHaveTextContent(
    '"deck":"offline"',
  );
});
