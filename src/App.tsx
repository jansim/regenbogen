import "./App.css";
import Artifact from "./artifact-component";
import palettes_d from "./data/palettes_d.json";

const palettes = palettes_d.sort(() => Math.random() - 0.5);

function App() {
  return (
    <>
      <Artifact palettes={palettes} />
    </>
  );
}

export default App;
