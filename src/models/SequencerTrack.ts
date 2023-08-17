export interface Track {
    name: string
    volume: number // min: 0.0, max: 1.0
    pan: number // min: -1.0, max: 1.0
    sampleUrl: string
}

export interface StepTrack extends Track {
    steps: boolean[]
}

export interface FreeTrack extends Track {
    events: number[] // min: 0.0, max: <1.0
}
