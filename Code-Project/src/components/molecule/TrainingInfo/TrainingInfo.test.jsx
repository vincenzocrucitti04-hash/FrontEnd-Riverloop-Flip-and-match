import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import TrainingInfo from "./TrainingInfo";

test("announces a non-blocking fact and can be dismissed", () => {
  const onDismiss = vi.fn();
  render(
    <TrainingInfo
      pokemonName="Bulbasaur"
      fact="Un seme cresce sul suo dorso."
      onDismiss={onDismiss}
    />,
  );

  expect(screen.getByRole("status")).toHaveTextContent("Bulbasaur");
  expect(screen.getByRole("status")).toHaveTextContent(
    "Un seme cresce sul suo dorso.",
  );
  fireEvent.click(screen.getByRole("button", { name: "Chiudi curiosità" }));
  expect(onDismiss).toHaveBeenCalledOnce();
});

test("keeps the Pokemon name available while the fact is loading", () => {
  render(
    <TrainingInfo pokemonName="Pikachu" fact={null} onDismiss={() => {}} />,
  );

  expect(screen.getByText("Pikachu")).toBeInTheDocument();
  expect(screen.getByText("Curiosità in caricamento…")).toBeInTheDocument();
});
