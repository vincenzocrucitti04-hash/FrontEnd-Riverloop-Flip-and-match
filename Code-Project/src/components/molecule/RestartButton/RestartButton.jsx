import Button from "../../atoms/Button/Button";

function RestartButton({ onRestart }) {
  return (
    <div className="restart-btn">
      <div className="btn-grid-border">
        <div className="btn-grid-base">
          <Button className="btn-grid" onClick={onRestart}>
            Restart
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RestartButton;
