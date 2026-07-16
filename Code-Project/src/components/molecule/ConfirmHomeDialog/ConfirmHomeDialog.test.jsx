import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import ConfirmHomeDialog from "./ConfirmHomeDialog";

test("focuses the safe action and cancels with Escape", () => {
  const onCancel = vi.fn();
  const trigger = document.createElement("button");
  trigger.textContent = "Torna alla base";
  document.body.appendChild(trigger);
  trigger.focus();

  const { rerender } = render(
    <ConfirmHomeDialog isOpen onCancel={onCancel} onConfirm={vi.fn()} />,
  );

  const dialog = screen.getByRole("dialog", {
    name: "Interrompere la scansione?",
  });
  expect(
    screen.getByRole("button", { name: "Continua partita" }),
  ).toHaveFocus();

  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(onCancel).toHaveBeenCalledOnce();

  rerender(
    <ConfirmHomeDialog
      isOpen={false}
      onCancel={onCancel}
      onConfirm={vi.fn()}
    />,
  );
  expect(trigger).toHaveFocus();
  trigger.remove();
});

test("traps focus and confirms the return home", () => {
  const onConfirm = vi.fn();
  render(<ConfirmHomeDialog isOpen onCancel={vi.fn()} onConfirm={onConfirm} />);

  const dialog = screen.getByRole("dialog", {
    name: "Interrompere la scansione?",
  });
  const safeAction = screen.getByRole("button", {
    name: "Continua partita",
  });
  const confirmAction = screen.getByRole("button", {
    name: "Esci al centro",
  });

  safeAction.focus();
  fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
  expect(confirmAction).toHaveFocus();
  fireEvent.keyDown(dialog, { key: "Tab" });
  expect(safeAction).toHaveFocus();

  fireEvent.click(confirmAction);
  expect(onConfirm).toHaveBeenCalledOnce();
});
