import { expect, test } from "vitest";

import { classifyPokemonLoadError } from "./networkError";

test("distinguishes offline, timeout, server, and generic network failures", () => {
  expect(classifyPokemonLoadError({ code: "NETWORK_ERROR" }, false).kind).toBe(
    "offline",
  );
  expect(classifyPokemonLoadError({ code: "TIMEOUT" }, true).kind).toBe(
    "timeout",
  );
  expect(classifyPokemonLoadError({ code: "HTTP_ERROR" }, true).kind).toBe(
    "server",
  );
  expect(classifyPokemonLoadError(new TypeError("failed"), true).kind).toBe(
    "network",
  );
});

test("returns reassuring messages without exposing technical details", () => {
  const result = classifyPokemonLoadError({ code: "TIMEOUT" }, true);

  expect(result.message).toMatch(/troppo tempo/i);
  expect(result.message).not.toMatch(/TIMEOUT|stack|HTTP/i);
});
