import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import StartScreen from "./StartScreen";

const options = {
  difficulty: "4x4",
  deck: "kanto",
  previewMs: 750,
  trainingMode: false,
};

test("presents the control center hierarchy and a native start CTA", () => {
  const onStart = vi.fn();
  const { container } = render(
    <StartScreen
      options={options}
      onOptionsChange={() => {}}
      onStart={onStart}
    />,
  );

  expect(
    screen.getByRole("heading", { name: /centro di controllo/i }),
  ).toBeInTheDocument();
  expect(screen.getByText(/sistema memory pokémon/i)).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(
    screen.getByRole("region", { name: /configurazione sfida/i }),
  ).toBeInTheDocument();
  expect(container.querySelector(".control-center")).not.toBeNull();
  expect(screen.queryByText("Sistema pronto")).not.toBeInTheDocument();
  expect(container.querySelector(".control-center__scanner-status")).toBeNull();
  expect(screen.getByLabelText("Riepilogo configurazione")).toHaveTextContent(
    "4x4",
  );
  expect(screen.getByLabelText("Riepilogo configurazione")).toHaveTextContent(
    "Kanto (tutti)",
  );

  const startButton = screen.getByRole("button", {
    name: /avvia sfida/i,
  });
  expect(startButton.closest(".control-center__hero")).not.toBeNull();
  startButton.focus();
  expect(startButton).toHaveFocus();
  fireEvent.click(startButton);
  expect(onStart).toHaveBeenCalledOnce();
});

test("shows profile metrics in the local register without changing them", () => {
  render(
    <StartScreen
      options={options}
      profile={{
        gamesCompleted: 7,
        discoveredPokemon: [1, 4, 7],
        bestWinStreak: 2,
      }}
      onOptionsChange={() => {}}
      onStart={() => {}}
    />,
  );

  const register = screen.getByRole("region", { name: /registro locale/i });
  expect(register).toHaveTextContent("7");
  expect(register).toHaveTextContent("3");
  expect(register).toHaveTextContent("2");
});

test("updates selections and resolves an incompatible deck", () => {
  const onOptionsChange = vi.fn();
  render(
    <StartScreen
      options={{ ...options, deck: "starters" }}
      onOptionsChange={onOptionsChange}
      onStart={() => {}}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "6x6" }));
  expect(onOptionsChange).toHaveBeenCalledWith({
    ...options,
    difficulty: "6x6",
    deck: "kanto",
  });
});
