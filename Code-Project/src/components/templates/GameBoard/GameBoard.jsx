import GridControls from "../../molecule/GridControls/GridControls";
import GameError from "../../molecule/GameError/GameError";
import GameStatus from "../../molecule/GameStatus/GameStatus";
import GameStats from "../../molecule/GameStats/GameStats";
import GameToolbar from "../../molecule/GameToolbar/GameToolbar";
import GameGrid from "../../organisms/GameGrid/GameGrid";
import VictoryModal from "../../molecule/VictoryModal/VictoryModal";
import TrainingInfo from "../../molecule/TrainingInfo/TrainingInfo";
import GameLoader from "../../organisms/GameLoader/GameLoader";
import useGameLogic from "../../../hooks/useGameLogic";
import { DECK_CATALOG } from "../../../config/deckCatalog";
import "./GameBoard.css";

function GameBoard({
  setMoves = () => {},
  moves = 0,
  initialOptions = null,
  onProfileUpdate = null,
  onHome = () => {},
  onCompletedHome = () => {},
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
    <main className="scan-console">
      <section className="scan-console__frame" aria-label="Console di gioco">
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
        <div className="scan-console__viewport">
          {loading ? (
            <GameLoader />
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
        </div>
        <div
          className={`scan-console__feedback ${
            trainingMode ? "scan-console__feedback--training" : ""
          }`}
        >
          <GameStatus message={announcement} feedback={feedback} />
          {trainingInfo ? (
            <TrainingInfo
              pokemonName={trainingInfo.name}
              fact={trainingInfo.fact}
              onDismiss={dismissTrainingInfo}
            />
          ) : null}
        </div>
        <details className="scan-console__settings">
          <summary>Parametri partita</summary>
          <div className="scan-console__settings-panel">
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
      </section>

      <VictoryModal
        isOpen={isGameComplete}
        onClose={closeModal}
        moves={moves}
        elapsedMs={elapsedMs}
        maxCombo={maxCombo}
        difficulty={gridSize}
        scoreResult={scoreResult}
        discoveredPokemon={discoveredPokemon}
        onHome={onCompletedHome}
      />
    </main>
  );
}

export default GameBoard;
