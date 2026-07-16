import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import VictoryModal from "./VictoryModal";

test("manages dialog semantics, focus, Escape, and focus restoration", () => {
  const onClose = vi.fn();
  const onHome = vi.fn();
  const trigger = document.createElement("button");
  trigger.textContent = "Carta finale";
  const header = document.createElement("header");
  const fallbackButton = document.createElement("button");
  fallbackButton.textContent = "Profilo locale";
  header.appendChild(fallbackButton);
  document.body.appendChild(header);
  document.body.appendChild(trigger);
  trigger.focus();

  const { rerender } = render(
    <VictoryModal
      isOpen
      onClose={onClose}
      onHome={onHome}
      moves={12}
      elapsedMs={42000}
      maxCombo={4}
      difficulty="4x4"
      scoreResult={{ score: 1040, stars: 2 }}
      discoveredPokemon={[{ id: 25, name: "Pikachu", image: "pikachu.png" }]}
    />,
  );

  const dialog = screen.getByRole("dialog", {
    name: "Scansione completata",
    description: "Tutte le coppie sono state identificate e registrate.",
  });
  const closeButton = screen.getByRole("button", {
    name: "Nuova scansione",
  });
  expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(closeButton).toHaveFocus();
  expect(screen.getByText("1040 punti")).toBeInTheDocument();
  expect(screen.getByText("00:42")).toBeInTheDocument();
  expect(screen.getByLabelText("2 stelle su 3")).toBeInTheDocument();
  expect(screen.getByText("Combo massima")).toBeInTheDocument();
  expect(screen.getByText("×4")).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "Pokémon registrati" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("group", { name: "Telemetria finale" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("group", { name: "Dettagli punteggio" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Formula v1:/)).toBeInTheDocument();
  expect(screen.getByAltText("Pikachu registrato")).toBeInTheDocument();
  expect(
    screen.getByText("Soglie 4x4: 2 stelle da 800, 3 stelle da 1200."),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Centro di controllo" }));
  expect(onHome).toHaveBeenCalledOnce();

  fireEvent.keyDown(dialog, { key: "Tab" });
  expect(closeButton).toHaveFocus();
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(onClose).toHaveBeenCalledOnce();

  trigger.remove();
  rerender(
    <VictoryModal
      isOpen={false}
      onClose={onClose}
      onHome={onHome}
      moves={12}
      elapsedMs={42000}
      maxCombo={4}
      difficulty="4x4"
      scoreResult={{ score: 1040, stars: 2 }}
      discoveredPokemon={[{ id: 25, name: "Pikachu", image: "pikachu.png" }]}
    />,
  );
  expect(fallbackButton).toHaveFocus();
  header.remove();
});
