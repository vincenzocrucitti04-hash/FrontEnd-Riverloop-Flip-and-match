import { getGridConfig } from "../../../utils/gameLogic";
import "./GameSkeleton.css";

function GameSkeleton({ gridSize }) {
  const { totalCards, columns } = getGridConfig(gridSize);

  return (
    <div className="game-skeleton" role="status">
      <span className="game-skeleton__label">Preparazione del mazzo…</span>
      <div
        className="game-skeleton__grid"
        style={{ "--skeleton-columns": columns }}
        aria-hidden="true"
      >
        {Array.from({ length: totalCards }, (_, index) => (
          <span key={index} data-testid="skeleton-card" />
        ))}
      </div>
    </div>
  );
}

export default GameSkeleton;
