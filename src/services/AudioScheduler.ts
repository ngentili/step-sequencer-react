export interface SequencerAudio {
    trackName: string,
    position: number,
    volume: number,
    pan: number,
}

export interface ScheduledAudio {
    id: string
    source: AudioBufferSourceNode
    time: number
}


export class AudioScheduler {

    // logic
    private audioContext = new AudioContext()
    schedule = new Map<string, ScheduledAudio>()
    sampleBuffers = new Map<string, AudioBuffer>()

    get now() {
        return this.audioContext.currentTime
    }

    // scheduleAudio(trackName: string, volume: number, pan: number, sampleBuffer: AudioBuffer, time: number) {

    //     let audioId = `${trackName}-${time}`

    //     if (this.schedule.has(audioId)) {
    //         console.warn('audioId already exists: ' + audioId)
    //         return
    //     }

    //     // gain
    //     let gainNode = new GainNode(this.audioContext, { gain: volume })

    //     // pan
    //     let panNode = new PannerNode(this.audioContext, { positionX: pan })

    //     // source
    //     let sourceNode = new AudioBufferSourceNode(this.audioContext, { buffer: sampleBuffer })

    //     // connections
    //     sourceNode
    //         .connect(panNode)
    //         .connect(gainNode)
    //         .connect(this.audioContext.destination)

    //     // schedule audio
    //     sourceNode.start(time)

    //     this.schedule.set(audioId, {
    //         id: audioId,
    //         source: sourceNode,
    //         time
    //     })
    // }

    // unscheduleAudio() {

    // }

    start() {
        return this.audioContext.resume()
    }

    stop() {
        return this.audioContext.suspend()
    }

    loadAudio(name: string, audioUrl: string): Promise<void> {
        if (!this.sampleBuffers.has(name)) {
            return fetch(audioUrl)
                .then(res => res.arrayBuffer())
                .then(data => this.audioContext.decodeAudioData(data))
                .then(buffer => { this.sampleBuffers.set(name, buffer) })
        }
        else {
            return Promise.resolve()
        }

    }

    setScheduled(audios: SequencerAudio[]) {
        console.log('setScheduled')
        console.log(audios)

        for (const audio of audios) {
            let audioId = `${audio.trackName}-${audio.position}`

            if (this.schedule.has(audioId)) {
                console.log('audioId already exists: ' + audioId)
                continue
            }

            let audioBuffer = this.sampleBuffers.get(audio.trackName)

            if (!audioBuffer) {
                console.error('audioBuffer not found: ' + audio.trackName)
                continue
            }

            // gain
            let gainNode = new GainNode(this.audioContext, { gain: audio.volume })

            // pan
            let panNode = new PannerNode(this.audioContext, { positionX: audio.pan })

            // source
            let sourceNode = new AudioBufferSourceNode(this.audioContext, { buffer: audioBuffer })

            // connections
            sourceNode
                .connect(panNode)
                .connect(gainNode)
                .connect(this.audioContext.destination)

            // schedule audio
            sourceNode.start(audio.position)

            this.schedule.set(audioId, {
                id: audioId,
                source: sourceNode,
                time: audio.position,
            })
        }
    }
}
