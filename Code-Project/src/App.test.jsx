import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, expect, test, vi } from "vitest";

import App from "./App";

const appStyles = readFileSync(resolve("src/App.css"), "utf8");

vi.mock("./components/organisms/Header/Header", () => ({
  default: ({ profileOpen, onProfileToggle }) => (
    <header>
      <button
        type="button"
        aria-expanded={profileOpen}
        onClick={onProfileToggle}
      >
        Archivio Allenatore
      </button>
    </header>
  ),
}));
vi.mock("./components/organisms/Footer/Footer", () => ({
  default: () => <footer>Footer</footer>,
}));
vi.mock("./components/templates/GameBoard/GameBoard", () => ({
  default: ({ initialOptions, onHome, onCompletedHome, setMoves }) => (
    <main className="scan-console" data-testid="game-board">
      {JSON.stringify(initialOptions)}
      <dl role="group" aria-label="Telemetria partita" />
      <div role="grid" aria-label="Griglia di gioco" />
      <button type="button" onClick={onHome}>
        Centro di controllo
      </button>
      <button type="button" onClick={() => setMoves(1)}>
        Registra una mossa
      </button>
      <button type="button" onClick={onCompletedHome}>
        Rientro dopo la vittoria
      </button>
    </main>
  ),
}));

beforeEach(() => {
  window.matchMedia = vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

test("moves from the control center to the game console", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { name: "Centro di controllo" }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Avvia sfida" }));

  expect(screen.getByRole("main")).toHaveClass("scan-console");
  expect(
    screen.getByRole("group", { name: "Telemetria partita" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("grid", { name: "Griglia di gioco" }),
  ).toBeInTheDocument();
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
  const summary = screen.getByLabelText("Riepilogo configurazione");
  expect(summary).toHaveTextContent("2x2");
  expect(summary).toHaveTextContent("Locale offline");
  expect(summary).toHaveTextContent("Nessuna");

  fireEvent.click(screen.getByRole("button", { name: "Avvia sfida" }));
  expect(screen.getByTestId("game-board")).toHaveTextContent(
    '"difficulty":"2x2"',
  );
  expect(screen.getByTestId("game-board")).toHaveTextContent(
    '"deck":"offline"',
  );
});

test("opens and closes the trainer archive from the same header toggle", () => {
  render(<App />);

  const toggle = screen.getByRole("button", { name: "Archivio Allenatore" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(toggle);
  const archive = screen.getByRole("complementary", {
    name: "Archivio Allenatore",
  });
  const chrome = toggle.closest(".App__chrome");
  expect(chrome).toBeInTheDocument();
  expect(chrome).toContainElement(archive.closest(".App__archive"));
  expect(toggle).toHaveAttribute("aria-expanded", "true");

  fireEvent.click(toggle);
  expect(
    screen.queryByRole("complementary", { name: "Archivio Allenatore" }),
  ).not.toBeInTheDocument();
});

test("bounds the desktop archive to the viewport and restores mobile flow", () => {
  expect(appStyles).toMatch(
    /\.App__archive\s*{[^}]*max-block-size:\s*calc\(100dvh\s*-\s*4\.95rem\);[^}]*overflow-y:\s*auto;/s,
  );
  expect(appStyles).toMatch(
    /@media \(max-width:\s*48rem\)[\s\S]*\.App__archive\s*{[^}]*max-block-size:\s*none;[^}]*overflow-y:\s*visible;/s,
  );
});

test("returns to the control center immediately when the scan has no moves", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Avvia sfida" }));
  fireEvent.click(screen.getByRole("button", { name: "Centro di controllo" }));

  expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Avvia sfida" }),
  ).toBeInTheDocument();
});

test("asks for confirmation before interrupting a scan with moves", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Avvia sfida" }));
  fireEvent.click(screen.getByRole("button", { name: "Registra una mossa" }));
  fireEvent.click(screen.getByRole("button", { name: "Centro di controllo" }));

  expect(
    screen.getByRole("dialog", { name: "Interrompere la scansione?" }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Continua partita" }));
  expect(screen.getByTestId("game-board")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Centro di controllo" }));
  fireEvent.click(screen.getByRole("button", { name: "Esci al centro" }));

  expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
});

test("returns home without an abandonment prompt after victory", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Avvia sfida" }));
  fireEvent.click(screen.getByRole("button", { name: "Registra una mossa" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Rientro dopo la vittoria" }),
  );

  expect(
    screen.queryByRole("dialog", { name: "Interrompere la scansione?" }),
  ).not.toBeInTheDocument();
  expect(screen.queryByTestId("game-board")).not.toBeInTheDocument();
});
