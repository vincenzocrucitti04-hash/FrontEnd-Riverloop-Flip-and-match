import { useEffect, useRef, useState } from "react";

const ACTIVE_PHASES = new Set(["playing", "resolvingPair"]);

export default function useGameTimer(phase) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const elapsedRef = useRef(0);
  const activeSinceRef = useRef(null);

  useEffect(() => {
    const now = Date.now();

    if (phase === "loading") {
      elapsedRef.current = 0;
      activeSinceRef.current = null;
      setElapsedMs(0);
      return;
    }

    if (ACTIVE_PHASES.has(phase)) {
      if (activeSinceRef.current !== null) {
        elapsedRef.current += now - activeSinceRef.current;
        setElapsedMs(elapsedRef.current);
      }
      activeSinceRef.current = now;
      return;
    }

    if (activeSinceRef.current !== null) {
      elapsedRef.current += now - activeSinceRef.current;
      activeSinceRef.current = null;
      setElapsedMs(elapsedRef.current);
    }
  }, [phase]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (activeSinceRef.current === null) {
        return;
      }

      const now = Date.now();
      elapsedRef.current += now - activeSinceRef.current;
      activeSinceRef.current = now;
      setElapsedMs(elapsedRef.current);
    }, 250);

    return () => clearInterval(intervalId);
  }, []);

  return elapsedMs;
}
