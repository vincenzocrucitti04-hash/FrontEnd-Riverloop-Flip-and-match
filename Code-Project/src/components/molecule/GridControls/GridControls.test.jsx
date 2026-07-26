import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import GridControls from "./GridControls";

test("shows one active difficulty and an accessible preview selector", () => {
  const onGridSizeChange = vi.fn();
  const onPreviewChange = vi.fn();
  const onTrainingModeChange = vi.fn();
  const onDeckChange = vi.fn();

  render(
    <GridControls
      gridSize="4x4"
      previewMs={750}
      disabled={false}
      onGridSizeChange={onGridSizeChange}
      onPreviewChange={onPreviewChange}
      trainingMode={false}
      onTrainingModeChange={onTrainingModeChange}
      deckId="kanto"
      onDeckChange={onDeckChange}
    />,
  );

  expect(
    screen.getByRole("group", { name: "Livello memoria" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("group", { name: "Parametri di scansione" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "4x4" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.getByRole("button", { name: "2x2" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  fireEvent.click(screen.getByRole("button", { name: "2x2" }));
  expect(onGridSizeChange).toHaveBeenCalledWith("2x2");

  fireEvent.change(screen.getByLabelText("Durata anteprima"), {
    target: { value: "0" },
  });
  expect(onPreviewChange).toHaveBeenCalledWith(0);

  const trainingButton = screen.getByRole("button", {
    name: "Modalità allenamento",
  });
  expect(trainingButton).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(trainingButton);
  expect(onTrainingModeChange).toHaveBeenCalledWith(true);

  fireEvent.change(screen.getByLabelText("Mazzo Pokémon"), {
    target: { value: "water" },
  });
  expect(onDeckChange).toHaveBeenCalledWith("water");
});

test("marks incompatible decks as unavailable for the selected difficulty", () => {
  render(
    <GridControls
      gridSize="6x6"
      previewMs={750}
      disabled={false}
      onGridSizeChange={() => {}}
      onPreviewChange={() => {}}
      trainingMode
      onTrainingModeChange={() => {}}
      deckId="kanto"
      onDeckChange={() => {}}
    />,
  );

  expect(
    screen.getByRole("button", { name: "Modalità allenamento" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("option", { name: "Starter e evoluzioni" }),
  ).toBeDisabled();
  expect(screen.getByRole("option", { name: "Kanto (tutti)" })).toBeEnabled();
});

test("disables all settings while a deck is loading", () => {
  render(
    <GridControls
      gridSize="4x4"
      previewMs={750}
      disabled
      onGridSizeChange={() => {}}
      onPreviewChange={() => {}}
      trainingMode={false}
      onTrainingModeChange={() => {}}
      deckId="kanto"
      onDeckChange={() => {}}
    />,
  );

  screen.getAllByRole("button").forEach((button) => {
    expect(button).toBeDisabled();
  });
  expect(screen.getByLabelText("Durata anteprima")).toBeDisabled();
  expect(screen.getByLabelText("Mazzo Pokémon")).toBeDisabled();
});
