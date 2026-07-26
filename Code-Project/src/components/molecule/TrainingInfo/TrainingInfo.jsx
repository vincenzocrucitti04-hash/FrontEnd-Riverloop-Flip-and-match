import Button from "../../atoms/Button/Button";
import "./TrainingInfo.css";

function TrainingInfo({ pokemonName, fact, onDismiss }) {
  return (
    <aside
      className="training-info"
      role="region"
      aria-label="Scheda Pokédex"
      aria-live="polite"
    >
      <div
        className="training-info__content"
        role="group"
        tabIndex={0}
        aria-label={`Informazioni su ${pokemonName}`}
      >
        <header className="training-info__header">
          <span>ID Pokémon</span>
          <strong>{pokemonName}</strong>
        </header>
        <p>{fact ?? "Curiosità in caricamento…"}</p>
      </div>
      <Button
        className="training-info__close"
        type="button"
        onClick={onDismiss}
        aria-label="Chiudi scheda"
      >
        ×
      </Button>
    </aside>
  );
}

export default TrainingInfo;
