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
      <div className="start-screen__route" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <section className="start-screen__hero" aria-labelledby="start-title">
        <p className="start-screen__eyebrow">Diario di esplorazione · 01</p>
        <h1 id="start-title">La tua prossima scoperta ti aspetta</h1>
        <p className="start-screen__lead">
          Trova tutte le coppie Pokémon, costruisci la combo e conquista tre
          stelle.
        </p>
        <div className="start-screen__field-note" aria-hidden="true">
          <span className="start-screen__compass">N</span>
          <span>Segui le tracce</span>
        </div>
      </section>

      <section
        className="start-screen__expedition"
        aria-labelledby="expedition-title"
      >
        <span className="start-screen__postmark" aria-hidden="true">
          Pronta
        </span>
        <p className="start-screen__section-kicker">Cartolina di viaggio</p>
        <h2 id="expedition-title">La prossima spedizione</h2>
        <p className="start-screen__summary" aria-label="Riepilogo partita">
          <span>
            <small>Campo</small>
            <strong>{options.difficulty}</strong>
          </span>
          <span>
            <small>Percorso</small>
            <strong>{DECK_CATALOG[options.deck].label}</strong>
          </span>
          <span>
            <small>Osservazione</small>
            <strong>{previewLabel}</strong>
          </span>
          <span>
            <small>Allenamento</small>
            <strong>{options.trainingMode ? "Attivo" : "Disattivo"}</strong>
          </span>
        </p>

        <Button type="button" className="start-screen__cta" onClick={onStart}>
          <span>Inizia avventura</span>
          <span aria-hidden="true">→</span>
        </Button>

        {profile ? (
          <div className="start-screen__snapshot" aria-label="Progressi locali">
            <span>
              <strong>{profile.gamesCompleted}</strong> partite
            </span>
            <span>
              <strong>{profile.discoveredPokemon.length}</strong> scoperte
            </span>
            <span>
              Serie <strong>{profile.bestWinStreak}</strong>
            </span>
          </div>
        ) : null}
      </section>

      <section
        className="start-screen__settings"
        aria-labelledby="settings-title"
      >
        <div className="start-screen__section-heading">
          <p className="start-screen__section-kicker">Taccuino da campo</p>
          <h2 id="settings-title">Configura il percorso</h2>
          <p>Adatta la spedizione al tempo e alla memoria che hai oggi.</p>
        </div>
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
      </section>

      <section
        className="start-screen__instructions"
        aria-labelledby="how-title"
      >
        <div className="start-screen__section-heading">
          <p className="start-screen__section-kicker">Tre tappe</p>
          <h2 id="how-title">Come si esplora</h2>
        </div>
        <ol>
          <li>
            <span aria-hidden="true">01</span>
            Scegli difficoltà, mazzo e anteprima.
          </li>
          <li>
            <span aria-hidden="true">02</span>
            Memorizza le carte e scopri due Pokémon alla volta.
          </li>
          <li>
            <span aria-hidden="true">03</span>
            Completa le coppie con meno mosse e tempo possibile.
          </li>
        </ol>
      </section>
    </main>
  );
}

export default StartScreen;
