import "./GameGrid.css";

function GameGrid({ cards, onFlip, gridSize }) {
  return (
    <div className={`grid grid-${gridSize}`}>
      {cards.map((card) => (
        <div
          key={card.id}
          className={`card ${card.flipped ? "flipped" : ""}`}
          onClick={() => onFlip(card.id)}
        >
          <div className="card-inner">
            <div className="card-front">
              <img src={card.img} alt="pokemon" />
            </div>
            <div className="card-back">❓</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GameGrid;
