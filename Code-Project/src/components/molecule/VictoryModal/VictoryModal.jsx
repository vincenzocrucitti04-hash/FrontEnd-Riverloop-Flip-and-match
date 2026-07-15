import { useEffect, useRef } from "react";
import "./VictoryModal.css";
import Button from "../../atoms/Button/Button";
import { GAME_CONFIG } from "../../../config/gameConfig";

function VictoryModal({
  isOpen,
  onClose,
  moves,
  maxCombo,
  difficulty,
  scoreResult,
  discoveredPokemon = [],
}) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const starThresholds = GAME_CONFIG.scoring.starThresholds[difficulty];

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = dialogRef.current.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (
      focusableElements.length === 1 ||
      (event.shiftKey && document.activeElement === firstElement) ||
      (!event.shiftKey && document.activeElement === lastElement)
    ) {
      event.preventDefault();
      (event.shiftKey ? lastElement : firstElement)?.focus();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-title"
        aria-describedby="victory-description"
        onKeyDown={handleKeyDown}
      >
        <div className="modal-header">
          <h2 id="victory-title">🎉 Complimenti!</h2>
        </div>
        <div className="modal-body">
          <p id="victory-description" className="victory-message">
            Bravo! Hai completato il gioco!
          </p>
          {discoveredPokemon.length > 0 ? (
            <div className="victory-discoveries" aria-label="Pokémon scoperti">
              {discoveredPokemon.map((pokemon) => (
                <img
                  key={pokemon.id}
                  src={pokemon.image}
                  alt={`${pokemon.name} scoperto`}
                />
              ))}
            </div>
          ) : null}
          <div className="stats">
            <p className="victory-score">{scoreResult.score} punti</p>
            <p
              className="victory-stars"
              aria-label={`${scoreResult.stars} stelle su 3`}
            >
              {Array.from({ length: 3 }, (_, index) =>
                index < scoreResult.stars ? "★" : "☆",
              ).join(" ")}
            </p>
            <p className="moves-info">
              Hai completato il gioco in <strong>{moves}</strong> mosse
            </p>
            <p>Combo massima: ×{maxCombo}</p>
            <p className="victory-formula">
              Formula v{scoreResult.version ?? GAME_CONFIG.scoring.version}: +
              {GAME_CONFIG.scoring.pointsPerPair} per coppia, bonus combo +
              {GAME_CONFIG.scoring.comboStepBonus} progressivo, −
              {GAME_CONFIG.scoring.extraMovePenalty} per mossa extra, −
              {GAME_CONFIG.scoring.secondsPenalty} al secondo.
            </p>
            <p className="victory-thresholds">
              Soglie {difficulty}: 2 stelle da {starThresholds.two}, 3 stelle da{" "}
              {starThresholds.three}.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button ref={closeButtonRef} className="btn-close" onClick={onClose}>
            Nuova avventura
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VictoryModal;
