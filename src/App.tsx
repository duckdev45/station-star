import { Panel } from './components/panel/Panel'
import { Stage } from './components/stage/Stage'
import { FloorProvider } from './state/floorState'

export default function App() {
  return (
    <FloorProvider>
      <div className="md:grid md:h-full md:grid-cols-[minmax(460px,44%)_1fr]">
        <Stage />
        <Panel />
      </div>
    </FloorProvider>
  )
}
