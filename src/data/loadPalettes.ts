// Palettes are stored in a compact format to keep the download small, see
// R/extract_palettes.R. The file is fetched separately from the code, so it is
// cached independently of code changes.
import palettesUrl from "./palettes.json?url";

type PaletteType = "qualitative" | "divergent" | "sequential";

export interface Palette {
  id: string;
  package: string;
  palette: string;
  type: PaletteType;
  colors: string[];
  length: number;
  gh: string | null;
  cran: boolean;
  pltr: boolean;
  // Colorblind safety score (minimal ΔE2000 under simulated CVDs, times 10)
  cvd?: number;
}

type CompactPalette = [string, "q" | "d" | "s", string, number | null];

interface CompactPackage {
  gh: string | null;
  cran: 0 | 1;
  pltr: 0 | 1;
  palettes: CompactPalette[];
}

const typeNames: Record<CompactPalette[1], PaletteType> = {
  q: "qualitative",
  d: "divergent",
  s: "sequential",
};

export const decodePalettes = (
  data: Record<string, CompactPackage>,
): Palette[] =>
  Object.entries(data).flatMap(([pkg, meta]) =>
    meta.palettes.map(([palette, type, hex, cvd]) => {
      const colors = hex.match(/.{6}/g)!.map((color) => `#${color}`);
      return {
        id: `${pkg}::${palette}`,
        package: pkg,
        palette,
        type: typeNames[type],
        colors,
        length: colors.length,
        gh: meta.gh,
        cran: meta.cran === 1,
        pltr: meta.pltr === 1,
        cvd: cvd ?? undefined,
      };
    }),
  );

// Start downloading as soon as this module is evaluated
const palettesPromise: Promise<Palette[]> = fetch(palettesUrl)
  .then((response) => {
    if (!response.ok) throw new Error(`Failed to load palettes (${response.status})`);
    return response.json();
  })
  .then(decodePalettes);

export const loadPalettes = () => palettesPromise;
