import "./App.css";
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
  return (
    <>
      <Navbar />
      <Artifact palettes={palettes} />
      <Footer />
    </>
  );
}

export default App;
