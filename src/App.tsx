import "./App.css";
import { useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Artifact from "./artifact-component";
import { loadPalettes, type Palette } from "./data/loadPalettes";
import Footer from "./my-components/Footer";
import { Navbar } from "./my-components/Navbar";

function App() {
  const [plotType, setPlotType] = useState("palette");
  const [palettes, setPalettes] = useState<Palette[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPalettes()
      // Shuffle
      .then((loaded) =>
        setPalettes([...loaded].sort(() => Math.random() - 0.5)),
      )
      .catch((err) => setError(err.message));
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <Navbar plotType={plotType} onPlotTypeChange={setPlotType} />
      {palettes ? (
        <Artifact palettes={palettes} plotType={plotType} />
      ) : (
        <div className="min-h-screen bg-gray-50 pt-40 text-center text-gray-500">
          {error ? `Could not load palettes: ${error}` : "Loading palettes…"}
        </div>
      )}
      <Footer />
    </TooltipProvider>
  );
}

export default App;
