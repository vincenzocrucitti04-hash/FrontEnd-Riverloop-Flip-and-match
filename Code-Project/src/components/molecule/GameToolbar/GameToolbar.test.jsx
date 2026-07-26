import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import GameToolbar from "./GameToolbar";

test("exposes game context, control center, and restart actions", () => {
  const onHome = vi.fn();
  const onRestart = vi.fn();
  render(
    <GameToolbar
      contextLabel="4x4 · Kanto"
      onHome={onHome}
      onRestart={onRestart}
    />,
  );

  expect(screen.getByText("4x4 · Kanto")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Centro di controllo" }));
  fireEvent.click(screen.getByRole("button", { name: "Riavvia partita" }));
  expect(onHome).toHaveBeenCalledOnce();
  expect(onRestart).toHaveBeenCalledOnce();
});

test("can lock restart while keeping navigation available", () => {
  render(
    <GameToolbar
      contextLabel="6x6 · Kanto"
      onHome={vi.fn()}
      onRestart={vi.fn()}
      disabled
    />,
  );

  expect(
    screen.getByRole("button", { name: "Centro di controllo" }),
  ).toBeEnabled();
  expect(screen.getByRole("button", { name: "Riavvia partita" })).toBeDisabled();
});
