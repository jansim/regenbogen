import { simulateColor } from "./colorblindCheck";

export const hexToRgb = (hex, float = true) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (float) {
    return [r / 255, g / 255, b / 255];
  } else {
    return [r, g, b];
  }
};

// Simulations are shared with the colorblind safety check, so palettes are
// rendered exactly as they are scored.
const simulationTypes = [
  "none",
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "achromatopsia",
];

export const simulateColorBlindness = (color, type) => {
  if (!simulationTypes.includes(type)) {
    throw new Error(`Invalid color blindness type: ${type}`);
  }
  return simulateColor(color, type);
};

export const simulateColorBlindnessArray = (colors, type) => {
  return colors.map((color) => simulateColorBlindness(color, type));
};
