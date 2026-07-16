import "./GameLoader.css";

function GameLoader() {
  return (
    <div
      className="game-loader"
      role="status"
      aria-label="Caricamento Pokémon in corso"
    >
      <span className="game-loader__spinner" aria-hidden="true" />
    </div>
  );
}

export default GameLoader;
