import Button from "../../atoms/Button/Button";
import "./GameToolbar.css";

function GameToolbar({ contextLabel, onHome, onRestart, disabled = false }) {
  return (
    <nav className="game-toolbar" aria-label="Comandi partita">
      <Button type="button" className="game-toolbar__home" onClick={onHome}>
        <span aria-hidden="true">←</span>
        Centro di controllo
      </Button>
      <div className="game-toolbar__context">
        <span className="game-toolbar__eyebrow">Scansione attiva</span>
        <strong>{contextLabel}</strong>
      </div>
      <Button
        type="button"
        className="game-toolbar__restart"
        onClick={onRestart}
        disabled={disabled}
      >
        <span aria-hidden="true">↻</span>
        Riavvia partita
      </Button>
    </nav>
  );
}

export default GameToolbar;
