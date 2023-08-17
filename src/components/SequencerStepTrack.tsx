import React from 'react';
import './SequencerStepTrack.scss';

interface SequencerStepTrackProps {
    // input
    steps: boolean[]
    // output
    stepClicked: (index: number) => void
}

function SequencerStepTrack(props: SequencerStepTrackProps) {

    // console.log('render SequencerStepTrack')

    return (
        <div className='track-step-container'>
            {props.steps.map((enabled, i) => {
                let interval = props.steps.length % 3 === 0 ? 3 : 4

                let className = 'sequencer-step'
                if (enabled) {
                    className += ' enabled'
                }
                else if (i % interval === 0) {
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
