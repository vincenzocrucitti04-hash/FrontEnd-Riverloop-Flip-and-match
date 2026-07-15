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
    <div className="grid-controls">
      <div className="grid-controls__field">
        <span className="grid-controls__label">Difficoltà</span>
        <div className="grid-controls__group" aria-label="Difficoltà">
          {Object.values(GAME_CONFIG.difficulties).map((difficulty) => {
            const isSelected = difficulty.id === gridSize;

            return (
              <Button
                key={difficulty.id}
                className={`btn-grid ${isSelected ? "btn-grid--active" : ""}`}
                onClick={() => onGridSizeChange(difficulty.id)}
                aria-pressed={isSelected}
                disabled={disabled}
              >
                {difficulty.label}
                {isSelected ? <span aria-hidden="true"> ✓</span> : null}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid-controls__selects">
        <label className="grid-controls__preview">
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

        <label className="grid-controls__preview">
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
      </div>

      <Button
        type="button"
        className={`btn-grid ${trainingMode ? "btn-grid--active" : ""}`}
        aria-pressed={trainingMode}
        disabled={disabled}
        onClick={() => onTrainingModeChange(!trainingMode)}
      >
        Modalità allenamento
        {trainingMode ? <span aria-hidden="true"> ✓</span> : null}
      </Button>
    </div>
  );
}

export default GridControls;
