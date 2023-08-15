import React, { useState } from 'react';
import 'sass';
import './Sequencer.scss';
import { StepTrack } from '../models/SequencerTrack';
import Step from './Step';
import { AudioScheduler } from '../services/AudioScheduler';

const audioScheduler = AudioScheduler.instance

interface SequencerProps {
    // input
    bpm: number
    swing: number
    tracks: StepTrack[]
    playing: boolean
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
        loading: true,
    })

    let unloadedTracks = state.tracks.filter(t => !audioScheduler.sampleBuffers.has(t.name))

    Promise.all(unloadedTracks.map(track => audioScheduler.loadAudio(track.name, track.samplePath)))
        .then(() => setState({ ...state, loading: false }))
        .catch(err => {
            console.error(err)
            setState({ ...state, loading: false })
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
            {state.tracks.map((track, i) => (
                <div key={i} className='track'>

                    <div className='track-controls'>
                        <span className='track-label'>{track.name}</span>

                        <input type='range' min={0} max={100} step={1} defaultValue={100} className='track-volume'
                            onChange={e => onTrackVolumeChange(e.target.valueAsNumber)}>
                        </input>
                        <input type='range' min={-1} max={1} step={0.01} defaultValue={0} className='track-pan'
                            onChange={e => onTrackPanChange(e.target.valueAsNumber)}>
                        </input>
                    </div>

                    <div className='track-step-container'>
                        {new Array(track.stepCount).fill(null).map((_, i) => {
                            let interval = track.stepCount % 3 == 0 ? 3 : 4
                            return (
                                <Step
                                    key={`${track.name}-${i}`}
                                    primary={i % interval == 0}
                                    enabled={false}
                                ></Step>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Sequencer
