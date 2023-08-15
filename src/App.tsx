import React, { useState } from 'react';
import 'sass';
import './App.scss';
import Toolbar from './components/Toolbar';
import Sequencer from './components/Sequencer';
import { StepTrack } from './models/SequencerTrack';

const DEFAULT_BPM = 100
const DEFAULT_SWING = 0

interface AppState {
  playing: boolean
  bpm: number
  swing: number
  tracks: StepTrack[]
}

const initialState: AppState = {
  bpm: DEFAULT_BPM,
  swing: DEFAULT_SWING,
  playing: false,
  tracks: [
    {
      name: 'kick',
      pan: 0,
      volume: 100,
      samplePath: '/audio/kick.mp3',
      stepCount: 12,
    },
    {
      name: 'snare',
      pan: 0,
      volume: 100,
      samplePath: '/audio/snare.mp3',
      stepCount: 16,
    },
    {
      name: 'hihat',
      pan: 0,
      volume: 100,
      samplePath: '/audio/hihat.mp3',
      stepCount: 16,
    }
  ]
}

function App() {
  const [state, setState] = useState<AppState>(initialState)

  return (
    <div>
      <Toolbar
        // input
        playing={state.playing}
        // output
        bpmChanged={bpm => setState({ ...state, bpm })}
        swingChanged={swing => setState({ ...state, swing })}
        playStopClicked={() => setState({ ...state, playing: !state.playing })}
        resetClicked={() => setState(initialState)}
      ></Toolbar>

      <Sequencer
        // input
        bpm={state.bpm}
        swing={state.swing}
        playing={state.playing}
        tracks={state.tracks}
      ></Sequencer>
    </div >
  )
}

export default App
