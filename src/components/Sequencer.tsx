import React from 'react';
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
    trackVolumeChanged: (value: number, trackIndex: number) => void
    trackPanChanged: (value: number, trackIndex: number) => void
    trackStepCountChanged: (value: number, trackIndex: number) => void
    fillClicked: (value: boolean, trackIndex: number) => void
}

function Sequencer(props: SequencerProps) {

    // console.log('render Sequencer')

    return (
        <div className='track-container'>
            {props.tracks.map((track, ti) => (
                <div key={ti} className='track'>

                    <div className='track-controls'>
                        <span className='track-label'>{track.name}</span>

                        <input type='range' min={0} max={100} step={1} defaultValue={track.volume} className='track-volume'
                            onChange={e => props.trackVolumeChanged(e.target.valueAsNumber, ti)}>
                        </input>
                        <input type='range' min={-1} max={1} step={0.01} defaultValue={track.pan} className='track-pan'
                            onChange={e => props.trackPanChanged(e.target.valueAsNumber, ti)}>
                        </input>
                        <input type='range' min={2} max={32} step={2} defaultValue={track.steps.length} className='track-step-count'
                            onChange={e => props.trackStepCountChanged(e.target.valueAsNumber, ti)}>
                        </input>
                        <button onClick={() => props.fillClicked(true, ti)}>Fill</button>
                        <button onClick={() => props.fillClicked(false, ti)}>Clear</button>
                    </div>

                    <div className='step-track-container'>
                        <SequencerStepTrack
                            steps={track.steps}
                            stepClicked={si => props.stepClicked(ti, si)}
                        ></SequencerStepTrack>
                    </div>

                </div>
            ))}
        </div>
    )
}

export default Sequencer
