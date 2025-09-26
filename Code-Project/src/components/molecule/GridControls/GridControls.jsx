import Button from "../../atoms/Button/Button";

function GridControls({ setGridSize }) {
  return (
    <div className="grid-controls">
      <div className="btn-grid-border">
        <div className="btn-grid-base">
          <Button className="btn-grid" onClick={() => setGridSize("4x4")}>
            4x4
          </Button>
          <Button className="btn-grid" onClick={() => setGridSize("6x6")}>
            6x6
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GridControls;
