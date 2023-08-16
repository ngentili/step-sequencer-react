export class AudioScheduler {

    // logic
    audioContext = new AudioContext()
    schedule = new Map<string, ScheduledAudio>()
    sampleBuffers = new Map<string, AudioBuffer>()

    scheduleAudio(trackName: string, volume: number, pan: number, sampleBuffer: AudioBuffer, time: number) {

        let audioId = `${trackName}-${time}`

        if (this.schedule.has(audioId)) {
            console.warn('audioId already exists: ' + audioId)
            return
        }

        // gain
        let gainNode = new GainNode(this.audioContext, { gain: volume })

        // pan
        let panNode = new PannerNode(this.audioContext, { positionX: pan })

        // source
        let sourceNode = new AudioBufferSourceNode(this.audioContext, { buffer: sampleBuffer })

        // connections
        sourceNode
            .connect(panNode)
            .connect(gainNode)
            .connect(this.audioContext.destination)

        // schedule audio
        sourceNode.start(time)

        this.schedule.set(audioId, {
            id: audioId,
            source: sourceNode,
            time
        })
    }

    unscheduleAudio() {

    }

    start() {
        return this.audioContext.resume()
        //     .then(() => {
        //         let buffer = this.audioContext.createBufferSource()
        //         buffer.buffer =
        //             this.scheduleAudio('snare', 100, 0,)
        //     })
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
}

export interface ScheduledAudio {
    id: string
    source: AudioBufferSourceNode
    time: number
}
