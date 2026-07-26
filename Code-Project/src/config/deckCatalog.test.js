import { describe, expect, test } from "vitest";

import {
  DECK_CATALOG,
  getDeckPokemon,
  isDeckCompatible,
  validateDeckCatalog,
} from "./deckCatalog";

describe("deck catalog", () => {
  test("contains valid unique IDs and declares grid compatibility", () => {
    expect(validateDeckCatalog(DECK_CATALOG)).toBe(true);
    expect(isDeckCompatible("starters", "4x4")).toBe(true);
    expect(isDeckCompatible("starters", "6x6")).toBe(false);
    expect(isDeckCompatible("offline", "6x6")).toBe(true);
  });

  test("the local deck exposes enough distinct bundled images", () => {
    const pokemon = getDeckPokemon("offline");

    expect(pokemon).toHaveLength(18);
    expect(new Set(pokemon.map(({ id }) => id)).size).toBe(18);
    expect(new Set(pokemon.map(({ image }) => image)).size).toBe(18);
    expect(
      pokemon.every(({ image }) => image.startsWith("data:image/svg+xml")),
    ).toBe(true);
  });

  test("rejects catalogs with duplicate or insufficient entries", () => {
    expect(() =>
      validateDeckCatalog({
        broken: {
          id: "broken",
          label: "Broken",
          pokemonIds: [1, 1],
          supportedDifficulties: ["2x2"],
        },
      }),
    ).toThrow(/deck catalog/i);
  });
});
