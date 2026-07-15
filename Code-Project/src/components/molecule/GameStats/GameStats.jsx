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
  contextLabel = "",
}) {
  return (
    <div className="game-stats" role="group" aria-label="Statistiche partita">
      <span>Tempo: {formatTime(elapsedMs)}</span>
      {contextLabel ? (
        <span className="game-stats__context">{contextLabel}</span>
      ) : null}
      <span>Mosse: {moves}</span>
      <span>Minimo: {minimumMoves}</span>
      <span className={combo > 1 ? "game-stats__combo--active" : undefined}>
        Combo: ×{combo}
      </span>
      <span>
        {bestRecord
          ? `Record: ${formatTime(bestRecord.timeMs)} · ${bestRecord.moves} mosse`
          : "Record: —"}
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
