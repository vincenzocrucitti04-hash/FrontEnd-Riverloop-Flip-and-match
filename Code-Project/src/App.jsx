import { useState, useEffect } from "react";
import Header from "./components/organisms/Header/Header";
import GameBoard from "./components/templates/GameBoard/GameBoard";
import Footer from "./components/organisms/Footer/Footer";
import StartScreen from "./components/templates/StartScreen/StartScreen";
import ProfilePanel from "./components/organisms/ProfilePanel/ProfilePanel";
import {
  loadUserData,
  resetProfile,
  updatePreferences,
} from "./services/storage";
import { resolveTheme } from "./utils/theme";
import "./App.css";

function App() {
  const [theme, setTheme] = useState(() => loadUserData().preferences.theme);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(() => loadUserData().profile);
  const [gameOptions, setGameOptions] = useState(() => {
    const { difficulty, deck, previewMs } = loadUserData().preferences;
    return { difficulty, deck, previewMs, trainingMode: false };
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolvedTheme = resolveTheme(theme, mediaQuery.matches);
      document.body.classList.remove("light", "dark");
      document.body.classList.add(resolvedTheme);
      document.body.dataset.theme = resolvedTheme;
      document.documentElement.style.colorScheme = resolvedTheme;
    };

    applyTheme();
    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    updatePreferences({ theme: nextTheme });
  };

  const handleGameOptionsChange = (nextOptions) => {
    setGameOptions(nextOptions);
    updatePreferences({
      difficulty: nextOptions.difficulty,
      deck: nextOptions.deck,
      previewMs: nextOptions.previewMs,
    });
  };

  return (
    <div className="App">
      <Header
        theme={theme}
        onThemeChange={handleThemeChange}
        moves={moves}
        profileOpen={profileOpen}
        onProfileToggle={() => setProfileOpen((isOpen) => !isOpen)}
      />
      {profileOpen ? (
        <ProfilePanel
          profile={profile}
          onReset={() => setProfile(resetProfile())}
        />
      ) : null}
      {gameStarted ? (
        <GameBoard
          setMoves={setMoves}
          moves={moves}
          initialOptions={gameOptions}
          onProfileUpdate={setProfile}
        />
      ) : (
        <StartScreen
          options={gameOptions}
          profile={profile}
          onOptionsChange={handleGameOptionsChange}
          onStart={() => setGameStarted(true)}
        />
      )}
      <Footer />
    </div>
  );
}

export default App;
