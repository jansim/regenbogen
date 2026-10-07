import { useMemo } from "react";
import { CircleCheck, CircleAlert } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COLORBLIND_FRIENDLY_MIN_DIST, paletteCheck } from "@/colorblindCheck";

const formatDist = (x: number) => (Number.isFinite(x) ? x.toFixed(1) : "–");

// Summary of colorblindcheck::palette_check() results for a palette
const ColorblindCheck = ({ colors }: { colors: string[] }) => {
  const check = useMemo(() => paletteCheck(colors), [colors]);

  if (colors.length < 2) return null;

  const minCvdDist = Math.min(
    ...check.filter((row) => row.name !== "normal").map((row) => row.min_dist),
  );
  const friendly = minCvdDist >= COLORBLIND_FRIENDLY_MIN_DIST;

  return (
    <div className="space-y-2 mb-6">
      <div
        className={`flex items-start gap-2 text-sm ${friendly ? "text-green-700" : "text-amber-700"}`}
      >
        {friendly ? (
          <CircleCheck className="w-5 h-5 shrink-0" />
        ) : (
          <CircleAlert className="w-5 h-5 shrink-0" />
        )}
        <span>
          {friendly ? "Colorblind friendly" : "Not colorblind friendly"}: the
          two most similar colors have a difference of ΔE₀₀ ={" "}
          {formatDist(minCvdDist)} under simulated color vision deficiencies (
          {friendly ? "≥" : "<"} {COLORBLIND_FRIENDLY_MIN_DIST}).
        </span>
      </div>
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
              <TableCell
                className={`text-right font-mono py-2 ${row.name !== "normal" && row.min_dist < COLORBLIND_FRIENDLY_MIN_DIST ? "text-amber-700" : ""}`}
              >
                {formatDist(row.min_dist)}
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
  );
};

export default ColorblindCheck;
