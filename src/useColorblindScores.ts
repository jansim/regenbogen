import { useEffect, useState } from "react";
import { colorblindScore, type ColorblindScore } from "./colorblindCheck";

interface PaletteInput {
  id: string;
  colors: string[];
}

// Compute colorblind scores for all palettes in the background
export const useColorblindScores = (palettes: PaletteInput[]) => {
  const [scores, setScores] = useState<Map<string, ColorblindScore>>(
    () => new Map(),
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    const input = palettes.map(({ id, colors }) => ({ id, colors }));
    const addScores = (newScores: [string, ColorblindScore][]) =>
      setScores((prev) => new Map([...prev, ...newScores]));

    if (typeof Worker === "undefined") {
      // Fallback: compute on the main thread
      addScores(input.map((p) => [p.id, colorblindScore(p.colors)]));
      setDone(true);
      return;
    }

    const worker = new Worker(
      new URL("./colorblindWorker.ts", import.meta.url),
      { type: "module" },
    );
    worker.onmessage = (event) => {
      addScores(event.data.scores);
      if (event.data.done) {
        setDone(true);
        worker.terminate();
      }
    };
    worker.postMessage(input);

    return () => worker.terminate();
  }, [palettes]);

  return { scores, done };
};
