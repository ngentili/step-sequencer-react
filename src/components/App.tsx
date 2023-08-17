import React, { useEffect, useRef, useState } from 'react';
import './App.scss';
import Toolbar from './Toolbar';
import Sequencer from './Sequencer';
import { StepTrack } from '../models/SequencerTrack';
import { getLoopDuration } from '../utils/timing';
import { isInRange } from '../utils/ranges';

interface ScheduledAudio {
  trackName: string
  sourceNode: AudioBufferSourceNode
  startTime: number
}

const audioContext = new AudioContext()
const sampleBuffers = new Map<string, AudioBuffer>()

let nextLoopStartTime: number | undefined
const schedule: ScheduledAudio[] = []
let timer: NodeJS.Timer | undefined

function purgePastScheduled(fromWhen: number) {
  let runAgain = true

  while (runAgain) {
    runAgain = false

    for (let i = 0; i < schedule.length; i++) {
      const a = schedule[i]

      const startTimeDelta = a.startTime - fromWhen  // negative is in past
      const startedInPast = startTimeDelta < 0
      const currentlyPlaying = startedInPast && (-1 * startTimeDelta) > (a.sourceNode.buffer?.length || 0)

      if (currentlyPlaying) {
        // console.log(`not removed, currently playing: ${a.trackName} ${a.startTime}`)
      }
      else if (startedInPast) {
        // console.log(`removed past scheduled: ${a.trackName} ${a.startTime}`)
        a.sourceNode.stop()
        schedule.splice(i, 1)
        runAgain = true
        break
      }
      else {
        // console.log(`not removed, in future: ${a.trackName} ${a.startTime}`)
      }
    }
  }
}

function doScheduling(bpm: number, swing: number, tracks: StepTrack[]) {
  const audioLoopDuration = getLoopDuration(bpm)
  const timeAheadToSchedule = audioLoopDuration * 3
  const enterTime = audioContext.currentTime
  console.log('doScheduling: ' + enterTime)

  purgePastScheduled(enterTime)

  // if nothing scheduled, start from now
  if (!nextLoopStartTime) {
    nextLoopStartTime = enterTime
  }
  else if (nextLoopStartTime < enterTime) {
    nextLoopStartTime += audioLoopDuration
  }

  // schdule X loops ahead
  let totalScheduledCount = 0
  let newScheduledCount: number
  let loopIndex = 0

  do {
    newScheduledCount = 0

    for (const track of tracks) {
      const trackAudioBuffer = sampleBuffers.get(track.name)

      if (!trackAudioBuffer) {
        throw new Error('Audio buffer not found')
      }

      for (let stepIndex = 0; stepIndex < track.steps.length; stepIndex++) {
        const stepEnabled = track.steps[stepIndex]

        if (!stepEnabled) {
          continue
        }

        const position = stepIndex / track.steps.length
        const loopStartTime = nextLoopStartTime + loopIndex * audioLoopDuration
        const offsetTimeInLoop = position * audioLoopDuration
        const startTime = loopStartTime + offsetTimeInLoop
        const timeUntilStart = startTime - enterTime

        // only schedule so far out
        if (timeUntilStart > timeAheadToSchedule) {
          console.log(`did not schedule, too far: ${track.name} ${startTime}`)
          continue
        }

        // if not already scheduled
        if (schedule.find(a => a.trackName === track.name && a.startTime === startTime)) {
          console.log(`did not schedule, already exists: ${track.name} ${startTime}`)
          continue
        }

        scheduledAudio(track.name, startTime, track.volume, track.pan, trackAudioBuffer)
        console.log(`scheduled audio: ${track.name} ${startTime}`)
        newScheduledCount++
        totalScheduledCount++
      }
    }

    loopIndex++
  }
  while (newScheduledCount > 0)

  console.log('scheduling pass done, scheduled: ' + totalScheduledCount)

  let asdf = 1
}

function scheduledAudio(trackName: string, startTime: number, volume: number, pan: number, sampleBuffer: AudioBuffer) {

  if (!isInRange(volume, 0, true, 1, true)) {
    console.error('invalid volume: ' + volume)
    return
  }

  if (!isInRange(pan, -1, true, 1, true)) {
    console.error('invalid pan: ' + pan)
    return
  }

  if (startTime < audioContext.currentTime) {
    console.warn('tried to schedule audio in past')
    return
  }

  if (schedule.find(s => s.trackName === trackName && s.startTime === startTime)) {
    console.warn('audio already scheduled')
    return
  }

  // gain
  let gainNode = new GainNode(audioContext, { gain: volume })

  // pan
  let panNode = new PannerNode(audioContext, { positionX: pan })

  // source
  let sourceNode = new AudioBufferSourceNode(audioContext, { buffer: sampleBuffer })

  // connections
  sourceNode
    .connect(panNode)
    .connect(gainNode)
    .connect(audioContext.destination)

  // schedule audio
  sourceNode.start(startTime)

  schedule.push({
    trackName,
    sourceNode,
    startTime,
  })
}

function unscheduleAll() {

  // while (runAgain) {
  //   runAgain = false

  //   for (let i = 0; i < schedule.length; i++) {
  //     const a = schedule[i]

  //     const startTimeDelta = fromWhen - a.startTime // negative is in past
  //     const startedInPast = startTimeDelta < fromWhen
  //     const currentlyPlaying = startedInPast && startTimeDelta < (a.sourceNode.buffer?.length || 0)

  //     if (currentlyPlaying) {
  //       console.log(`not removed, currently playing: ${a.trackName} ${a.startTime}`)
  //     }
  //     else {
  //       console.log(`removed past scheduled: ${a.trackName} ${a.startTime}`)
  //       a.sourceNode.stop()
  //       schedule.splice(i, 1)
  //       runAgain = true
  //       break
  //     }
  //   }
  // }
}

function startAudioLoop(bpm: number, swing: number, tracks: StepTrack[]) {
  return audioContext.resume().then(() => {
    console.log('timer started')
    timer = setInterval(() => {
      doScheduling(bpm, swing, tracks)
    }, 250)
  })
}

function stopAudioLoop() {
  unscheduleAll()
  clearInterval(timer)
  nextLoopStartTime = undefined
  return audioContext.suspend()
}

function loadAudio(name: string, audioUrl: string): Promise<void> {
  // console.log('loading: ' + name)
  return fetch(audioUrl)
    .then(res => res.arrayBuffer())
    .then(data => audioContext.decodeAudioData(data))
    .then(buffer => { sampleBuffers.set(name, buffer) })
}

const DEFAULT_PLAYING = false
const DEFAULT_BPM = 100
const DEFAULT_SWING = 0
const DEFAULT_TRACKS: StepTrack[] = [
  {
    name: 'kick',
    pan: 0,
    volume: 1,
    sampleUrl: '/audio/kick.mp3',
    steps: new Array<boolean>(16).fill(false),
  },
  {
    name: 'snare',
    pan: 0,
    volume: 1,
    sampleUrl: '/audio/snare.mp3',
    steps: new Array<boolean>(16).fill(false),
  },
  {
    name: 'hihat',
    pan: 0,
    volume: 1,
    sampleUrl: '/audio/hihat.mp3',
    steps: new Array<boolean>(16).fill(false),
  }
]

function App() {
  const [playing, setPlaying] = useState(DEFAULT_PLAYING)
  const [bpm, setBpm] = useState(DEFAULT_BPM)
  const [swing, setSwing] = useState(DEFAULT_SWING)
  const [tracks, setTracks] = useState(DEFAULT_TRACKS)
  const [loading, setLoading] = useState(false)

  const loadingRef = useRef(false)

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

  useEffect(() => {
    if (!loadingRef.current) {
      let unloadedTracks = tracks.filter(track => !sampleBuffers.has(track.name))

      if (unloadedTracks.length > 0) {
        // console.log('loading')
        loadingRef.current = true
        setLoading(true)

        Promise
          .all(unloadedTracks.map(track => loadAudio(track.name, track.sampleUrl)))
          .catch(() => {
            throw new Error('Error loading audio')
          })
          .finally(() => {
            // console.log('done')
            loadingRef.current = false
            setLoading(false)
          })
      }
    }
  }, [bpm, swing, tracks])

  if (loading) {
    return <div>Loading...</div>
  }

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
            stopAudioLoop()
              .then(() => {
                setPlaying(false)
              })
          }
          else {
            startAudioLoop(bpm, swing, tracks)
              .then(() => {
                setPlaying(true)
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
