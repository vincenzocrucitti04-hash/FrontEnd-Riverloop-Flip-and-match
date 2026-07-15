import GridControls from "../../molecule/GridControls/GridControls";
import GameError from "../../molecule/GameError/GameError";
import GameStatus from "../../molecule/GameStatus/GameStatus";
import GameStats from "../../molecule/GameStats/GameStats";
import GameToolbar from "../../molecule/GameToolbar/GameToolbar";
import GameGrid from "../../organisms/GameGrid/GameGrid";
import VictoryModal from "../../molecule/VictoryModal/VictoryModal";
import TrainingInfo from "../../molecule/TrainingInfo/TrainingInfo";
import GameSkeleton from "../../organisms/GameSkeleton/GameSkeleton";
import useGameLogic from "../../../hooks/useGameLogic";
import { DECK_CATALOG } from "../../../config/deckCatalog";
import "./GameBoard.css";

function GameBoard({
  setMoves = () => {},
  moves = 0,
  initialOptions = null,
  onProfileUpdate = null,
  onHome = () => {},
}) {
  const {
    cards,
    announcement,
    elapsedMs,
    bestRecord,
    minimumMoves,
    combo,
    maxCombo,
    scoreResult,
    discoveredPokemon,
    deckId,
    feedback,
    feedbackCardIds,
    trainingMode,
    trainingInfo,
    gridSize,
    previewMs,
    loading,
    error,
    errorKind,
    isGameComplete,
    isInputLocked,
    setGridSize,
    setPreviewMs,
    setTrainingMode,
    dismissTrainingInfo,
    setDeckId,
    handleFlip,
    handleRestart,
    handleRetry,
    handleUseOfflineDeck,
    closeModal,
  } = useGameLogic(setMoves, moves, initialOptions, onProfileUpdate);

  return (
    <main>
      <div className="game-board__stage">
        <div className="background-gb" aria-hidden="true" />
        <div className="container-game">
          <GameToolbar
            contextLabel={`${gridSize} · ${DECK_CATALOG[deckId].label}`}
            onHome={onHome}
            onRestart={handleRestart}
            disabled={loading}
          />
          <GameStats
            elapsedMs={elapsedMs}
            minimumMoves={minimumMoves}
            bestRecord={bestRecord}
            combo={combo}
            moves={moves}
          />
          {loading ? (
            <GameSkeleton gridSize={gridSize} />
          ) : error ? (
            <GameError
              message={error}
              kind={errorKind}
              onRetry={handleRetry}
              onUseOfflineDeck={handleUseOfflineDeck}
            />
          ) : cards.length === 0 ? (
            <div className="loading">No cards available</div>
          ) : (
            <GameGrid
              cards={cards}
              onFlip={handleFlip}
              gridSize={gridSize}
              isInputLocked={isInputLocked}
              feedback={feedback}
              feedbackCardIds={feedbackCardIds}
            />
          )}
          <GameStatus message={announcement} feedback={feedback} />
          {trainingInfo ? (
            <TrainingInfo
              pokemonName={trainingInfo.name}
              fact={trainingInfo.fact}
              onDismiss={dismissTrainingInfo}
            />
          ) : null}
          <details className="game-settings">
            <summary>Impostazioni partita</summary>
            <div className="game-settings__panel">
              <GridControls
                gridSize={gridSize}
                previewMs={previewMs}
                disabled={loading}
                onGridSizeChange={setGridSize}
                onPreviewChange={setPreviewMs}
                trainingMode={trainingMode}
                onTrainingModeChange={setTrainingMode}
                deckId={deckId}
                onDeckChange={setDeckId}
              />
            </div>
          </details>
        </div>
      </div>

      <VictoryModal
        isOpen={isGameComplete}
        onClose={closeModal}
        moves={moves}
        maxCombo={maxCombo}
        difficulty={gridSize}
        scoreResult={scoreResult}
        discoveredPokemon={discoveredPokemon}
        onHome={onHome}
      />
    </main>
  );
}

export default GameBoard;
