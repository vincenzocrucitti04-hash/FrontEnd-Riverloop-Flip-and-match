import { expect, test } from "vitest";

import * as themeUtils from "./theme";

test("resolves explicit and system theme preferences", () => {
  expect(typeof themeUtils.resolveTheme).toBe("function");
  expect(themeUtils.resolveTheme("light", true)).toBe("light");
  expect(themeUtils.resolveTheme("dark", false)).toBe("dark");
  expect(themeUtils.resolveTheme("system", true)).toBe("dark");
  expect(themeUtils.resolveTheme("system", false)).toBe("light");
});
