import React, { useState } from 'react';
import 'sass';
import './Sequencer.scss';
import { StepTrack } from '../models/SequencerTrack';
import SequencerStepTrack from './SequencerStepTrack';

interface SequencerProps {
    // input
    bpm: number
    swing: number
    tracks: StepTrack[]
    playing: boolean
    // output
    stepClicked: (trackIndex: number, stepIndex: number) => void
}
interface SequencerState {
    bpm: number
    swing: number
    tracks: StepTrack[]
    loading: boolean
}

function Sequencer(props: SequencerProps) {
    const [state, setState] = useState<SequencerState>({
        bpm: props.bpm,
        swing: props.swing,
        tracks: props.tracks,
        loading: false,
    })

    function onTrackVolumeChange(value: number) {
        console.log(value)
    }

    function onTrackPanChange(value: number) {
        console.log(value)
    }

    if (state.loading) {
        return <div>Loading audio...</div>
    }

    return (
        <div className='track-container'>
            {state.tracks.map((track, ti) => (
                <div key={ti} className='track'>

                    <div className='track-controls'>
                        <span className='track-label'>{track.name}</span>

                        <input type='range' min={0} max={100} step={1} defaultValue={100} className='track-volume'
                            onChange={e => onTrackVolumeChange(e.target.valueAsNumber)}>
                        </input>
                        <input type='range' min={-1} max={1} step={0.01} defaultValue={0} className='track-pan'
                            onChange={e => onTrackPanChange(e.target.valueAsNumber)}>
                        </input>
                    </div>

                    <SequencerStepTrack
                        steps={track.steps}
                        stepClicked={si => props.stepClicked(ti, si)}
                    ></SequencerStepTrack>
                </div>
            ))}
        </div>
    )
}

export default Sequencer
