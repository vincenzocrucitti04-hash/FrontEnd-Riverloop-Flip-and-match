import "./VictoryModal.css";
import Button from "../../atoms/Button/Button";

function VictoryModal({ isOpen, onClose, moves }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎉 Complimenti!</h2>
        </div>
        <div className="modal-body">
          <p className="victory-message">Bravo! Hai completato il gioco!</p>
          <div className="stats">
            <p className="moves-info">
              Hai completato il gioco in <strong>{moves}</strong> mosse
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button className="btn-close" onClick={onClose}>
            Chiudi
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VictoryModal;
