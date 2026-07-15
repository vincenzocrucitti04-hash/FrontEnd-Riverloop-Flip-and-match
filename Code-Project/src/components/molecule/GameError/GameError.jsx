import Button from "../../atoms/Button/Button";
import PokeBall from "../../atoms/PokeBall/PokeBall";
import "./GameError.css";

function GameError({ message, onRetry, onUseOfflineDeck }) {
  return (
    <div className="game-error" role="alert">
      <span className="game-error__signal" aria-hidden="true">
        <PokeBall size="medium" />
      </span>
      <h2 className="game-error__title">Anomalia collegamento</h2>
      <p className="game-error__message">{message}</p>
      <div className="game-error__actions">
        <Button className="game-error__retry" onClick={onRetry}>
          Riprova
        </Button>
        <Button className="game-error__offline" onClick={onUseOfflineDeck}>
          Usa mazzo offline
        </Button>
      </div>
    </div>
  );
}

export default GameError;
