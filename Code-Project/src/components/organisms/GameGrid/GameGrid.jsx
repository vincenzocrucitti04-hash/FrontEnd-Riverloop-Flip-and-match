import "./GameGrid.css";

function getCardLabel(card, position, totalCards, feedback) {
  const prefix = `Carta ${position} di ${totalCards}`;
  const feedbackLabel =
    feedback === "match"
      ? ", ultimo tentativo corretto"
      : feedback === "mismatch"
        ? ", ultimo tentativo non corretto"
        : "";

  if (card.matched) {
    return `${prefix}: abbinata, ${card.name}${feedbackLabel}`;
  }
  if (card.flipped) {
    return `${prefix}: scoperta, ${card.name}${feedbackLabel}`;
  }
  return `${prefix}: coperta${feedbackLabel}`;
}

function GameGrid({
  cards,
  onFlip,
  gridSize,
  isInputLocked = false,
  feedback = null,
  feedbackCardIds = [],
}) {
  return (
    <div
      className={`memory-grid memory-grid--${gridSize}`}
      role="grid"
      aria-label="Griglia di gioco"
    >
      {cards.map((card, index) => {
        const isRevealed = card.flipped || card.matched;
        const cardFeedback = feedbackCardIds.includes(card.id)
          ? feedback
          : null;
        const pokemonNumber = String(card.pairId).padStart(3, "0");

        const handleCardFlip = () => {
          if (!isInputLocked && !isRevealed) {
            onFlip(card.id);
          }
        };

        return (
          <span key={card.id} className="memory-grid__cell" role="gridcell">
            <button
              type="button"
              className={`memory-card ${isRevealed ? "memory-card--revealed" : ""} ${card.matched ? "memory-card--matched" : ""} ${cardFeedback ? `memory-card--${cardFeedback}` : ""}`}
              onClick={handleCardFlip}
              disabled={isInputLocked || isRevealed}
              aria-label={getCardLabel(
                card,
                index + 1,
                cards.length,
                cardFeedback,
              )}
              aria-pressed={isRevealed}
            >
              <span className="memory-card__inner">
                <span className="memory-card__front" aria-hidden={!isRevealed}>
                  <span className="memory-card__index">#{pokemonNumber}</span>
                  <img
                    src={card.image}
                    alt={isRevealed ? `${card.name}, Pokémon registrato` : ""}
                  />
                  <span className="memory-card__name">{card.name}</span>
                </span>
                <span className="memory-card__back" aria-hidden="true">
                  <span className="memory-card__ball">
                    <span className="memory-card__ball-button" />
                  </span>
                </span>
              </span>
              {card.matched ? (
                <span className="memory-card__matched" aria-hidden="true">
                  <span className="memory-card__matched-icon">✓</span>
                  <span>Registrato</span>
                </span>
              ) : null}
            </button>
          </span>
        );
      })}
    </div>
  );
}

export default GameGrid;
