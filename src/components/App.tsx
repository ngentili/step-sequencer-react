import React, { useEffect, useRef, useState } from 'react';
import 'sass';
import './App.scss';
import Toolbar from './Toolbar';
import Sequencer from './Sequencer';
import { StepTrack } from '../models/SequencerTrack';
import { AudioScheduler, SequencerAudio } from '../services/AudioScheduler';

const audioScheduler = new AudioScheduler()

const DEFAULT_PLAYING = false
const DEFAULT_BPM = 100
const DEFAULT_SWING = 0
const DEFAULT_TRACKS: StepTrack[] = [
  {
    name: 'kick',
    pan: 0,
    volume: 100,
    samplePath: '/audio/kick.mp3',
    steps: new Array<boolean>(16).fill(false),
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
    steps: new Array<boolean>(16).fill(false),
  }
]

function App() {
  alert('init')
  
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

  function onTrackVolumeChange(value: number, trackIndex: number) {
    let newTracks = [...tracks]
    newTracks[trackIndex].volume = value
    setTracks(newTracks)
  }

  function onTrackPanChange(value: number, trackIndex: number) {
    let newTracks = [...tracks]
    newTracks[trackIndex].pan = value
    setTracks(newTracks)
  }

  function onTrackStepCountChange(value: number, trackIndex: number) {
    let delta = value - tracks[trackIndex].steps.length
    let newTracks = [...tracks]

    if (delta > 0) {
      for (let i = 0; i < delta; i++) {
        newTracks[trackIndex].steps.push(false)
      }
    }
    else {
      for (let i = 0; i < -delta; i++) {
        newTracks[trackIndex].steps.pop()
      }
    }

    setTracks(newTracks)
  }

  function onFillClick(value: boolean, trackIndex: number) {
    let newTracks = [...tracks]
    newTracks[trackIndex].steps = new Array(newTracks[trackIndex].steps.length).fill(value)
    setTracks(newTracks)
  }

  // load audio buffers  
  useEffect(() => {
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
  })

  let seqAudios: SequencerAudio[]

  if (playing) {
    seqAudios = tracks.flatMap(track =>
      track.steps
        .filter(enabled => enabled)
        .map((_, stepIndex): SequencerAudio => ({
          trackName: track.name,
          pan: track.pan,
          volume: track.volume,
          position: stepIndex / track.steps.length,
        }))
    )
  }
  else {
    seqAudios = []
  }

  audioScheduler.setScheduled(seqAudios)

  // console.log('render App')

  return (
    <div>
      <Toolbar
        // input
        playing={playing}
        // output
        bpmChanged={value => setBpm(value)}
        swingChanged={value => setSwing(value)}
        playStopClicked={() => {
          if (playing) {
            audioScheduler.start()
              .then(() => {
                setPlaying(true)
              })
          }
          else {
            audioScheduler.stop()
              .then(() => {
                setPlaying(false)
              })
          }
        }}
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
          let newTracks = structuredClone(tracks)
          newTracks[trackIndex].steps[stepIndex] = !newTracks[trackIndex].steps[stepIndex]
          setTracks(newTracks)
        }}
        trackVolumeChanged={onTrackVolumeChange}
        trackPanChanged={onTrackPanChange}
        trackStepCountChanged={onTrackStepCountChange}
        fillClicked={onFillClick}
      ></Sequencer>
    </div >
  )
}

export default App
