import React from 'react';
import styles from './TrackControl.module.css';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { StepTrack, TrackType } from '../../models';
import { fillTrack, removeTrack, setTrackPan, setTrackStepCount, setTrackVolume } from '../../sequencerSlice';

function TrackControl(props: { trackIndex: number }) {
    const dispatch = useAppDispatch()
    const track = useAppSelector(s => s.sequencer.tracks[props.trackIndex])
    const isStepTrack = track.type == TrackType.Step

    return (
        <div className={styles.trackControls}>
            <span className={styles.trackLabel}>{track.name}</span>

            {/* volume */}
            <input type='range' min={0} max={1} step={0.01} defaultValue={track.volume} className={styles.trackVolume}
                onChange={e => dispatch(setTrackVolume({ trackIndex: props.trackIndex, volume: e.target.valueAsNumber }))}
            >
            </input>

            {/* pan */}
            <input type='range' min={-1} max={1} step={0.01} defaultValue={track.pan} className={styles.trackPan}
                onChange={e => dispatch(setTrackPan({ trackIndex: props.trackIndex, pan: e.target.valueAsNumber }))}
            >
            </input>

            {isStepTrack ? (<>

                {/* step count */}
                <input type='range' min={2} max={32} step={2} defaultValue={(track as StepTrack).steps.length} className={styles.trackStepCount}
                    onChange={e => dispatch(setTrackStepCount({ trackIndex: props.trackIndex, stepCount: e.target.valueAsNumber }))}
                >
                </input>
                <button
                    onClick={e => dispatch(fillTrack({ trackIndex: props.trackIndex, enable: true }))}
                >Fill</button>
                <button
                    onClick={e => dispatch(fillTrack({ trackIndex: props.trackIndex, enable: false }))}
                >Clear</button>
            </>) : null}

            <button onClick={e => dispatch(removeTrack({ trackId: track.trackId }))}>Delete</button>
        </div>
    )
}

export default TrackControl
