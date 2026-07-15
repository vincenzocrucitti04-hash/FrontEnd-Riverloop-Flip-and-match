import { act, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import * as timerHook from "./useGameTimer";

test("counts only active play and resets on loading", () => {
  expect(typeof timerHook.default).toBe("function");
  vi.useFakeTimers();
  const { result, rerender } = renderHook(
    ({ phase }) => timerHook.default(phase),
    { initialProps: { phase: "preview" } },
  );

  act(() => vi.advanceTimersByTime(2000));
  expect(result.current).toBe(0);

  rerender({ phase: "playing" });
  act(() => vi.advanceTimersByTime(2000));
  expect(result.current).toBe(2000);

  rerender({ phase: "resolvingPair" });
  act(() => vi.advanceTimersByTime(1000));
  expect(result.current).toBe(3000);

  rerender({ phase: "won" });
  act(() => vi.advanceTimersByTime(2000));
  expect(result.current).toBe(3000);

  rerender({ phase: "loading" });
  expect(result.current).toBe(0);
});
