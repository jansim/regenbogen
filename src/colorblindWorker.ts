// Web worker computing colorblind scores for all palettes off the main thread
import { colorblindScore, type ColorblindScore } from "./colorblindCheck";

interface PaletteInput {
  id: string;
  colors: string[];
}

self.onmessage = (event: MessageEvent<PaletteInput[]>) => {
  // Small palettes are cheap, so check them first to have results quickly
  const palettes = [...event.data].sort(
    (a, b) => a.colors.length - b.colors.length,
  );

  let batch: [string, ColorblindScore][] = [];
  let lastPost = performance.now();
  for (const palette of palettes) {
    batch.push([palette.id, colorblindScore(palette.colors)]);
    if (performance.now() - lastPost > 100) {
      self.postMessage({ scores: batch, done: false });
      batch = [];
      lastPost = performance.now();
    }
  }
  self.postMessage({ scores: batch, done: true });
};
