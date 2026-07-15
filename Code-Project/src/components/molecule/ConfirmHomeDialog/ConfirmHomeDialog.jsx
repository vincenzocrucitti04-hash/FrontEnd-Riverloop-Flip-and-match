import { useEffect, useRef } from "react";
import Button from "../../atoms/Button/Button";
import "./ConfirmHomeDialog.css";

function ConfirmHomeDialog({ isOpen, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current = document.activeElement;
    cancelButtonRef.current?.focus();

    return () => {
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = dialogRef.current.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (
      (event.shiftKey && document.activeElement === firstElement) ||
      (!event.shiftKey && document.activeElement === lastElement)
    ) {
      event.preventDefault();
      (event.shiftKey ? lastElement : firstElement)?.focus();
    }
  };

  return (
    <div
      className="confirm-home__overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="confirm-home"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-home-title"
        aria-describedby="confirm-home-description"
        onKeyDown={handleKeyDown}
      >
        <span className="confirm-home__stamp" aria-hidden="true">
          Pausa percorso
        </span>
        <h2 id="confirm-home-title">Abbandonare la spedizione?</h2>
        <p id="confirm-home-description">
          I progressi di questa partita non verranno salvati.
        </p>
        <div className="confirm-home__actions">
          <Button
            ref={cancelButtonRef}
            type="button"
            className="confirm-home__continue"
            onClick={onCancel}
          >
            Continua a giocare
          </Button>
          <Button
            type="button"
            className="confirm-home__leave"
            onClick={onConfirm}
            aria-label="Conferma ritorno alla base"
          >
            Torna alla base
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmHomeDialog;
