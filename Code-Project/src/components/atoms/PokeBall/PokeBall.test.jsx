import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, test } from "vitest";
import PokeBall from "./PokeBall";

const pokeBallStyles = readFileSync(
  resolve("src/components/atoms/PokeBall/PokeBall.css"),
  "utf8",
);

test("keeps its lower half and center white in every theme", () => {
  expect(pokeBallStyles).toMatch(
    /var\(--ink\) 44% 56%,\s*#ffffff 56% 100%/s,
  );
  expect(pokeBallStyles).toMatch(
    /\.poke-ball__button\s*{[^}]*background:\s*#ffffff;/s,
  );
});

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
