import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import Footer from "./Footer";

test("renders in document flow without scroll or resize listeners", () => {
  const addEventListener = vi.spyOn(window, "addEventListener");

  render(<Footer />);

  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  expect(
    screen.getByText("Dati Pokémon forniti da PokéAPI"),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("navigation", { name: "Collegamenti sociali" }),
  ).toBeInTheDocument();
  expect(addEventListener).not.toHaveBeenCalledWith(
    "scroll",
    expect.any(Function),
  );
  expect(addEventListener).not.toHaveBeenCalledWith(
    "resize",
    expect.any(Function),
  );
});
