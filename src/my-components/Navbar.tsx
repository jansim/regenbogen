import PaletteArc from "./PaletteArc";
import { Github } from "lucide-react";

export const Navbar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Regenbogen
            <div className="w-12 ml-2 inline-block">
              <PaletteArc width={60} arcWidth={11} />
            </div>
          </h1>
          <a
            href="https://github.com/jansim/regenbogen"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-black hover:scale-110 transition-all duration-200 ease-in-out"
          >
            <Github size={24} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
