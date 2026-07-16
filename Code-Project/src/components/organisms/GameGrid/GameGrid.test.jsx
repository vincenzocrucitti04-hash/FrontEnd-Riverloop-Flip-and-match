import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import GameGrid from "./GameGrid";

const cards = [
  {
    id: "1-1",
    pairId: 1,
    name: "Bulbasaur",
    image: "bulbasaur.png",
    flipped: false,
    matched: false,
  },
  {
    id: "1-2",
    pairId: 1,
    name: "Bulbasaur",
    image: "bulbasaur.png",
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
    name: "Carta 2 di 2: scoperta, Bulbasaur",
  });

  expect(coveredCard).toBeEnabled();
  expect(revealedCard).toBeDisabled();
  expect(revealedCard).toHaveAttribute("aria-pressed", "true");
  expect(within(revealedCard).getByText("Bulbasaur")).toBeInTheDocument();
  expect(within(revealedCard).getByText("#001")).toBeInTheDocument();
  expect(
    screen.getByAltText("Bulbasaur, Pokémon registrato"),
  ).toBeInTheDocument();
  fireEvent.click(coveredCard);
  expect(onFlip).toHaveBeenCalledWith("1-1");
});

test("keeps the identity on a covered card hidden from assistive technology", () => {
  render(
    <GameGrid
      cards={[cards[0]]}
      onFlip={() => {}}
      gridSize="2x2"
      isInputLocked={false}
    />,
  );

  const coveredCard = screen.getByRole("button", {
    name: "Carta 1 di 1: coperta",
  });

  expect(coveredCard.querySelector(".memory-card__front")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
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
      feedbackCardIds={["1-1", "1-2"]}
    />,
  );

  screen.getAllByRole("button").forEach((button) => {
    expect(button).toHaveClass("memory-card--mismatch");
    expect(button).toHaveAccessibleName(/ultimo tentativo non corretto/i);
  });
});

test("marks collected cards as registered", () => {
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

  expect(screen.getAllByText("Registrato")).toHaveLength(2);
  screen.getAllByRole("button").forEach((button) => {
    expect(button).toHaveAccessibleName(/abbinata, Bulbasaur/i);
  });
});
