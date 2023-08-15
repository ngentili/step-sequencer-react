import React, { useState } from 'react';
import 'sass';
import './Step.scss';

interface StepProps {
    enabled: boolean
    primary: boolean
}
interface StepState {
    enabled: boolean
    primary: boolean
}

function Step(props: StepProps) {
    const [state, setState] = useState<StepState>({
        enabled: props.enabled,
        primary: props.primary
    })

    function onClick() {
        setState({ ...state, enabled: !state.enabled })
    }

    let className = 'sequencer-step'
    if (state.enabled) {
        className += ' enabled'
    }
    else if (state.primary) {
        className += ' primary'
    }

    return (
        <div className={className} onClick={e => onClick()}></div>
    )
}

export default Step
