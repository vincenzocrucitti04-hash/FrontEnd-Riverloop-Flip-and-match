import Button from "../../atoms/Button/Button";
import "./GameToolbar.css";

function GameToolbar({ contextLabel, onHome, onRestart, disabled = false }) {
  return (
    <nav className="game-toolbar" aria-label="Azioni della spedizione">
      <Button type="button" className="game-toolbar__home" onClick={onHome}>
        <span aria-hidden="true">←</span>
        Torna alla base
      </Button>
      <div className="game-toolbar__context">
        <span className="game-toolbar__eyebrow">Spedizione in corso</span>
        <strong>{contextLabel}</strong>
      </div>
      <Button
        type="button"
        className="game-toolbar__restart"
        onClick={onRestart}
        disabled={disabled}
      >
        <span aria-hidden="true">↻</span>
        Ricomincia spedizione
      </Button>
    </nav>
  );
}

export default GameToolbar;
