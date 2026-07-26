import { beforeEach, expect, test, vi } from "vitest";

import { clearPokemonFactsCache, fetchPokemonFact } from "./pokemonFacts";

beforeEach(() => {
  clearPokemonFactsCache();
});

test("prefers and normalizes the Italian species description", async () => {
  const fetchFn = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      flavor_text_entries: [
        { language: { name: "en" }, flavor_text: "English fact." },
        {
          language: { name: "it" },
          flavor_text: "Un seme\nè piantato\falla nascita.",
        },
      ],
    }),
  });

  await expect(fetchPokemonFact(1, "Bulbasaur", { fetchFn })).resolves.toBe(
    "Un seme è piantato alla nascita.",
  );
  expect(fetchFn).toHaveBeenCalledWith(
    "https://pokeapi.co/api/v2/pokemon-species/1",
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
});

test("uses a reliable local fallback when network content is unavailable", async () => {
  const fetchFn = vi.fn().mockRejectedValue(new TypeError("offline"));

  await expect(fetchPokemonFact(25, "Pikachu", { fetchFn })).resolves.toContain(
    "Pikachu",
  );
});

test("does not hide an external abort behind the fallback", async () => {
  const controller = new AbortController();
  controller.abort(new DOMException("Stopped", "AbortError"));

  await expect(
    fetchPokemonFact(1, "Bulbasaur", { signal: controller.signal }),
  ).rejects.toMatchObject({ name: "AbortError" });
});
