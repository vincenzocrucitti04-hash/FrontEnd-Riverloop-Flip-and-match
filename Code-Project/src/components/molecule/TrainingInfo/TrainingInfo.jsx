import Button from "../../atoms/Button/Button";
import "./TrainingInfo.css";

function TrainingInfo({ pokemonName, fact, onDismiss }) {
  return (
    <aside className="training-info" role="status" aria-live="polite">
      <div>
        <strong>{pokemonName}</strong>
        <p>{fact ?? "Curiosità in caricamento…"}</p>
      </div>
      <Button
        className="training-info__close"
        type="button"
        onClick={onDismiss}
        aria-label="Chiudi curiosità"
      >
        ×
      </Button>
    </aside>
  );
}

export default TrainingInfo;
