import { AudioBufferSourceNodeWrapper } from "./AudioNodeWrapper"

export enum TrackType {
    Step = 'step',
    Free = 'free',
}

export interface Note {
    sampleId: number
    pitch?: number
    volume?: number
    startTime: number
}

export interface Step {
    enabled: boolean
}

export interface ScheduledAudio {
    trackId: number
    sourceNode: AudioBufferSourceNodeWrapper
    startTime: number
}

export interface Track {
    trackId: number
    name: string
    type: TrackType
    volume: number
    pan: number
    sampleId: string
}

export interface StepTrack extends Track {
    steps: Step[]
}

export interface NoteTrack extends Track {
    notes: Note[]
}
