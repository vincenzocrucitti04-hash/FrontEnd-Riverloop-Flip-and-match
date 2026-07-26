import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import GameError from "./GameError";

test("renders an announced error and invokes retry", () => {
  const onRetry = vi.fn();
  const onUseOfflineDeck = vi.fn();

  render(
    <GameError
      message="PokeAPI non è disponibile."
      onRetry={onRetry}
      onUseOfflineDeck={onUseOfflineDeck}
    />,
  );

  expect(screen.getByRole("alert")).toHaveTextContent(
    "PokeAPI non è disponibile.",
  );
  expect(
    screen.getByRole("heading", { name: "Anomalia collegamento" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Riprova" }));
  expect(onRetry).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Usa mazzo offline" }));
  expect(onUseOfflineDeck).toHaveBeenCalledOnce();
});
