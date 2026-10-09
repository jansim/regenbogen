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
          friendly
            ? "Likely colorblind friendly"
            : "Potentially not colorblind friendly"
        }
      >
        {friendly ? (
          <Check className={`${className} text-gray-400`} />
        ) : (
          <X className={`${className} text-gray-400`} />
        )}
      </span>
    </TooltipTrigger>
    <TooltipContent className="max-w-xs font-normal">
      <p className="font-semibold">
        {friendly
          ? "Likely colorblind friendly"
          : "Potentially not colorblind friendly"}
      </p>
      <p className="text-gray-500">
        {friendly
          ? "All colors should stay distinguishable"
          : "Some colors may be hard to tell apart"}{" "}
        with simulated deuteranopia, protanopia and tritanopia
        {minDist !== undefined && (
          <>
            {" "}
            (closest colors: ΔE {minDist.toFixed(1)}, rule of thumb: ≥{" "}
            {COLORBLIND_FRIENDLY_MIN_DIST})
          </>
        )}
        .
      </p>
    </TooltipContent>
  </Tooltip>
);

export default ColorblindIndicator;
