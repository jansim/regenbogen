import { useMemo } from "react";
import { simulateColorBlindness } from "@/colorBlindness";
import { closestPair, COLORBLIND_FRIENDLY_MIN_DIST } from "@/colorblindCheck";

const ColorblindPreview = ({ colors, type }) => {
  const simulatedColors = colors.map((color) =>
    simulateColorBlindness(color, type),
  );
  const pair = useMemo(() => closestPair(colors, type), [colors, type]);
  // Achromatopsia is not part of the colorblind friendly criterion
  const checked = type !== "achromatopsia";
  const tooClose = checked && pair && pair.dist < COLORBLIND_FRIENDLY_MIN_DIST;

  return (
    <div className="space-y-2">
      <div className="flex h-16 rounded-md overflow-hidden">
        {simulatedColors.map((color, index) => {
          const isClosest = pair && (index === pair.i || index === pair.j);
          return (
            <div
              key={index}
              className="flex-1 h-full relative"
              style={{ backgroundColor: color }}
              title={`Original: ${colors[index]}\nSimulated: ${color}`}
            >
              {isClosest && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white ring-1 ring-black/60" />
              )}
            </div>
          );
        })}
      </div>
      {pair && (
        <div className="text-sm">
          <span className="text-gray-500">Minimum color difference: </span>
          <span
            className={`font-mono font-semibold ${tooClose ? "text-amber-700" : checked ? "text-green-700" : "text-gray-700"}`}
          >
            ΔE₀₀ {pair.dist.toFixed(1)}
          </span>
          <span className="text-gray-500">
            {" "}
            between {colors[pair.i]} and {colors[pair.j]} (marked)
            {checked &&
              (tooClose
                ? `, below the threshold of ${COLORBLIND_FRIENDLY_MIN_DIST}`
                : `, meets the threshold of ${COLORBLIND_FRIENDLY_MIN_DIST}`)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ColorblindPreview;
