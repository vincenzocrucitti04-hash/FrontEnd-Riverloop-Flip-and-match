export function resolveTheme(preference, systemPrefersDark) {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return preference;
}
