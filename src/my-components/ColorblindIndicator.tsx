import { Check, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { COLORBLIND_FRIENDLY_MIN_DIST } from "@/colorblindCheck";

// Check / cross indicating whether a palette is colorblind friendly
const ColorblindIndicator = ({
  friendly,
  minDist,
  className = "w-4 h-4",
}: {
  friendly: boolean;
  // Minimal color difference under simulated color vision deficiencies
  minDist?: number;
  className?: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span
        className="inline-flex items-center"
        aria-label={
          friendly ? "Colorblind friendly" : "Not colorblind friendly"
        }
      >
        {friendly ? (
          <Check className={`${className} text-green-600`} />
        ) : (
          <X className={`${className} text-gray-400`} />
        )}
      </span>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs font-normal">
      <p className="font-semibold">
        {friendly ? "Colorblind friendly" : "Not colorblind friendly"}
      </p>
      <p className="text-gray-500">
        {friendly
          ? "All colors stay distinguishable"
          : "Some colors are hard to tell apart"}{" "}
        with simulated deuteranopia, protanopia and tritanopia
        {minDist !== undefined && (
          <>
            {" "}
            (closest colors: ΔE {minDist.toFixed(1)}, needs ≥{" "}
            {COLORBLIND_FRIENDLY_MIN_DIST})
          </>
        )}
        .
      </p>
    </TooltipContent>
  </Tooltip>
);

export default ColorblindIndicator;
