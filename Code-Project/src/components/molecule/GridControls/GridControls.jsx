import Button from "../../atoms/Button/Button";
import { GAME_CONFIG } from "../../../config/gameConfig";
import { DECK_CATALOG, isDeckCompatible } from "../../../config/deckCatalog";
import "./GridControls.css";

function GridControls({
  gridSize,
  previewMs,
  disabled,
  onGridSizeChange,
  onPreviewChange,
  trainingMode,
  onTrainingModeChange,
  deckId,
  onDeckChange,
}) {
  return (
    <div className="challenge-controls">
      <fieldset className="challenge-controls__difficulty">
        <legend>Livello memoria</legend>
        <div className="challenge-controls__difficulty-grid">
          {Object.values(GAME_CONFIG.difficulties).map((difficulty) => {
            const isSelected = difficulty.id === gridSize;

            return (
              <Button
                key={difficulty.id}
                type="button"
                className={`challenge-controls__difficulty-button ${
                  isSelected
                    ? "challenge-controls__difficulty-button--active"
                    : ""
                }`}
                onClick={() => onGridSizeChange(difficulty.id)}
                aria-pressed={isSelected}
                disabled={disabled}
              >
                <strong>{difficulty.label}</strong>
                <span aria-hidden="true">{difficulty.pairs} coppie</span>
              </Button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="challenge-controls__parameters">
        <legend>Parametri di scansione</legend>
        <div className="challenge-controls__selects">
          <label className="challenge-controls__select">
            Mazzo Pokémon
            <select
              value={deckId}
              onChange={(event) => onDeckChange(event.target.value)}
              disabled={disabled}
            >
              {Object.values(DECK_CATALOG).map((deck) => (
                <option
                  key={deck.id}
                  value={deck.id}
                  disabled={!isDeckCompatible(deck.id, gridSize)}
                >
                  {deck.label}
                </option>
              ))}
            </select>
          </label>

          <label className="challenge-controls__select">
            Durata anteprima
            <select
              value={previewMs}
              onChange={(event) => onPreviewChange(Number(event.target.value))}
              disabled={disabled}
            >
              {GAME_CONFIG.previewOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Button
          type="button"
          className={`challenge-controls__training ${
            trainingMode ? "challenge-controls__training--active" : ""
          }`}
          aria-label="Modalità allenamento"
          aria-pressed={trainingMode}
          disabled={disabled}
          onClick={() => onTrainingModeChange(!trainingMode)}
        >
          <span>
            <strong>Modalità allenamento</strong>
            <small>Mostra le coppie già trovate durante la sfida.</small>
          </span>
          <span className="challenge-controls__toggle" aria-hidden="true">
            <span />
          </span>
        </Button>
      </fieldset>
    </div>
  );
}

export default GridControls;
