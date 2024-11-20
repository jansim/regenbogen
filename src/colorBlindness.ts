// Color blindness simulation matrices
export const colorblindnessTypes = {
  protanopia: [
    0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0,
    0, 1, 0,
  ],
  deuteranopia: [
    0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0,
  ],
  tritanopia: [
    0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0,
    1, 0,
  ],
  achromatopsia: [
    0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114,
    0, 0, 0, 0, 0, 1, 0,
  ],
};

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

export const simulateColorBlindness = (color, type) => {
  if (type == "none") {
    return color;
  }
  if (!colorblindnessTypes[type]) {
    throw new Error(`Invalid color blindness type: ${type}`);
  }

  // Convert hex to RGB
  const [r, g, b] = hexToRgb(color);

  const matrix = colorblindnessTypes[type];

  // Apply color transformation
  const newR = matrix[0] * r + matrix[1] * g + matrix[2] * b + matrix[3];
  const newG = matrix[5] * r + matrix[6] * g + matrix[7] * b + matrix[8];
  const newB = matrix[10] * r + matrix[11] * g + matrix[12] * b + matrix[13];

  // Convert back to hex
  const toHex = (n) => {
    const intVal = Math.round(Math.max(0, Math.min(1, n)) * 255); // Clamp and scale
    return intVal.toString(16).padStart(2, "0");
  };

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

export const simulateColorBlindnessArray = (colors, type) => {
  return colors.map((color) => simulateColorBlindness(color, type));
};
