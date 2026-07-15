import Button from "../../atoms/Button/Button";
import PokeBall from "../../atoms/PokeBall/PokeBall";
import GridControls from "../../molecule/GridControls/GridControls";
import { DECK_CATALOG, isDeckCompatible } from "../../../config/deckCatalog";
import { GAME_CONFIG } from "../../../config/gameConfig";
import "./StartScreen.css";

function StartScreen({ options, profile = null, onOptionsChange, onStart }) {
  const previewLabel = GAME_CONFIG.previewOptions.find(
    ({ value }) => value === options.previewMs,
  )?.label;

  return (
    <main className="control-center">
      <section
        className="control-center__hero"
        aria-labelledby="control-center-title"
      >
        <div className="control-center__hero-copy">
          <p className="control-center__system-label">Sistema memory Pokémon</p>
          <h1 id="control-center-title">Centro di controllo</h1>
          <p className="control-center__lead">
            Sincronizza il tuo mazzo, calibra la memoria e trova ogni coppia.
          </p>
          <Button
            type="button"
            className="control-center__start"
            onClick={onStart}
          >
            Avvia sfida
            <span aria-hidden="true">→</span>
          </Button>
        </div>
        <div className="control-center__scanner" aria-hidden="true">
          <span className="control-center__scanner-ring" />
          <PokeBall size="large" />
          <span className="control-center__scanner-status">Sistema pronto</span>
        </div>
      </section>

      <section
        className="control-center__setup"
        aria-labelledby="challenge-setup-title"
      >
        <div className="control-center__panel-heading">
          <span aria-hidden="true">01</span>
          <div>
            <p>Console primaria</p>
            <h2 id="challenge-setup-title">Configurazione sfida</h2>
          </div>
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

      <aside
        className="control-center__summary"
        aria-label="Riepilogo configurazione"
      >
        <p className="control-center__summary-label">Sessione corrente</p>
        <dl>
          <div>
            <dt>Livello</dt>
            <dd>{options.difficulty}</dd>
          </div>
          <div>
            <dt>Mazzo</dt>
            <dd>{DECK_CATALOG[options.deck].label}</dd>
          </div>
          <div>
            <dt>Anteprima</dt>
            <dd>{previewLabel}</dd>
          </div>
          <div>
            <dt>Allenamento</dt>
            <dd>{options.trainingMode ? "Attivo" : "Disattivo"}</dd>
          </div>
        </dl>
      </aside>

      {profile ? (
        <section
          className="control-center__register"
          aria-labelledby="local-register-title"
        >
          <div className="control-center__panel-heading">
            <PokeBall size="small" />
            <div>
              <p>Memoria allenatore</p>
              <h2 id="local-register-title">Registro locale</h2>
            </div>
          </div>
          <dl>
            <div>
              <dt>Partite</dt>
              <dd>{profile.gamesCompleted}</dd>
            </div>
            <div>
              <dt>Scoperte</dt>
              <dd>{profile.discoveredPokemon.length}</dd>
            </div>
            <div>
              <dt>Serie migliore</dt>
              <dd>{profile.bestWinStreak}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section
        className="control-center__protocol"
        aria-labelledby="protocol-title"
      >
        <div className="control-center__panel-heading">
          <span aria-hidden="true">02</span>
          <div>
            <p>Sequenza operativa</p>
            <h2 id="protocol-title">Protocollo di memoria</h2>
          </div>
        </div>
        <ol>
          <li>
            <span aria-hidden="true">01</span>
            <strong>Osserva</strong>
            <p>Studia la scansione iniziale e memorizza le posizioni.</p>
          </li>
          <li>
            <span aria-hidden="true">02</span>
            <strong>Abbina</strong>
            <p>Rivela due carte e collega ogni Pokémon alla sua coppia.</p>
          </li>
          <li>
            <span aria-hidden="true">03</span>
            <strong>Completa</strong>
            <p>Chiudi la griglia con precisione, combo e rapidità.</p>
          </li>
        </ol>
      </section>
    </main>
  );
}

export default StartScreen;
