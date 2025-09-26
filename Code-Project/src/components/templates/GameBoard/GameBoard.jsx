import GridControls from "../../molecule/GridControls/GridControls";
import RestartButton from "../../molecule/RestartButton/RestartButton";
import GameGrid from "../../organisms/GameGrid/GameGrid";
import useGameLogic from "../../../hooks/useGameLogic";
import "./GameBoard.css";

function GameBoard({ setMoves = () => {} }) {
  const { cards, gridSize, loading, setGridSize, handleFlip, handleRestart } =
    useGameLogic(setMoves);

  return (
    <main>
      <div className="background-gb" />

      <div className="container-game">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : cards.length === 0 ? (
          <div className="loading">No cards available</div>
        ) : (
          <GameGrid cards={cards} onFlip={handleFlip} gridSize={gridSize} />
        )}
        <GridControls setGridSize={setGridSize} />
        <RestartButton onRestart={handleRestart} />
      </div>
    </main>
  );
}

export default GameBoard;
