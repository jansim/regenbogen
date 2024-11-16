import './App.css'
import Artifact from './artifact-component'
import palettes_d from './data/palettes_d.json'

function App() {
  return (
    <>
      <Artifact palettes={palettes_d} />
    </>
  )
}

export default App
