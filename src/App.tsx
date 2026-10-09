import "./App.css";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Artifact from "./artifact-component";
import palettes_d from "./data/palettes_d.json";
import Footer from "./my-components/Footer";
import { Navbar } from "./my-components/Navbar";

const palettes = palettes_d
  // Generate IDs
  .map((palette) => ({
    ...palette,
    id: palette.package + "::" + palette.palette,
  }))
  // Shuffle
  .sort(() => Math.random() - 0.5);

function App() {
  const [plotType, setPlotType] = useState("palette");

  return (
    <TooltipProvider delayDuration={200}>
      <Navbar plotType={plotType} onPlotTypeChange={setPlotType} />
      <Artifact palettes={palettes} plotType={plotType} />
      <Footer />
    </TooltipProvider>
  );
}

export default App;
