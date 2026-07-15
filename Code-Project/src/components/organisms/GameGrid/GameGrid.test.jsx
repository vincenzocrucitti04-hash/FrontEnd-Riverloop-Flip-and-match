import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import GameGrid from "./GameGrid";

const cards = [
  {
    id: "25-1",
    pairId: 25,
    name: "Pikachu",
    image: "pikachu.png",
    flipped: false,
    matched: false,
  },
  {
    id: "25-2",
    pairId: 25,
    name: "Pikachu",
    image: "pikachu.png",
    flipped: true,
    matched: false,
  },
];

test("cards are buttons with position, state, and descriptive image text", () => {
  const onFlip = vi.fn();

  render(
    <GameGrid
      cards={cards}
      onFlip={onFlip}
      gridSize="4x4"
      isInputLocked={false}
    />,
  );

  const coveredCard = screen.getByRole("button", {
    name: "Carta 1 di 2: coperta",
  });
  const revealedCard = screen.getByRole("button", {
    name: "Carta 2 di 2: scoperta, Pikachu",
  });

  expect(coveredCard).toBeEnabled();
  expect(revealedCard).toBeDisabled();
  expect(screen.getByAltText("Carta scoperta: Pikachu")).toBeInTheDocument();
  fireEvent.click(coveredCard);
  expect(onFlip).toHaveBeenCalledWith("25-1");
});

test("all cards are disabled while the game resolves a pair", () => {
  render(
    <GameGrid
      cards={cards.map((card) => ({ ...card, flipped: false }))}
      onFlip={() => {}}
      gridSize="4x4"
      isInputLocked
    />,
  );

  screen.getAllByRole("button").forEach((button) => {
    expect(button).toBeDisabled();
  });
});

test("exposes visual and textual feedback on both cards from the last attempt", () => {
  render(
    <GameGrid
      cards={cards.map((card) => ({ ...card, flipped: false }))}
      onFlip={() => {}}
      gridSize="4x4"
      feedback="mismatch"
      feedbackCardIds={["25-1", "25-2"]}
    />,
  );

  screen.getAllByRole("button").forEach((button) => {
    expect(button).toHaveClass("card--mismatch");
    expect(button).toHaveAccessibleName(/ultimo tentativo non corretto/i);
  });
});

test("marks collected cards with a decorative discovery stamp", () => {
  render(
    <GameGrid
      cards={cards.map((card) => ({
        ...card,
        flipped: false,
        matched: true,
      }))}
      onFlip={() => {}}
      gridSize="4x4"
    />,
  );

  expect(
    screen.getAllByText("Trovato", { selector: ".card__stamp" }),
  ).toHaveLength(2);
  expect(screen.getAllByText("Trovato")[0]).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});
