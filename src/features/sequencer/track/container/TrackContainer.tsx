import React, { useRef } from 'react';
import styles from './TrackContainer.module.css';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { TrackType } from '../../models';
import { addTrack } from '../../sequencerSlice';
import TrackControl from '../control/TrackControl';
import TrackTimeline from '../timeline/TrackTimeline';
import audioContextManager from '../../AudioContextManager';

function TrackContainer() {
    const dispatch = useAppDispatch()
    const trackCount = useAppSelector(s => s.sequencer.tracks.length)

    const trackNameRef1: React.MutableRefObject<HTMLInputElement | null> = useRef(null)
    const trackUrlRef1: React.MutableRefObject<HTMLInputElement | null> = useRef(null)

    const trackNameRef2: React.MutableRefObject<HTMLInputElement | null> = useRef(null)
    const trackUrlRef2: React.MutableRefObject<HTMLInputElement | null> = useRef(null)

    const trackNameRef3: React.MutableRefObject<HTMLInputElement | null> = useRef(null)
    const trackUrlRef3: React.MutableRefObject<HTMLInputElement | null> = useRef(null)

    return (
        <>
            <div className={styles.trackContainer}>
                {
                    Array.from({ length: trackCount }).map((_, i) => (
                        <div key={i} className={styles.track}>
                            <TrackControl trackIndex={i}></TrackControl>
                            <TrackTimeline trackIndex={i}></TrackTimeline>
                        </div>
                    ))
                }
            </div>

            <div>
                <input placeholder='name' ref={trackNameRef1} defaultValue='kick'></input>
                <input placeholder='url' ref={trackUrlRef1} defaultValue='/audio/kick.mp3'></input>
                <button onClick={async e => {
                    if (trackNameRef1.current && trackUrlRef1.current) {
                        const sampleId = await audioContextManager.loadAudioBuffer(trackUrlRef1.current.value)
                        dispatch(addTrack({ name: trackNameRef1.current.value, type: TrackType.Step, sampleId: sampleId }))
                    }
                }}>New Track</button>
            </div>

            <div>
                <input placeholder='name' ref={trackNameRef2} defaultValue='snare'></input>
                <input placeholder='url' ref={trackUrlRef2} defaultValue='/audio/snare.mp3'></input>
                <button onClick={async e => {
                    if (trackNameRef2.current && trackUrlRef2.current) {
                        const sampleId = await audioContextManager.loadAudioBuffer(trackUrlRef2.current.value)
                        dispatch(addTrack({ name: trackNameRef2.current.value, type: TrackType.Step, sampleId: sampleId }))
                    }
                }}>New Track</button>
            </div>

            <div>
                <input placeholder='name' ref={trackNameRef3} defaultValue='hihat'></input>
                <input placeholder='url' ref={trackUrlRef3} defaultValue='/audio/hihat.mp3'></input>
                <button onClick={async e => {
                    if (trackNameRef3.current && trackUrlRef3.current) {
                        const sampleId = await audioContextManager.loadAudioBuffer(trackUrlRef3.current.value)
                        dispatch(addTrack({ name: trackNameRef3.current.value, type: TrackType.Step, sampleId: sampleId }))
                    }
                }}>New Track</button>
            </div>
        </>
    )
}

export default TrackContainer
