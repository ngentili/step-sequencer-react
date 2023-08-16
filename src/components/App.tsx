import React, { useEffect, useRef, useState } from 'react';
import 'sass';
import './App.scss';
import Toolbar from './Toolbar';
import Sequencer from './Sequencer';
import { StepTrack } from '../models/SequencerTrack';
import { AudioScheduler } from '../services/AudioScheduler';

const audioScheduler = new AudioScheduler()

const DEFAULT_PLAYING = false
const DEFAULT_BPM = 100
const DEFAULT_SWING = 0
const DEFAULT_TRACKS = [
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

function App() {
  const [playing, setPlaying] = useState(DEFAULT_PLAYING)
  const [bpm, setBpm] = useState(DEFAULT_BPM)
  const [swing, setSwing] = useState(DEFAULT_SWING)
  const [tracks, setTracks] = useState(DEFAULT_TRACKS)

  const loadingAudio = useRef(false)

  function onResetClicked() {
    setPlaying(DEFAULT_PLAYING)
    setBpm(DEFAULT_BPM)
    setSwing(DEFAULT_SWING)
    setTracks(DEFAULT_TRACKS)
  }

  // load audio buffers  
  if (!loadingAudio.current) {
    let unloadedTracks = tracks.filter(t => !audioScheduler.sampleBuffers.has(t.name))

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

  // schedule audio
  if (playing) {
  }

  return (
    <div>
      <Toolbar
        // input
        playing={playing}
        // output
        bpmChanged={value => setBpm(value)}
        swingChanged={value => setSwing(value)}
        playStopClicked={() => setPlaying(!playing)}
        resetClicked={() => onResetClicked()}
      ></Toolbar>

      <Sequencer
        // input
        bpm={bpm}
        swing={swing}
        playing={playing}
        tracks={tracks}
        // output
        stepClicked={(trackIndex, stepIndex) => {
          let newTracks = tracks
          newTracks[trackIndex].steps[stepIndex] = !newTracks[trackIndex].steps[stepIndex]
          setTracks(newTracks)
        }}
      ></Sequencer>
    </div >
  )
}

export default App
