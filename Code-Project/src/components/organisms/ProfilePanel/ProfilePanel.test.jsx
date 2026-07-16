import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import ProfilePanel from "./ProfilePanel";

const profile = {
  gamesCompleted: 3,
  totalAttempts: 20,
  correctPairs: 12,
  currentWinStreak: 3,
  bestWinStreak: 3,
  discoveredPokemon: [
    { id: 1, name: "Bulbasaur" },
    { id: 4, name: "Charmander" },
  ],
};

test("presents the local trainer archive, metrics, and discoveries", () => {
  render(<ProfilePanel profile={profile} onReset={() => {}} />);

  expect(
    screen.getByRole("complementary", { name: "Archivio Allenatore" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Archivio Allenatore" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/dati.*questo browser/i)).toBeInTheDocument();
  const completedMetric = screen.getByText("Partite concluse").closest("div");
  expect(within(completedMetric).getByText("3")).toBeInTheDocument();
  const accuracyMetric = screen.getByText("Accuratezza").closest("div");
  expect(within(accuracyMetric).getByText("60%")).toBeInTheDocument();
  expect(screen.getByText(/coppie corrette ÷ tentativi/i)).toBeInTheDocument();
  expect(screen.getByText("Serie attuale")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Pokémon scoperti: 2" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Bulbasaur/)).toBeInTheDocument();
});

test("resets only after explicit confirmation", () => {
  const onReset = vi.fn();
  const confirmFn = vi
    .fn()
    .mockReturnValueOnce(false)
    .mockReturnValueOnce(true);
  render(
    <ProfilePanel profile={profile} onReset={onReset} confirmFn={confirmFn} />,
  );

  const resetButton = screen.getByRole("button", {
    name: "Azzera archivio",
  });
  fireEvent.click(resetButton);
  expect(onReset).not.toHaveBeenCalled();
  fireEvent.click(resetButton);
  expect(onReset).toHaveBeenCalledOnce();
});
