import React, { useEffect, useRef, useState } from 'react';
import 'sass';
import './App.scss';
import Toolbar from './components/Toolbar';
import Sequencer from './components/Sequencer';
import { StepTrack } from './models/SequencerTrack';
import { AudioScheduler } from './services/AudioScheduler';

const audioScheduler = new AudioScheduler()

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
      steps: new Array<boolean>(12).fill(true),
    },
    {
      name: 'snare',
      pan: 0,
      volume: 100,
      samplePath: '/audio/snare.mp3',
      steps: new Array<boolean>(16).fill(false),
    },
    {
      name: 'hihat',
      pan: 0,
      volume: 100,
      samplePath: '/audio/hihat.mp3',
      steps: [true, false, false, true, true, false, false, true, false, false, false, true, true, true, true, false],
    }
  ]
}

function App() {
  const [state, setState] = useState<AppState>(initialState)
  const loadingAudio = useRef(false)

  // load audio buffers  
  useEffect(() => {
    if (!loadingAudio.current) {
      let unloadedTracks = state.tracks.filter(t => !audioScheduler.sampleBuffers.has(t.name))

      if (unloadedTracks.length > 0) {
        loadingAudio.current = true

        Promise
          .all(unloadedTracks.map(track =>
            audioScheduler.loadAudio(track.name, track.samplePath).then(() => console.log('loaded: ' + track.name)))
          )
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            loadingAudio.current = false
          })
      }
    }
  })

  // schedule audio
  if (state.playing) {
  }

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
        // output
        stepClicked={(ti, si) => {
          let newTracks = state.tracks
          newTracks[ti].steps[si] = !newTracks[ti].steps[si]
          setState({ ...state, tracks: newTracks })
        }}
      ></Sequencer>
    </div >
  )
}

export default App
