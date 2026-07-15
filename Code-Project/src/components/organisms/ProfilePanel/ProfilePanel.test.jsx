import { fireEvent, render, screen } from "@testing-library/react";
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

test("shows local metrics and explains the accuracy formula", () => {
  render(<ProfilePanel profile={profile} onReset={() => {}} />);

  expect(screen.getByText("Partite concluse: 3")).toBeInTheDocument();
  expect(screen.getByText("Accuratezza: 60%")).toBeInTheDocument();
  expect(screen.getByText(/coppie corrette ÷ tentativi/i)).toBeInTheDocument();
  expect(screen.getByText("Serie attuale: 3")).toBeInTheDocument();
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
    name: "Azzera statistiche",
  });
  fireEvent.click(resetButton);
  expect(onReset).not.toHaveBeenCalled();
  fireEvent.click(resetButton);
  expect(onReset).toHaveBeenCalledOnce();
});
