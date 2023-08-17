import React from 'react';
import './Toolbar.scss';

interface ToolbarProps {
    // input
    playing: boolean
    // output
    bpmChanged: (value: number) => void
    swingChanged: (value: number) => void
    playStopClicked: () => void
    resetClicked: () => void
}

const DEFAULT_BPM = 100
const DEFAULT_SWING = 0

function Toolbar(props: ToolbarProps) {

    // console.log('render Toolbar')

    return (
        <div className='toolbar'>

            <input type='number' min={1} max={400} step={1} defaultValue={DEFAULT_BPM} placeholder='bpm'
                onChange={e => props.bpmChanged(e.target.valueAsNumber)}>
            </input>

            <input type='range' min={0} max={100} step={1} defaultValue={DEFAULT_SWING} placeholder='swing'
                onChange={e => props.swingChanged(e.target.valueAsNumber)}>
            </input>

            <button onClick={e => props.playStopClicked()}>
                <span className="material-symbols-outlined">
                    play_pause
                </span>
            </button>

            <button onClick={e => props.resetClicked()}>
                <span className="material-symbols-outlined">
                    clear_all
                </span>
            </button>
        </div>)
}

export default Toolbar
