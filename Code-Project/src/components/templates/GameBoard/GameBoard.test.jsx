import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";

import GameBoard from "./GameBoard";

const gameBoardStyles = readFileSync(
  resolve("src/components/templates/GameBoard/GameBoard.css"),
  "utf8",
);

const { useGameLogicMock } = vi.hoisted(() => ({
  useGameLogicMock: vi.fn(),
}));

vi.mock("../../../hooks/useGameLogic", () => ({
  default: useGameLogicMock,
}));

function createGameState(overrides = {}) {
  return {
    cards: [],
    announcement: "Partita iniziata.",
    elapsedMs: 0,
    bestRecord: null,
    minimumMoves: 8,
    combo: 0,
    maxCombo: 0,
    scoreResult: null,
    discoveredPokemon: [],
    deckId: "kanto",
    feedback: null,
    feedbackCardIds: [],
    trainingMode: false,
    trainingInfo: null,
    gridSize: "4x4",
    previewMs: 750,
    loading: false,
    error: null,
    errorKind: null,
    isGameComplete: false,
    isInputLocked: false,
    setGridSize: vi.fn(),
    setPreviewMs: vi.fn(),
    setTrainingMode: vi.fn(),
    dismissTrainingInfo: vi.fn(),
    setDeckId: vi.fn(),
    handleFlip: vi.fn(),
    handleRestart: vi.fn(),
    handleRetry: vi.fn(),
    handleUseOfflineDeck: vi.fn(),
    closeModal: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  useGameLogicMock.mockReset();
});

test("shows only the loading branch inside the game viewport", () => {
  useGameLogicMock.mockReturnValue(
    createGameState({ loading: true, error: "Errore ignorato" }),
  );

  render(<GameBoard />);

  expect(
    screen.getByRole("status", { name: "Caricamento Pokémon in corso" }),
  ).toBeInTheDocument();
  expect(screen.queryByText(/Sincronizzazione/i)).not.toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(
    screen.queryByLabelText("Griglia di gioco"),
  ).not.toBeInTheDocument();
});

test("shows only the error branch when loading has ended", () => {
  useGameLogicMock.mockReturnValue(
    createGameState({ error: "PokeAPI non disponibile", errorKind: "network" }),
  );

  render(<GameBoard />);

  expect(screen.getByRole("alert")).toHaveTextContent(
    "PokeAPI non disponibile",
  );
  expect(
    screen.queryByRole("status", { name: "Caricamento Pokémon in corso" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByLabelText("Griglia di gioco"),
  ).not.toBeInTheDocument();
});

test("shows the grid branch and native game settings", () => {
  useGameLogicMock.mockReturnValue(
    createGameState({
      cards: [
        {
          id: "1-a",
          pairId: 1,
          name: "Bulbasaur",
          image: "bulbasaur.png",
          flipped: false,
          matched: false,
        },
      ],
    }),
  );

  const { container } = render(<GameBoard />);

  expect(screen.getByLabelText("Griglia di gioco")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  const settings = screen
    .getByText("Parametri partita")
    .closest("details");
  expect(settings).toHaveClass("scan-console__settings");
  expect(container.querySelector("main.scan-console")).not.toBeNull();
});

test("reserves the training feedback area before and after a fact appears", () => {
  useGameLogicMock.mockReturnValue(createGameState({ trainingMode: true }));
  const { container, rerender } = render(<GameBoard />);

  const feedback = container.querySelector(".scan-console__feedback");
  expect(feedback).toHaveClass("scan-console__feedback--training");
  expect(
    screen.queryByRole("region", { name: "Scheda Pokédex" }),
  ).not.toBeInTheDocument();

  useGameLogicMock.mockReturnValue(
    createGameState({
      trainingMode: true,
      trainingInfo: {
        id: 1,
        name: "Bulbasaur",
        fact: "Un seme cresce sul suo dorso.",
      },
    }),
  );
  rerender(<GameBoard />);

  expect(feedback).toHaveClass("scan-console__feedback--training");
  expect(
    screen.getByRole("region", { name: "Scheda Pokédex" }),
  ).toHaveTextContent("Bulbasaur");
});

test("keeps training feedback in a fixed scroll-safe block", () => {
  expect(gameBoardStyles).toMatch(
    /\.scan-console__feedback--training\s*{[^}]*block-size:\s*10\.75rem;[^}]*overflow:\s*hidden;/s,
  );
  expect(gameBoardStyles).toMatch(
    /\.scan-console__feedback--training\s+\.training-info\s*{[^}]*block-size:\s*100%;[^}]*min-block-size:\s*0;/s,
  );
  expect(gameBoardStyles).toMatch(
    /@media \(max-width:\s*40rem\)[\s\S]*\.scan-console__feedback--training\s*{[^}]*block-size:\s*13\.5rem;/s,
  );
});
