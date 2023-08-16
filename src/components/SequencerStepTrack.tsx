import React, { useState } from 'react';
import 'sass';
import './SequencerStepTrack.scss';

interface SequencerStepTrackProps {
    // input
    steps: boolean[]
    // output
    stepClicked: (index: number) => void
}
// interface SequencerStepTrackState { }

function SequencerStepTrack(props: SequencerStepTrackProps) {
    // const [state, setState] = useState<SequencerStepTrackState>({})

    return (
        <div className='track-step-container'>
            {props.steps.map((enabled, i) => {
                let interval = props.steps.length % 3 == 0 ? 3 : 4

                let className = 'sequencer-step'
                if (enabled) {
                    className += ' enabled'
                }
                else if (i % interval == 0) {
                    className += ' primary'
                }

                return (
                    <div className={className} key={i} onClick={() => props.stepClicked(i)}></div>
                )
            })}
        </div>
    )
}

export default SequencerStepTrack
