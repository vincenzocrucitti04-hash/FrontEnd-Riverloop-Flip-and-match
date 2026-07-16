import { useEffect, useRef } from "react";
import "./VictoryModal.css";
import Button from "../../atoms/Button/Button";
import PokeBall from "../../atoms/PokeBall/PokeBall";
import { GAME_CONFIG } from "../../../config/gameConfig";

function formatTime(timeMs) {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function VictoryModal({
  isOpen,
  onClose,
  moves,
  elapsedMs = 0,
  maxCombo,
  difficulty,
  scoreResult,
  discoveredPokemon = [],
  onHome = () => {},
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
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
        return;
      }

      document
        .querySelector("header button, header select, main button")
        ?.focus();
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
      className="scan-result-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="scan-result"
        role="dialog"
        aria-modal="true"
        aria-labelledby="victory-title"
        aria-describedby="victory-description"
        onKeyDown={handleKeyDown}
      >
        <span className="scan-result__indicator-bar" aria-hidden="true" />
        <header className="scan-result__header" role="presentation">
          <PokeBall size="medium" />
          <div>
            <p>Registrazione completata</p>
            <h2 id="victory-title">Scansione completata</h2>
          </div>
        </header>
        <p id="victory-description" className="scan-result__message">
          Tutte le coppie sono state identificate e registrate.
        </p>
        <section className="scan-result__score" aria-label="Valutazione finale">
          <p>{scoreResult.score} punti</p>
          <p
            className="scan-result__stars"
            aria-label={`${scoreResult.stars} stelle su 3`}
          >
            {Array.from({ length: 3 }, (_, index) =>
              index < scoreResult.stars ? "★" : "☆",
            ).join(" ")}
          </p>
        </section>
        {discoveredPokemon.length > 0 ? (
          <section
            className="scan-result__pokemon"
            aria-label="Pokémon registrati"
          >
            {discoveredPokemon.map((pokemon) => (
              <img
                key={pokemon.id}
                src={pokemon.image}
                alt={`${pokemon.name} registrato`}
              />
            ))}
          </section>
        ) : null}
        <dl
          className="scan-result__telemetry"
          role="group"
          aria-label="Telemetria finale"
        >
          <div>
            <dt>Tempo</dt>
            <dd>{formatTime(elapsedMs)}</dd>
          </div>
          <div>
            <dt>Mosse</dt>
            <dd>{moves}</dd>
          </div>
          <div>
            <dt>Combo massima</dt>
            <dd>×{maxCombo}</dd>
          </div>
        </dl>
        <details
          className="scan-result__formula"
          aria-label="Dettagli punteggio"
        >
          <summary>Dettagli punteggio</summary>
          <div>
            <p>
              Formula v{scoreResult.version ?? GAME_CONFIG.scoring.version}: +
              {GAME_CONFIG.scoring.pointsPerPair} per coppia, bonus combo +
              {GAME_CONFIG.scoring.comboStepBonus} progressivo, −
              {GAME_CONFIG.scoring.extraMovePenalty} per mossa extra, −
              {GAME_CONFIG.scoring.secondsPenalty} al secondo.
            </p>
            <p>
              Soglie {difficulty}: 2 stelle da {starThresholds.two}, 3 stelle da{" "}
              {starThresholds.three}.
            </p>
          </div>
        </details>
        <footer className="scan-result__actions" role="presentation">
          <Button
            ref={closeButtonRef}
            className="scan-result__primary"
            onClick={onClose}
          >
            Nuova scansione
          </Button>
          <Button className="scan-result__secondary" onClick={onHome}>
            Centro di controllo
          </Button>
        </footer>
      </div>
    </div>
  );
}

export default VictoryModal;
