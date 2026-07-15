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
    <div className={`grid grid-${gridSize}`} aria-label="Griglia di gioco">
      {cards.map((card, index) => {
        const isRevealed = card.flipped || card.matched;
        const cardFeedback = feedbackCardIds.includes(card.id)
          ? feedback
          : null;

        return (
          <button
            type="button"
            key={card.id}
            className={`card ${isRevealed ? "flipped" : ""} ${cardFeedback ? `card--${cardFeedback}` : ""}`}
            onClick={() => onFlip(card.id)}
            disabled={isInputLocked || isRevealed}
            aria-label={getCardLabel(
              card,
              index + 1,
              cards.length,
              cardFeedback,
            )}
            aria-pressed={isRevealed}
          >
            <span className="card-inner">
              <span className="card-front">
                <img
                  src={card.image}
                  alt={isRevealed ? `Carta scoperta: ${card.name}` : ""}
                />
              </span>
              <span className="card-back" aria-hidden="true">
                ❓
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default GameGrid;
