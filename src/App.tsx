import { useEffect } from "react"
import "./App.css"
import { useAppDispatch } from "./app/hooks"
import { togglePlayback } from "./features/sequencer/sequencerSlice"
import TrackContainer from "./features/sequencer/track/container/TrackContainer"
import Toolbar from "./features/sequencer/toolbar/Toolbar"

function App() {
  const dispatch = useAppDispatch()

  function keyUpHandler(e: KeyboardEvent) {
    if (e.key == ' ' && !e.repeat) {
      e.preventDefault()
      e.stopPropagation()

      dispatch(togglePlayback())
    }
  }

  useEffect(() => {
    document.addEventListener('keyup', keyUpHandler)

    return () => {
      document.removeEventListener('keyup', keyUpHandler)
    }
  })

  return (
    <>
      <Toolbar></Toolbar>
      <TrackContainer></TrackContainer>
    </>
  )
}

export default App
