import Button from "../../atoms/Button/Button";
import GridControls from "../../molecule/GridControls/GridControls";
import { DECK_CATALOG, isDeckCompatible } from "../../../config/deckCatalog";
import { GAME_CONFIG } from "../../../config/gameConfig";
import "./StartScreen.css";

function StartScreen({ options, profile = null, onOptionsChange, onStart }) {
  const previewLabel = GAME_CONFIG.previewOptions.find(
    ({ value }) => value === options.previewMs,
  )?.label;

  return (
    <main className="start-screen">
      <section className="start-screen__hero" aria-labelledby="start-title">
        <p className="start-screen__eyebrow">Flip &amp; Match</p>
        <h1 id="start-title">La tua prossima scoperta ti aspetta</h1>
        <p>
          Trova tutte le coppie Pokémon, costruisci la combo e conquista tre
          stelle.
        </p>
      </section>

      <section
        className="start-screen__instructions"
        aria-labelledby="how-title"
      >
        <h2 id="how-title">Come si gioca</h2>
        <ol>
          <li>Scegli difficoltà, mazzo e anteprima.</li>
          <li>Memorizza le carte e scopri due Pokémon alla volta.</li>
          <li>Completa le coppie con meno mosse e tempo possibile.</li>
        </ol>
      </section>

      <section
        className="start-screen__settings"
        aria-labelledby="settings-title"
      >
        <h2 id="settings-title">Prepara la partita</h2>
        <GridControls
          gridSize={options.difficulty}
          previewMs={options.previewMs}
          deckId={options.deck}
          trainingMode={options.trainingMode}
          disabled={false}
          onGridSizeChange={(difficulty) =>
            onOptionsChange({
              ...options,
              difficulty,
              deck: isDeckCompatible(options.deck, difficulty)
                ? options.deck
                : "kanto",
            })
          }
          onPreviewChange={(previewMs) =>
            onOptionsChange({ ...options, previewMs })
          }
          onDeckChange={(deck) => onOptionsChange({ ...options, deck })}
          onTrainingModeChange={(trainingMode) =>
            onOptionsChange({ ...options, trainingMode })
          }
        />

        <p className="start-screen__summary" aria-label="Riepilogo partita">
          {options.difficulty} · {DECK_CATALOG[options.deck].label} · Anteprima{" "}
          {previewLabel.toLowerCase()} · Allenamento{" "}
          {options.trainingMode ? "attivo" : "disattivo"}
        </p>

        <Button type="button" className="start-screen__cta" onClick={onStart}>
          Inizia avventura
        </Button>
        {profile ? (
          <div className="start-screen__snapshot" aria-label="Progressi locali">
            <span>{profile.gamesCompleted} partite</span>
            <span>{profile.discoveredPokemon.length} Pokémon scoperti</span>
            <span>Serie migliore: {profile.bestWinStreak}</span>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default StartScreen;
