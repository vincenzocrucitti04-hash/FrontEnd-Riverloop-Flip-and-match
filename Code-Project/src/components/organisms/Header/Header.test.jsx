import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import Header from "./Header";

test("offers light, dark, and system theme preferences", () => {
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

  const selector = screen.getByLabelText("Tema");
  expect(selector).toHaveValue("system");
  expect(screen.getAllByRole("option").map((option) => option.value)).toEqual([
    "light",
    "dark",
    "system",
  ]);

  fireEvent.change(selector, { target: { value: "dark" } });
  expect(onThemeChange).toHaveBeenCalledWith("dark");
  fireEvent.click(screen.getByRole("button", { name: "Profilo locale" }));
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

  fireEvent.click(screen.getByRole("button", { name: "Torna alla home" }));
  expect(onHome).toHaveBeenCalledOnce();
});
