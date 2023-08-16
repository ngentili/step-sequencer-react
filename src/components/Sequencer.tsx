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

function Sequencer(props: SequencerProps) {
    const [bpm, setBpm] = useState(props.bpm)
    const [swing, setSwing] = useState(props.swing)
    const [tracks, setTracks] = useState(props.tracks)

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

    return (
        <div className='track-container'>
            {tracks.map((track, ti) => (
                <div key={ti} className='track'>

                    <div className='track-controls'>
                        <span className='track-label'>{track.name}</span>

                        <input type='range' min={0} max={100} step={1} defaultValue={track.volume} className='track-volume'
                            onChange={e => onTrackVolumeChange(e.target.valueAsNumber, ti)}>
                        </input>
                        <input type='range' min={-1} max={1} step={0.01} defaultValue={track.pan} className='track-pan'
                            onChange={e => onTrackPanChange(e.target.valueAsNumber, ti)}>
                        </input>
                        <input type='range' min={2} max={32} step={2} defaultValue={track.steps.length} className='track-step-count'
                            onChange={e => onTrackStepCountChange(e.target.valueAsNumber, ti)}>
                        </input>
                        <button onClick={() => onFillClick(true, ti)}>Fill</button>
                        <button onClick={() => onFillClick(false, ti)}>Clear</button>
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
