import { simulateColorBlindness } from "@/colorBlindness";

const ColorblindPreview = ({ colors, type }) => {
  const simulatedColors = colors.map((color) =>
    simulateColorBlindness(color, type),
  );

  return (
    <div className="space-y-2">
      <div className="flex h-16 rounded-md overflow-hidden">
        {simulatedColors.map((color, index) => (
          <div
            key={index}
            className="flex-1 h-full"
            style={{ backgroundColor: color }}
            title={`Original: ${colors[index]}\nSimulated: ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorblindPreview;
