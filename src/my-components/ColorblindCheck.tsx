import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isFriendlyDist, paletteCheck } from "@/colorblindCheck";
import ColorblindIndicator from "./ColorblindIndicator";

const formatDist = (x: number) => (Number.isFinite(x) ? x.toFixed(1) : "–");

// Full colorblindcheck::palette_check() results, only computed when shown
const ScoreTable = ({ colors }: { colors: string[] }) => {
  const check = useMemo(() => paletteCheck(colors), [colors]);

  return (
    <Table className="text-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Vision</TableHead>
          <TableHead className="text-right">Min ΔE</TableHead>
          <TableHead className="text-right">Mean ΔE</TableHead>
          <TableHead className="text-right">Max ΔE</TableHead>
          <TableHead
            className="text-right"
            title="Number of color pairs that are at least as different as the two most similar colors with normal vision"
          >
            Distinguishable pairs
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {check.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="capitalize py-2">{row.name}</TableCell>
            <TableCell className="py-2">
              <span className="flex items-center justify-end gap-1 font-mono">
                {formatDist(row.min_dist)}
                {row.name !== "normal" ? (
                  <ColorblindIndicator
                    friendly={isFriendlyDist(row.min_dist)}
                    minDist={row.min_dist}
                  />
                ) : (
                  <span className="w-4" />
                )}
              </span>
            </TableCell>
            <TableCell className="text-right font-mono py-2">
              {formatDist(row.mean_dist)}
            </TableCell>
            <TableCell className="text-right font-mono py-2">
              {formatDist(row.max_dist)}
            </TableCell>
            <TableCell className="text-right font-mono py-2">
              {row.ndcp} / {row.ncp}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Colorblind friendliness summary for a palette
const ColorblindCheck = ({
  colors,
  minDist,
}: {
  colors: string[];
  // Minimal color difference under simulated color vision deficiencies
  minDist: number;
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (colors.length < 2) return null;

  const friendly = isFriendlyDist(minDist);

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <ColorblindIndicator friendly={friendly} minDist={minDist} />
          {friendly ? "Colorblind friendly" : "Not colorblind friendly"}
        </span>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-900"
        >
          <ChevronRight
            className={`w-4 h-4 transition-transform ${showDetails ? "rotate-90" : ""}`}
          />
          {showDetails ? "Hide" : "Show"} detailed scores
        </button>
      </div>
      {showDetails && (
        <div className="mt-2 space-y-2">
          <ScoreTable colors={colors} />
          <p className="text-xs text-gray-500">
            Color differences (CIEDE2000) between all pairs of colors, computed
            following{" "}
            <a
              href="https://github.com/Nowosad/colorblindcheck"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              colorblindcheck::palette_check()
            </a>{" "}
            with simulations from{" "}
            <a
              href="https://colorspace.r-forge.r-project.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              colorspace
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
};

export default ColorblindCheck;
