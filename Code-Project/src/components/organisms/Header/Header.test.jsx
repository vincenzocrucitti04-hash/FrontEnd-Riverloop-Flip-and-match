import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import Header from "./Header";

test("renders the control-center brand and accessible controls", () => {
  const onThemeChange = vi.fn();
  const onProfileToggle = vi.fn();
  render(
    <Header
      theme="system"
      onThemeChange={onThemeChange}
      moves={0}
      onProfileToggle={onProfileToggle}
    />,
  );

  expect(screen.getByRole("banner")).toBeInTheDocument();
  expect(screen.getByText("Flip & Match")).toBeInTheDocument();
  expect(screen.getByText("Pokédex Memory System")).toBeInTheDocument();

  const profileButton = screen.getByRole("button", {
    name: /archivio allenatore/i,
  });
  expect(profileButton).toHaveAttribute("aria-expanded", "false");

  const selector = screen.getByRole("combobox", {
    name: /tema interfaccia/i,
  });
  expect(selector).toHaveValue("system");
  expect(screen.getAllByRole("option").map((option) => option.value)).toEqual([
    "light",
    "dark",
    "system",
  ]);

  fireEvent.change(selector, { target: { value: "dark" } });
  expect(onThemeChange).toHaveBeenCalledWith("dark");
  fireEvent.click(profileButton);
  expect(onProfileToggle).toHaveBeenCalledOnce();
});

test("turns the brand into a home action during a game", () => {
  const onHome = vi.fn();
  render(
    <Header
      theme="light"
      onThemeChange={vi.fn()}
      isGameActive
      onHome={onHome}
    />,
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Torna al centro di controllo" }),
  );
  expect(onHome).toHaveBeenCalledOnce();
});
