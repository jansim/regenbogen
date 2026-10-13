import { useMemo } from "react";
import { simulateColorBlindness } from "@/colorBlindness";
import { closestPair } from "@/colorblindCheck";

const ColorblindPreview = ({ colors, type }) => {
  const simulatedColors = colors.map((color) =>
    simulateColorBlindness(color, type),
  );
  const pair = useMemo(() => closestPair(colors, type), [colors, type]);

  return (
    <div className="space-y-2">
      <div className="flex h-16 rounded-md overflow-hidden">
        {simulatedColors.map((color, index) => (
          <div
            key={index}
            className="flex-1 h-full relative"
            style={{ backgroundColor: color }}
            title={`Original: ${colors[index]}\nSimulated: ${color}`}
          >
            {pair && (index === pair.i || index === pair.j) && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white ring-1 ring-black/60" />
            )}
          </div>
        ))}
      </div>
      {pair && (
        <div className="text-sm text-gray-500">
          Most similar colors (marked): {colors[pair.i]} and {colors[pair.j]}
        </div>
      )}
    </div>
  );
};

export default ColorblindPreview;
