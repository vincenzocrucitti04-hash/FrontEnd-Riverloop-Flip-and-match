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
    <>
      <dl className="game-stats" role="group" aria-label="Telemetria partita">
        <div className="game-stats__item">
          <dt className="game-stats__label">Tempo</dt>
          <dd className="game-stats__value game-stats__value--time">
            {formatTime(elapsedMs)}
          </dd>
        </div>
        <div className="game-stats__item">
          <dt className="game-stats__label">Mosse</dt>
          <dd className="game-stats__value">{moves}</dd>
        </div>
        <div className="game-stats__item">
          <dt className="game-stats__label">Minimo</dt>
          <dd className="game-stats__value">{minimumMoves}</dd>
        </div>
        <div className="game-stats__item">
          <dt className="game-stats__label">Combo</dt>
          <dd
            className={`game-stats__value ${combo > 1 ? "game-stats__combo--active" : ""}`}
          >
            ×{combo}
          </dd>
        </div>
        <div className="game-stats__item game-stats__item--record">
          <dt className="game-stats__label">Record</dt>
          <dd className="game-stats__value">
            {bestRecord
              ? `${formatTime(bestRecord.timeMs)} · ${bestRecord.moves} mosse`
              : "—"}
          </dd>
        </div>
      </dl>
      <span
        className="game-stats__announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {moves} mosse. Combo {combo}.
      </span>
    </>
  );
}

export default GameStats;
