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
  default: ({ initialOptions, onHome, onCompletedHome, setMoves }) => (
    <div data-testid="game-board">
      {JSON.stringify(initialOptions)}
      <button type="button" onClick={onHome}>
        Torna alla base
      </button>
      <button type="button" onClick={() => setMoves(1)}>
        Registra una mossa
      </button>
      <button type="button" onClick={onCompletedHome}>
        Torna dopo la vittoria
      </button>
    </div>
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
  const summary = screen.getByLabelText("Riepilogo partita");
  expect(summary).toHaveTextContent("2x2");
  expect(summary).toHaveTextContent("Locale offline");
  expect(summary).toHaveTextContent("Nessuna");

  fireEvent.click(screen.getByRole("button", { name: "Inizia avventura" }));
  expect(screen.getByTestId("game-board")).toHaveTextContent(
    '"difficulty":"2x2"',
  );
  expect(screen.getByTestId("game-board")).toHaveTextContent(
    '"deck":"offline"',
  );
});

test("returns home immediately when the expedition has no moves", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Inizia avventura" }));
  fireEvent.click(screen.getByRole("button", { name: "Torna alla base" }));

  expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Inizia avventura" }),
  ).toBeInTheDocument();
});

test("asks for confirmation before abandoning an expedition with moves", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Inizia avventura" }));
  fireEvent.click(screen.getByRole("button", { name: "Registra una mossa" }));
  fireEvent.click(screen.getByRole("button", { name: "Torna alla base" }));

  expect(
    screen.getByRole("dialog", { name: "Abbandonare la spedizione?" }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Continua a giocare" }));
  expect(screen.getByTestId("game-board")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Torna alla base" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Conferma ritorno alla base" }),
  );

  expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
});

test("returns home without an abandonment prompt after victory", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Inizia avventura" }));
  fireEvent.click(screen.getByRole("button", { name: "Registra una mossa" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Torna dopo la vittoria" }),
  );

  expect(
    screen.queryByRole("dialog", { name: "Abbandonare la spedizione?" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
});
