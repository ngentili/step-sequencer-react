import React, { useEffect, useRef } from 'react';
import styles from './TrackTimeline.module.css';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { StepTrack, TrackType } from '../../models';
import { setTrackStep } from '../../sequencerSlice';
import audioContextManager from '../../AudioContextManager';

function TrackTimeline(props: { trackIndex: number }) {
    const dispatch = useAppDispatch()

    // TODO props.trackIndex != trackId sometimes
    // should be getting track by trackId
    const track = useAppSelector(s => s.sequencer.tracks[props.trackIndex])
    const prevTrackRef = useRef(track)
    const isStepTrack = track.type == TrackType.Step

    // on mount
    useEffect(() => {
        console.log(`on mount: ${track.trackId}`)
        audioContextManager.addTrack(track)

        return () => {
            console.log(`on unmount: ${track.trackId}`)
            audioContextManager.removeTrack(track.trackId)
        }
    }, [])

    // on track change
    useEffect(() => {
        console.log('on track changed')

        if (track.type != prevTrackRef.current.type) {
            // type change
            throw new Error('not implemented')
        }

        if (track.volume != prevTrackRef.current.volume) {
            // volume change
            audioContextManager.setTrackVolume(track.trackId, track.volume)
        }

        if (track.pan != prevTrackRef.current.pan) {
            // pan change
            audioContextManager.setTrackPan(track.trackId, track.pan)
        }

        if (isStepTrack) {
            const stepTrack = track as StepTrack
            const prevStepTrack = prevTrackRef as React.MutableRefObject<StepTrack>

            const stepDelta = stepTrack.steps.length - prevStepTrack.current.steps.length

            if (stepDelta > 0) {
                // step(s) added
                console.log(`step(s) added`)
                // TODO unschedule track and reschedule with new timing
                throw new Error('not implemented')
            }
            else if (stepDelta < 0) {
                // step(s) removed
                console.log(`step(s) removed`)
                // TODO unschedule track and reschedule with new timing
                throw new Error('not implemented')
            }

            for (let i = 0; i < stepTrack.steps.length; i++) {
                const step = stepTrack.steps[i]
                const prevStep = prevStepTrack.current.steps[i]

                if (!step || !prevStep) {
                    // TODO handle timing change from above
                    throw new Error('not implemented')
                }

                if (step.enabled != prevStep.enabled) {
                    const position = i / stepTrack.steps.length

                    if (step.enabled) {
                        // step enabled
                        audioContextManager.addSampleToScheduler(track.trackId, position)
                    }
                    else {
                        // step disabled
                        audioContextManager.removeSampleFromScheduler(track.trackId, position)
                    }
                }
            }
        }

        prevTrackRef.current = track

    }, [track])

    if (isStepTrack) {
        const stepTrack = track as StepTrack

        return (
            <div className={styles.trackStepContainer}>
                {stepTrack.steps.map((step, i) => {
                    let interval = stepTrack.steps.length % 3 === 0 ? 3 : 4

                    let className = styles.sequencerStep
                    if (step.enabled) {
                        className += ' ' + styles.enabled
                    }
                    else if (i % interval === 0) {
                        className += ' ' + styles.primary
                    }

                    return (
                        <div className={className} key={i}
                            onClick={e => dispatch(setTrackStep({ trackIndex: props.trackIndex, stepIndex: i, enable: !stepTrack.steps[i].enabled }))}
                        >
                        </div>
                    )
                })}
            </div>
        )
    }
    else {
        return (
            <div>not implemented</div>
        )
    }
}

export default TrackTimeline
