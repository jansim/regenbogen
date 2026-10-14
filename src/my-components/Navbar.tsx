import PaletteArc from "./PaletteArc";
import { Github } from "lucide-react";
import PlotTypeSelect from "./PlotTypeSelect";

export const Navbar = ({ plotType, onPlotTypeChange }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2">
          <h1 className="flex items-center text-xl min-[400px]:text-2xl sm:text-3xl font-bold whitespace-nowrap">
            Regenbogen
            <div className="w-6 min-[360px]:w-9 min-[400px]:w-10 sm:w-[60px] ml-1.5 sm:ml-2 shrink-0">
              <PaletteArc width={60} arcWidth={11} />
            </div>
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <PlotTypeSelect value={plotType} onValueChange={onPlotTypeChange} />
            <a
              href="https://github.com/jansim/regenbogen"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-[360px]:block text-gray-700 hover:text-black hover:scale-110 transition-all duration-200 ease-in-out"
            >
              <Github size={24} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
