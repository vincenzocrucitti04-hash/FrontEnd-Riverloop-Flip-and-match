import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PokeBall from "./PokeBall";

describe("PokeBall", () => {
  it("rimane decorativa quando non riceve un'etichetta", () => {
    const { container } = render(<PokeBall />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("può rappresentare un'immagine accessibile", () => {
    render(<PokeBall label="Poké Ball" size="large" />);
    expect(screen.getByRole("img", { name: "Poké Ball" })).toHaveClass(
      "poke-ball--large",
    );
  });
});
