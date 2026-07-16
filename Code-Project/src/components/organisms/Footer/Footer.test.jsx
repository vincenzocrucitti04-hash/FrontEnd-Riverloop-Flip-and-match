import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import Footer from "./Footer";

const footerStyles = readFileSync(
  resolve("src/components/organisms/Footer/Footer.css"),
  "utf8",
);

test("uses a two-column grid without obsolete second-paragraph rules", () => {
  expect(footerStyles).toMatch(
    /^\.system-footer\s*{[^}]*grid-template-columns:\s*1fr auto;/s,
  );
  expect(footerStyles).not.toContain("p:nth-of-type(2)");
});

test("renders in document flow without scroll or resize listeners", () => {
  const addEventListener = vi.spyOn(window, "addEventListener");

  const { container } = render(<Footer />);

  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  expect(
    screen.getByText("Dati Pokémon forniti da PokéAPI"),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("navigation", { name: "Collegamenti sociali" }),
  ).toBeInTheDocument();
  expect(screen.queryByText("Sistema pronto")).not.toBeInTheDocument();
  expect(container.querySelector(".system-footer__status")).toBeNull();
  expect(addEventListener).not.toHaveBeenCalledWith(
    "scroll",
    expect.any(Function),
  );
  expect(addEventListener).not.toHaveBeenCalledWith(
    "resize",
    expect.any(Function),
  );
});
