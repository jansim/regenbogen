import { resizeArray } from "@/resizeArray";
import svgTemplates from "./svgTemplates";

const Plot = ({
  colors = ["#0000F0", "#00FF00", "#00F000", "#FF0000", "#F00000"],
  type = "bar",
}) => {
  if (!svgTemplates[type]) {
    console.warn(`Unsupported plot type: ${type}`);
    return null;
  }

  if (colors.length < 1) {
    console.warn("At least one color is required");
    return null;
  }

  const effectiveColors = resizeArray(colors, 5);

  const modifiedSvg = svgTemplates[type]
    .replaceAll("#0000F0", effectiveColors[0])
    .replaceAll("#00FF00", effectiveColors[1])
    .replaceAll("#00F000", effectiveColors[2])
    .replaceAll("#FF0000", effectiveColors[3])
    .replaceAll("#F00000", effectiveColors[4]);

  return (
    <div
      className="svg-plot"
      dangerouslySetInnerHTML={{ __html: modifiedSvg }}
    />
  );
};

export default Plot;
