import "./GameStats.css";

function formatTime(timeMs) {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function GameStats({
  elapsedMs,
  minimumMoves,
  bestRecord,
  combo = 0,
  moves = 0,
}) {
  return (
    <div className="game-stats" role="group" aria-label="Statistiche partita">
      <span className="game-stats__item">
        <span className="game-stats__label">Tempo</span>
        <span className="game-stats__value game-stats__value--time">
          {formatTime(elapsedMs)}
        </span>
      </span>
      <span className="game-stats__item">
        <span className="game-stats__label">Mosse</span>
        <span className="game-stats__value">{moves}</span>
      </span>
      <span className="game-stats__item">
        <span className="game-stats__label">Minimo</span>
        <span className="game-stats__value">{minimumMoves}</span>
      </span>
      <span className="game-stats__item">
        <span className="game-stats__label">Combo</span>
        <span
          className={`game-stats__value ${combo > 1 ? "game-stats__combo--active" : ""}`}
        >
          ×{combo}
        </span>
      </span>
      <span className="game-stats__item game-stats__item--record">
        <span className="game-stats__label">Record</span>
        <span className="game-stats__value">
          {bestRecord
            ? `${formatTime(bestRecord.timeMs)} · ${bestRecord.moves} mosse`
            : "—"}
        </span>
      </span>
      <span
        className="game-stats__announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {moves} mosse. Combo {combo}.
      </span>
    </div>
  );
}

export default GameStats;
