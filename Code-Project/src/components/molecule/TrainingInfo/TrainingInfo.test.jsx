import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import TrainingInfo from "./TrainingInfo";

const trainingStyles = readFileSync(
  resolve("src/components/molecule/TrainingInfo/TrainingInfo.css"),
  "utf8",
);

test("presents a dismissible Pokedex information region", () => {
  const onDismiss = vi.fn();
  render(
    <TrainingInfo
      pokemonName="Bulbasaur"
      fact="Un seme cresce sul suo dorso."
      onDismiss={onDismiss}
    />,
  );

  const entry = screen.getByRole("region", { name: "Scheda Pokédex" });

  expect(entry).toHaveTextContent("ID Pokémon");
  expect(entry).toHaveTextContent("Bulbasaur");
  expect(entry).toHaveTextContent(
    "Un seme cresce sul suo dorso.",
  );
  fireEvent.click(screen.getByRole("button", { name: "Chiudi scheda" }));
  expect(onDismiss).toHaveBeenCalledOnce();
});

test("keeps the Pokemon name available while the fact is loading", () => {
  render(
    <TrainingInfo pokemonName="Pikachu" fact={null} onDismiss={() => {}} />,
  );

  expect(screen.getByText("Pikachu")).toBeInTheDocument();
  expect(screen.getByText("Curiosità in caricamento…")).toBeInTheDocument();
});

test("keeps long facts scrollable while the close control stays outside", () => {
  render(
    <TrainingInfo
      pokemonName="Pikachu"
      fact={"Informazione molto lunga. ".repeat(40)}
      onDismiss={() => {}}
    />,
  );

  const content = screen.getByRole("group", {
    name: "Informazioni su Pikachu",
  });
  expect(content).toHaveAttribute("tabindex", "0");
  expect(content).not.toContainElement(
    screen.getByRole("button", { name: "Chiudi scheda" }),
  );
  expect(trainingStyles).toMatch(
    /\.training-info__content\s*{[^}]*block-size:\s*100%;[^}]*min-block-size:\s*0;[^}]*overflow-y:\s*auto;/s,
  );
});
