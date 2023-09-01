import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { isInRange, isValidPan, isValidVolume } from "../../ranges";
import { StepTrack, Track, TrackType } from "./models";

// state

export interface SequencerState {
    bpm: number
    swing: number
    playing: boolean
    tracks: Track[]
}

const initialState: SequencerState = {
    bpm: 100,
    playing: false,
    swing: 0,
    tracks: [],
}

// payloads

type StepPayload = PayloadAction<{ trackIndex: number, stepIndex: number, enable: boolean }>
type TrackVolumeAction = PayloadAction<{ trackIndex: number, volume: number }>
type TrackPanAction = PayloadAction<{ trackIndex: number, pan: number }>
type TrackStepCountAction = PayloadAction<{ trackIndex: number, stepCount: number }>
type TrackFillAction = PayloadAction<{ trackIndex: number, enable: boolean }>
type BpmAction = PayloadAction<{ bpm: number }>
type SwingAction = PayloadAction<{ swing: number }>
type AddTrackAction = PayloadAction<{ name: string, type: TrackType, sampleId: string }>
type RemoveTrackAction = PayloadAction<{ trackId: number }>

// reducers

let nextTrackId = 0
function getNextTrackId() {
    return nextTrackId++
}

export const sequencerSlice = createSlice({
    name: 'sequencer',
    initialState,
    reducers: {
        setTrackStep: (state, action: StepPayload) => {
            const track = state.tracks[action.payload.trackIndex] as StepTrack
            if (track.type != TrackType.Step) {
                throw new Error('TrackType is not Step')
            }
            const step = track.steps[action.payload.stepIndex]
            step.enabled = action.payload.enable
        },
        setTrackVolume: (state, action: TrackVolumeAction) => {
            if (!isValidVolume(action.payload.volume)) {
                throw new Error('Invalid volume value')
            }
            const track = state.tracks[action.payload.trackIndex]
            track.volume = action.payload.volume
        },
        setTrackPan: (state, action: TrackPanAction) => {
            if (!isValidPan(action.payload.pan)) {
                throw new Error('Invalid pan value')
            }
            const track = state.tracks[action.payload.trackIndex]
            track.pan = action.payload.pan
        },
        setTrackStepCount: (state, action: TrackStepCountAction) => {
            const track = state.tracks[action.payload.trackIndex] as StepTrack
            if (track.type != TrackType.Step) {
                throw new Error('TrackType is not Step')
            }
            const delta = action.payload.stepCount - track.steps.length

            const newCount = track.steps.length + delta
            if (newCount < 2) {
                throw new Error(`Invalid track step count: ${newCount}`)
            }

            if (delta > 0) {
                // increase
                for (let i = 0; i < delta; i++) {
                    track.steps.push({ enabled: false })
                }
            }
            else if (delta < 0) {
                // decrease
                for (let i = 0; i < -delta; i++) {
                    track.steps.pop()
                }
            }
        },
        fillTrack: (state, action: TrackFillAction) => {
            const track = state.tracks[action.payload.trackIndex] as StepTrack
            if (track.type != TrackType.Step) {
                throw new Error('TrackType is not Step')
            }
            track.steps.forEach(step => step.enabled = action.payload.enable)
        },
        reset(state, action: PayloadAction<void>) {
            state.bpm = initialState.bpm
            state.playing = initialState.playing
            state.swing = initialState.swing
            state.tracks = initialState.tracks
        },
        setBpm(state, action: BpmAction) {
            const bpm = action.payload.bpm
            if (!isInRange(bpm, 0, false, 400, true)) {
                throw new Error('Invalid bpm value')
            }
            state.bpm = bpm
        },
        setSwing(state, action: SwingAction) {
            const swing = action.payload.swing
            if (!isInRange(swing, 0, true, 70, true)) {
                throw new Error('Invalid swing value')
            }
            state.swing = swing
        },
        addTrack(state, action: AddTrackAction) {
            if (action.payload.type == TrackType.Step) {
                let stepTrack: StepTrack = {
                    name: action.payload.name,
                    pan: 0,
                    sampleId: action.payload.sampleId,
                    steps: new Array(16).fill(({ enabled: false })),
                    trackId: getNextTrackId(),
                    type: action.payload.type,
                    volume: 1,
                }
                state.tracks.push(stepTrack)
            }
            else {
                throw new Error('addTrack type not impemented')
            }
        },
        removeTrack(state, action: RemoveTrackAction) {
            let trackIndex = state.tracks.findIndex(t => t.trackId === action.payload.trackId)
            if (trackIndex < 0) {
                throw new Error('trackId not found')
            }
            state.tracks.splice(trackIndex, 1)
        },
        togglePlayback(state, action: PayloadAction<void>) {
            state.playing = !state.playing
        },
    },
    extraReducers: (builder => { builder })
})

export const {
    setTrackStep,
    setTrackVolume,
    setTrackPan,
    setTrackStepCount,
    fillTrack,
    reset,
    setBpm,
    setSwing,
    addTrack,
    removeTrack,
    togglePlayback,
} = sequencerSlice.actions

export default sequencerSlice.reducer
