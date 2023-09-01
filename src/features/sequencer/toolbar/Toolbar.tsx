import React, { useEffect, useRef } from 'react';
import styles from './Toolbar.module.css';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { reset, setBpm, setSwing, togglePlayback } from '../sequencerSlice';
import audioContextManager from '../AudioContextManager';

function Toolbar() {
    const dispatch = useAppDispatch()

    const bpm = useAppSelector(s => s.sequencer.bpm)
    const prevBpmRef = useRef(bpm)

    const swing = useAppSelector(s => s.sequencer.swing)
    const prevSwingRef = useRef(swing)

    const playing = useAppSelector(s => s.sequencer.playing)
    const prevPlayingRef = useRef(playing)

    // on bpm changed
    useEffect(() => {
        if (bpm != prevBpmRef.current) {
            throw new Error('not implemented')
        }

        audioContextManager.setBpm(bpm)

        prevBpmRef.current = bpm

    }, [bpm])

    // on swing changed
    useEffect(() => {
        if (swing != prevSwingRef.current) {
            throw new Error('not implemented')
        }

        prevSwingRef.current = swing

    }, [swing])

    // on playing changed
    useEffect(() => {
        if (playing != prevPlayingRef.current) {
            if (playing) {
                audioContextManager.start()
            }
            else {
                audioContextManager.stop()
            }
        }

        prevPlayingRef.current = playing

    }, [playing])

    return (
        <div className={styles.toolbar}>

            <input type='number' min={1} max={400} step={1} defaultValue={bpm} placeholder='bpm'
                onChange={e => dispatch(setBpm({ bpm: e.target.valueAsNumber }))}
            >
            </input>

            <input type='range' min={0} max={100} step={1} defaultValue={swing} placeholder='swing'
                onChange={e => dispatch(setSwing({ swing: e.target.valueAsNumber }))}
            >
            </input>

            <button onClick={e => {
                dispatch(togglePlayback())
            }}>
                <span className='material-symbols-outlined'>
                    {playing ? 'stop' : 'play_arrow'}
                </span>
            </button>

            <button
                onClick={e => dispatch(reset())}
            >
                <span className='material-symbols-outlined'>
                    clear_all
                </span>
            </button>
        </div>)
}

export default Toolbar
