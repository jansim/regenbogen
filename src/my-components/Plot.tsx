import { useEffect, useState } from "react";
import { resizeArray } from "@/resizeArray";

// The plot templates are large, so they are only loaded once a plot is shown
let svgTemplates: Record<string, string> | null = null;
let svgTemplatesPromise: Promise<Record<string, string>> | null = null;
const loadSvgTemplates = () => {
  svgTemplatesPromise ??= import("./svgTemplates").then(
    (module) => (svgTemplates = module.default),
  );
  return svgTemplatesPromise;
};

const Plot = ({
  colors = ["#0000F0", "#00FF00", "#00F000", "#FF0000", "#F00000"],
  type = "bar",
}) => {
  const [loaded, setLoaded] = useState(svgTemplates !== null);

  useEffect(() => {
    if (!loaded) loadSvgTemplates().then(() => setLoaded(true));
  }, [loaded]);

  if (!svgTemplates) {
    // Placeholder with the same aspect ratio as the plots
    return <div className="w-full" style={{ aspectRatio: "570 / 473" }} />;
  }

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
    .replace(/#0000F0/g, effectiveColors[0])
    .replace(/#00FF00/g, effectiveColors[1])
    .replace(/#00F000/g, effectiveColors[2])
    .replace(/#FF0000/g, effectiveColors[3])
    .replace(/#F00000/g, effectiveColors[4]);

  return (
    <div
      className="svg-plot"
      dangerouslySetInnerHTML={{ __html: modifiedSvg }}
    />
  );
};

export default Plot;
