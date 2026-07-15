import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import StartScreen from "./StartScreen";

const options = {
  difficulty: "4x4",
  deck: "kanto",
  previewMs: 750,
  trainingMode: false,
};

test("presents instructions, persisted selections, and a native start CTA", () => {
  const onStart = vi.fn();
  render(
    <StartScreen
      options={options}
      onOptionsChange={() => {}}
      onStart={onStart}
    />,
  );

  expect(
    screen.getByRole("heading", {
      name: "La tua prossima scoperta ti aspetta",
    }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
  expect(screen.getByLabelText("Riepilogo partita")).toHaveTextContent("4x4");
  expect(screen.getByLabelText("Riepilogo partita")).toHaveTextContent(
    "Kanto (tutti)",
  );

  const startButton = screen.getByRole("button", {
    name: "Inizia avventura",
  });
  startButton.focus();
  expect(startButton).toHaveFocus();
  fireEvent.click(startButton);
  expect(onStart).toHaveBeenCalledOnce();
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
