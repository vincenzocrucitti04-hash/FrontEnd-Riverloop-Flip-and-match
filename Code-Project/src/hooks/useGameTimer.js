import { useEffect, useState } from "react";

const ACTIVE_PHASES = new Set(["playing", "resolvingPair"]);

export default function useGameTimer(phase) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (phase === "loading") {
      setElapsedMs(0);
      return;
    }

    if (!ACTIVE_PHASES.has(phase)) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedMs((currentTime) => currentTime + 1000);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [phase]);

  return elapsedMs;
}
