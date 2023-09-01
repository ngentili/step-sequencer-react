import { AudioBufferSourceNodeWrapper, GainNodeWrapper, PannerNodeWrapper, disconnectChain } from "./AudioNodeWrapper";
import { ScheduledAudio, Track } from "./models";
import './collectionHelpers';

interface SchedulerTrack {
    trackNode: GainNodeWrapper
    sampleId: string
    positions: number[]
}

const audioContext = new AudioContext()

const masterGainNode = new GainNodeWrapper(audioContext)
masterGainNode.connect(audioContext.destination)

const audioLibrary = new Map<string, AudioBuffer>() // sampleId : AudioBuffer

let schedulerBpm: number
let schedulerSwing: number
const schedulerTracks = new Map<number, SchedulerTrack>()
const schedule: ScheduledAudio[] = []
let schedulerPlaying: boolean

async function hashBinaryData(data: ArrayBufferView | ArrayBuffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    return hashHex
}

async function loadAudioBuffer(url: string) {
    const res = await fetch(url)
    const data = await res.arrayBuffer()
    const sampleId = await hashBinaryData(data)

    if (!audioLibrary.has(sampleId)) {
        const audioBuffer = await audioContext.decodeAudioData(data)
        audioLibrary.set(sampleId, audioBuffer)
    }

    return sampleId
}

function addTrack(track: Track) {
    // pan
    const trackPanNode = new PannerNodeWrapper(audioContext, { positionX: track.pan })

    // gain
    const trackGainNode = new GainNodeWrapper(audioContext, { gain: track.volume })

    // pan -> gain -> output
    trackPanNode
        .connect(trackGainNode)
        .connect(masterGainNode)

    trackGainNode.inputs.push(trackPanNode)

    if (schedulerTracks.has(track.trackId)) {
        throw new Error('trackId already exists')
    }
    schedulerTracks.set(track.trackId, {
        sampleId: track.sampleId,
        trackNode: trackGainNode,
        positions: [],
    })

    logLoopState()
    console.log(`track added: ${track.trackId}`)
}

function removeTrack(trackId: number) {
    const schedulerTrack = schedulerTracks.getOrThrow(trackId)

    disconnectChain(schedulerTrack.trackNode)

    // TODO stop/unschedule audio
    schedulerTracks.delete(trackId)

    logLoopState()
    console.log(`track removed: ${trackId}`)
}

function setTrackVolume(trackId: number, volume: number) {
    const schedulerTrack = schedulerTracks.getOrThrow(trackId)
    schedulerTrack.trackNode.gain.value = volume
    console.log(`${trackId} volume changed: ${volume}`)
}

function setTrackPan(trackId: number, pan: number) {
    const schedulerTrack = schedulerTracks.getOrThrow(trackId)
    const panNode = schedulerTrack.trackNode.inputs.singleOrThrow() as PannerNodeWrapper
    panNode.positionX.value = pan
    console.log(`${trackId} pan changed: ${pan}`)
}

async function start() {
    scheduleOneLoop(audioContext.currentTime)
    await audioContext.resume()
    schedulerPlaying = true
    console.log('playback started')
}

async function stop() {
    stopScheduler()
    await audioContext.suspend()
    schedulerPlaying = false
    console.log('playback stopped')
}

function addSampleToScheduler(trackId: number, position: number) {
    const schedulerTrack = schedulerTracks.getOrThrow(trackId)
    schedulerTrack.positions.push(position)
    schedulerTrack.positions.sort()

    logLoopState()
    console.log(`step enabled`)

    if (schedulerPlaying) {
        const audioBuffer = audioLibrary.getOrThrow(schedulerTrack.sampleId)

        const panNode = schedulerTrack.trackNode.inputs.singleOrThrow() as PannerNodeWrapper

        // schedule sample for current and future loops
        const loopDuration = getLoopDuration(schedulerBpm)
        const currentLoopStartTime = getCurrentLoopStartTime()
        const futureLoopStartTimes = scheduledLoopStartTimes.filter(t => t > currentLoopStartTime)

        for (const loopStartTime of [currentLoopStartTime, ...futureLoopStartTimes]) {
            const sampleStartTime = loopStartTime + loopDuration * position

            if (sampleStartTime >= audioContext.currentTime) {
                scheduleOneSample(trackId, sampleStartTime, panNode, audioBuffer)
            }
        }
    }
}

function removeSampleFromScheduler(trackId: number, position: number) {
    const schedulerTrack = schedulerTracks.getOrThrow(trackId)
    const loopAudioIndex = schedulerTrack.positions.findIndex(pos => pos == position)
    if (loopAudioIndex < 0) {
        throw new Error('loop audio does not exist')
    }
    schedulerTrack.positions.splice(loopAudioIndex, 1)
    logLoopState()

    console.log(`step disabled`)

    if (schedulerPlaying) {
        // unschedule existing sample from current and future loops
        const loopDuration = getLoopDuration(schedulerBpm)
        const currentLoopStartTime = getCurrentLoopStartTime()
        const futureLoopStartTimes = scheduledLoopStartTimes.filter(t => t > currentLoopStartTime)

        // TODO sometimes scheduled sample not found
        // propbably timing issue, removed from state then not rescheduled but still searched for
        for (const loopStartTime of [currentLoopStartTime, ...futureLoopStartTimes]) {
            const sampleStartTime = loopStartTime + loopDuration * position
            unscheduleOneSample(trackId, sampleStartTime)
        }
    }
}

function logLoopState() {
    console.log(schedulerTracks)
}

let nextLoopTimeout: NodeJS.Timeout | undefined
let scheduledLoopStartTimes: number[] = []

function scheduleOneLoop(loopStartTime: number) {
    console.log(`currentTime: ${audioContext.currentTime}`)
    console.log(`loopStartTime: ${loopStartTime}`)

    const earlyBy = loopStartTime - audioContext.currentTime
    console.log(`early by: ${earlyBy}`)

    const loopDuration = getLoopDuration(schedulerBpm)
    const minDesiredEarlyBy = loopDuration / 2
    const earlyByDelta = minDesiredEarlyBy - earlyBy

    // adjust for timer deviation
    const nextLoopOffsetTime = loopDuration - earlyByDelta
    const nextLoopTargetStartTime = loopStartTime + loopDuration

    // target second loop for halfway through the first
    nextLoopTimeout = setTimeout(() => {
        scheduleOneLoop(nextLoopTargetStartTime)
    }, nextLoopOffsetTime * 1000)

    // schedule samples
    for (const [trackId, { sampleId, positions, trackNode }] of schedulerTracks.entries()) {

        const audioBuffer = audioLibrary.getOrThrow(sampleId)

        for (const position of positions) {
            const panNode = trackNode.inputs.singleOrThrow() as PannerNodeWrapper

            const sampleStartTime = loopStartTime + loopDuration * position
            scheduleOneSample(trackId, sampleStartTime, panNode, audioBuffer)
        }
    }

    // purge old scheduled samples
    for (let i = schedule.length - 1; i >= 0; i--) {
        const a = schedule[i]

        if (a.startTime < audioContext.currentTime - loopDuration) {
            // TODO ignore if sample currently playing
            a.sourceNode.stop()
            a.sourceNode.disconnect()
            schedule.splice(i, 1)
        }
    }

    // const currentLoopStartTime = getCurrentLoopStartTime()
    const currentLoopStartTime = loopStartTime == 0 ? 0 : getCurrentLoopStartTime()

    // purge old loop start times
    scheduledLoopStartTimes = scheduledLoopStartTimes.filter(t => t >= currentLoopStartTime)

    // add just scheduled loop start time
    scheduledLoopStartTimes.push(loopStartTime)
}

function getCurrentLoopStartTime() {
    // loop start times in the past/now
    const nonFutureLoopTimes = scheduledLoopStartTimes.filter(t => t <= audioContext.currentTime)

    if (nonFutureLoopTimes.length < 1) {
        throw new Error('Non-future loop start times not found')
    }

    const currentLoopTime = Math.max(...nonFutureLoopTimes)
    return currentLoopTime
}

function scheduleOneSample(trackId: number, sampleStartTime: number, panNode: PannerNodeWrapper, audioBuffer: AudioBuffer) {
    // dont schedule sample in past
    if (sampleStartTime < audioContext.currentTime) {
        console.warn(`ignoring past startTime trackId: ${trackId} | time: ${sampleStartTime}`)
        return
    }

    const sourceNode = new AudioBufferSourceNodeWrapper(audioContext, { buffer: audioBuffer })
    sourceNode.connect(panNode)
    panNode.inputs.push(sourceNode)

    // dont schedule if already scheduled
    if (schedule.find(a => a.trackId == trackId && a.startTime == sampleStartTime)) {
        console.warn(`sample already scheduled trackId: ${trackId} | time: ${sampleStartTime}`)
        return
    }

    sourceNode.start(sampleStartTime)
    schedule.push({ trackId, sourceNode, startTime: sampleStartTime })
    // console.log(`sample scheduled trackId: ${trackId} | startTime: ${sampleStartTime}`)
}

function unscheduleOneSample(trackId: number, sampleStartTime: number) {
    // find scheduled sample
    let scheduleIndex = schedule.findIndex(a => a.trackId == trackId && a.startTime == sampleStartTime)

    if (scheduleIndex < 0) {
        console.warn(`sample to unschedule not found trackId: ${trackId} | time: ${sampleStartTime}`)
        return
    }

    let scheduledSample = schedule[scheduleIndex]

    scheduledSample.sourceNode.stop()
    scheduledSample.sourceNode.disconnect()
    schedule.splice(scheduleIndex, 1)
}

function stopScheduler() {
    clearTimeout(nextLoopTimeout)

    // stop and disconnect all samples
    for (let i = schedule.length - 1; i >= 0; i--) {
        const a = schedule[i]

        a.sourceNode.stop()
        a.sourceNode.disconnect()
        schedule.splice(i, 1)
    }
}

function getLoopDuration(bpm: number) {
    return (60 / bpm) * 4
}

function setBpm(bpm: number) {
    schedulerBpm = bpm
}

function setSwing(swing: number) {
    schedulerSwing = swing
}

export default {
    loadAudioBuffer,
    addTrack,
    removeTrack,
    setTrackVolume,
    setTrackPan,
    start,
    stop,
    addSampleToScheduler,
    removeSampleFromScheduler,
    setBpm,
    setSwing,
}
