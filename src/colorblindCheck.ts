// Empirical colorblind-safety check for palettes.
//
// This is a port of `colorblindcheck::palette_check()` (Nowosad) to run in the
// browser. Colors are run through the color vision deficiency (CVD)
// simulations of `colorspace::deutan()`, `protan()` and `tritan()` (Machado et
// al. 2009, severity = 1) and the pairwise CIEDE2000 distances between all
// colors of a palette are computed, exactly as done in the R package (incl.
// the `spacesXYZ::DeltaE()` implementation of CIEDE2000). Results match the R
// implementation up to floating point precision.
//
// The same simulations are used to render palettes as seen with color vision
// deficiencies, so what is shown always matches what is scored.

export type CvdType = "normal" | "deuteranopia" | "protanopia" | "tritanopia";

export const cvdTypes: CvdType[] = [
  "normal",
  "deuteranopia",
  "protanopia",
  "tritanopia",
];

export interface PaletteCheckRow {
  name: CvdType;
  // number of colors
  n: number;
  // minimal value of acceptable difference between colors
  tolerance: number;
  // number of color pairs
  ncp: number;
  // number of differentiable color pairs (distance >= tolerance)
  ndcp: number;
  min_dist: number;
  mean_dist: number;
  max_dist: number;
}

type Matrix3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

// Machado et al. (2009) matrices for severity = 1, as used in {colorspace}
const cvdMatrices: Record<Exclude<CvdType, "normal">, Matrix3> = {
  deuteranopia: [
    0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182,
    0.04294, 0.968881,
  ],
  protanopia: [
    0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882,
    -0.048116, 1.051998,
  ],
  tritanopia: [
    1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733,
    0.691367, 0.3039,
  ],
};

const parseHex = (hex: string): [number, number, number] => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

// sRGB (0-255) <-> linear RGB (0-255), as in colorspace::simulate_cvd()
const sRgbToLinear = (x: number): number => {
  const v = x / 255;
  return (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4) * 255;
};
const linearToSRgb = (y: number): number => {
  const v = y / 255;
  return (
    (v <= 0.03928 / 12.92 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255
  );
};

// Simulate a color vision deficiency, returns sRGB values (0-255, rounded)
const simulateCvdRgb = (
  rgb: [number, number, number],
  matrix: Matrix3,
): [number, number, number] => {
  const [r, g, b] = rgb.map(sRgbToLinear);
  const m = matrix;
  return [
    m[0] * r + m[1] * g + m[2] * b,
    m[3] * r + m[4] * g + m[5] * b,
    m[6] * r + m[7] * g + m[8] * b,
  ].map((v) => Math.round(linearToSRgb(Math.min(255, Math.max(0, v))))) as [
    number,
    number,
    number,
  ];
};

// sRGB (0-255) -> CIE Lab (D65), as in colorspace's C code
const KAPPA = 24389 / 27;
const EPSILON = 216 / 24389;
const XN = 95.047;
const YN = 100;
const ZN = 108.883;

const ftrans = (u: number) =>
  u > 0.03928 ? ((u + 0.055) / 1.055) ** 2.4 : u / 12.92;
const labF = (t: number) =>
  t > EPSILON ? Math.cbrt(t) : (KAPPA / 116) * t + 16 / 116;

type Lab = [number, number, number];

const rgbToLab = ([R, G, B]: [number, number, number]): Lab => {
  const r = ftrans(R / 255);
  const g = ftrans(G / 255);
  const b = ftrans(B / 255);
  const X = YN * (0.412453 * r + 0.35758 * g + 0.180423 * b);
  const Y = YN * (0.212671 * r + 0.71516 * g + 0.072169 * b);
  const Z = YN * (0.019334 * r + 0.119193 * g + 0.950227 * b);
  const yr = Y / YN;
  const L = yr > EPSILON ? 116 * Math.cbrt(yr) - 16 : KAPPA * yr;
  const xt = labF(X / XN);
  const yt = labF(yr);
  const zt = labF(Z / ZN);
  return [L, 500 * (xt - yt), 200 * (yt - zt)];
};

// Complete color blindness: remove all chroma but keep the luminance, as in
// colorspace::desaturate(). Returns sRGB values (0-255, rounded).
const desaturateRgb = (rgb: [number, number, number]) => {
  const [L] = rgbToLab(rgb);
  const Y = L > 8 ? ((L + 16) / 116) ** 3 : L / KAPPA;
  const grey = Math.round(linearToSRgb(Math.min(1, Y) * 255));
  return [grey, grey, grey] as [number, number, number];
};

export type SimulationType = Exclude<CvdType, "normal"> | "achromatopsia";

const simulateRgb = (
  rgb: [number, number, number],
  type: SimulationType | "normal" | "none",
): [number, number, number] => {
  if (type === "normal" || type === "none") return rgb;
  if (type === "achromatopsia") return desaturateRgb(rgb);
  return simulateCvdRgb(rgb, cvdMatrices[type]);
};

const toHex = (rgb: [number, number, number]) =>
  `#${rgb.map((v) => v.toString(16).padStart(2, "0").toUpperCase()).join("")}`;

// Simulate how a color is seen with a color vision deficiency
export const simulateColor = (
  hex: string,
  type: SimulationType | "normal" | "none",
): string =>
  type === "normal" || type === "none"
    ? hex
    : toHex(simulateRgb(parseHex(hex), type));

const TWO_PI = 2 * Math.PI;
const DEG = Math.PI / 180;
const POW25_7 = 25 ** 7;
const mod2pi = (x: number) => ((x % TWO_PI) + TWO_PI) % TWO_PI;

// CIEDE2000, following spacesXYZ:::DeltaE.2000()
export const deltaE2000 = (lab1: Lab, lab2: Lab): number => {
  const Lbar = (lab1[0] + lab2[0]) / 2;

  let C1 = Math.hypot(lab1[1], lab1[2]);
  let C2 = Math.hypot(lab2[1], lab2[2]);
  let Cbar = (C1 + C2) / 2;

  let g = Math.sqrt(Cbar ** 7 / (Cbar ** 7 + POW25_7));
  const G = (1 - g) / 2;

  const a1 = lab1[1] * (1 + G);
  const a2 = lab2[1] * (1 + G);

  C1 = Math.hypot(a1, lab1[2]);
  C2 = Math.hypot(a2, lab2[2]);
  Cbar = (C1 + C2) / 2;

  const h1 = mod2pi(Math.atan2(lab1[2], a1));
  const h2 = mod2pi(Math.atan2(lab2[2], a2));

  let Hbar = (h1 + h2) / 2;
  let hdelta = h2 - h1;
  if (Math.PI < Math.abs(h1 - h2)) {
    Hbar = Hbar + Math.PI;
    hdelta = hdelta - Math.sign(hdelta) * TWO_PI;
  }

  const T =
    1 -
    0.17 * Math.cos(Hbar - 30 * DEG) +
    0.24 * Math.cos(2 * Hbar) +
    0.32 * Math.cos(3 * Hbar + 6 * DEG) -
    0.2 * Math.cos(4 * Hbar - 63 * DEG);

  const Ldelta = lab2[0] - lab1[0];
  const Cdelta = C2 - C1;
  const Hdelta = 2 * Math.sqrt(C1 * C2) * Math.sin(hdelta / 2);

  const SLsq = (Lbar - 50) ** 2;
  const SL = 1 + (0.015 * SLsq) / Math.sqrt(20 + SLsq);
  const SC = 1 + 0.045 * Cbar;
  const SH = 1 + 0.015 * Cbar * T;

  const thetaDelta =
    30 * DEG * Math.exp(-((((Hbar * 180) / Math.PI - 275) / 25) ** 2));

  g = Math.sqrt(Cbar ** 7 / (Cbar ** 7 + POW25_7));
  const RC = 2 * g;
  const RT = -RC * Math.sin(2 * thetaDelta);

  const Lterm = Ldelta / SL;
  const Cterm = Cdelta / SC;
  const Hterm = Hdelta / SH;

  return Math.sqrt(Lterm ** 2 + Cterm ** 2 + Hterm ** 2 + RT * Cterm * Hterm);
};

// Pairwise distances (upper triangle, flattened) between colors of a palette
export const paletteDist = (
  colors: string[],
  cvd: CvdType | "achromatopsia" = "normal",
): number[] => {
  const labs = colors.map((hex) => rgbToLab(simulateRgb(parseHex(hex), cvd)));
  const dists: number[] = [];
  for (let i = 0; i < labs.length; i++) {
    for (let j = i + 1; j < labs.length; j++) {
      dists.push(deltaE2000(labs[i], labs[j]));
    }
  }
  return dists;
};

const summarise = (dists: number[]) => {
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  for (const d of dists) {
    if (d < min) min = d;
    if (d > max) max = d;
    sum += d;
  }
  return { min, max, mean: sum / dists.length };
};

// Port of colorblindcheck::palette_check()
export const paletteCheck = (
  colors: string[],
  tolerance?: number,
): PaletteCheckRow[] => {
  const n = colors.length;
  const ncp = (n * (n - 1)) / 2;
  const dists = cvdTypes.map((cvd) => paletteDist(colors, cvd));
  const tol = tolerance ?? summarise(dists[0]).min;

  return cvdTypes.map((name, i) => {
    const { min, max, mean } = summarise(dists[i]);
    return {
      name,
      n,
      tolerance: tol,
      ncp,
      ndcp: ncp - dists[i].filter((d) => d < tol).length,
      min_dist: min,
      mean_dist: mean,
      max_dist: max,
    };
  });
};

// Minimal ΔE2000 difference between colors a palette is required to have
// under all simulated color vision deficiencies to be considered colorblind
// friendly. The value was chosen such that the Okabe-Ito palette, the de facto
// standard for colorblind safe palettes, passes (its closest pair, reddish
// purple vs. grey under deuteranopia, has a difference of 6.4), while e.g.
// Tableau 10 or ColorBrewer's Set1 / Set2 / Dark2 / Paired clearly fail.
export const COLORBLIND_FRIENDLY_MIN_DIST = 6.4;

export interface ColorblindScore {
  // Minimal distance between any two colors with normal vision
  normal: number;
  // Minimal distance between any two colors under each CVD simulation
  deuteranopia: number;
  protanopia: number;
  tritanopia: number;
  // Minimal distance across all CVD simulations
  cvd: number;
}

// Compact score used for filtering palettes
export const colorblindScore = (colors: string[]): ColorblindScore => {
  const [normal, deuteranopia, protanopia, tritanopia] = cvdTypes.map((cvd) =>
    colors.length < 2 ? Infinity : summarise(paletteDist(colors, cvd)).min,
  );
  return {
    normal,
    deuteranopia,
    protanopia,
    tritanopia,
    cvd: Math.min(deuteranopia, protanopia, tritanopia),
  };
};

// The two most similar colors of a palette under a given simulation
export const closestPair = (
  colors: string[],
  type: CvdType | "achromatopsia",
): { i: number; j: number; dist: number } | null => {
  const dists = paletteDist(colors, type);
  if (dists.length === 0) return null;
  let best = { i: 0, j: 1, dist: Infinity };
  let k = 0;
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++, k++) {
      if (dists[k] < best.dist) best = { i, j, dist: dists[k] };
    }
  }
  return best;
};

export const isColorblindFriendly = (
  score: ColorblindScore,
  minDist = COLORBLIND_FRIENDLY_MIN_DIST,
) => score.cvd >= minDist;
