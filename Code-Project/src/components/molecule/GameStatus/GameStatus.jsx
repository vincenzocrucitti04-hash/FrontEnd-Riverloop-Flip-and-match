import "./GameStatus.css";

function GameStatus({ message, feedback = null }) {
  return (
    <div
      className={`game-status ${feedback ? `game-status--${feedback}` : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}

export default GameStatus;
