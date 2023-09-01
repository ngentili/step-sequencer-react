// import { isValidPan, isValidVolume } from "../../ranges"
// import { StepTrack, Track, TrackType } from "./models"
// // import { StepTrack } from "./SequencerTrack"

// // TODO shared gain/pan nodes for each track?

// interface ScheduledAudio {
//     trackName: string
//     sourceNode: AudioBufferSourceNode
//     startTime: number
// }

// export class AudioContextWrapper {

//     private bpm: number
//     private swing: number
//     private tracks: StepTrack[]
//     private playing = false

//     private audioContext = new AudioContext()
//     private sampleBuffers = new Map<string, AudioBuffer>()
//     private schedule: ScheduledAudio[] = []

//     private schedulerLocked = false
//     private loopStartTimes: number[] = []
//     private nextScheduleTimeout?: NodeJS.Timeout

//     constructor(bpm: number, swing: number, tracks: StepTrack[]) {
//         this.bpm = bpm
//         this.swing = swing
//         this.tracks = tracks
//     }

//     async loadAudio(name: string, url: string) {
//         if (this.sampleBuffers.has(name)) {
//             throw new Error(`Sample already loaded: ${name}`)
//         }
//         const res = await fetch(url)
//         const data = await res.arrayBuffer()
//         const buffer = await this.audioContext.decodeAudioData(data)
//         this.sampleBuffers.set(name, buffer)
//     }

//     private getLoopDuration() {
//         return (60 / this.bpm) * 4
//     }

//     private scheduleAudio(trackName: string, startTime: number, volume: number, pan: number, sampleBuffer: AudioBuffer) {

//         if (!isValidVolume(volume)) {
//             console.error('invalid volume: ' + volume)
//             return
//         }

//         if (!isValidPan(pan,)) {
//             console.error('invalid pan: ' + pan)
//             return
//         }

//         if (startTime < this.audioContext.currentTime) {
//             console.warn('tried to schedule audio in past')
//             return
//         }

//         if (this.schedule.find(s => s.trackName === trackName && s.startTime === startTime)) {
//             console.warn('audio already scheduled')
//             return
//         }

//         // gain
//         let gainNode = new GainNode(this.audioContext, { gain: volume })

//         // pan
//         let panNode = new PannerNode(this.audioContext, { positionX: pan })

//         // source
//         let sourceNode = new AudioBufferSourceNode(this.audioContext, { buffer: sampleBuffer })

//         // connections
//         sourceNode
//             .connect(panNode)
//             .connect(gainNode)
//             .connect(this.audioContext.destination)

//         // schedule audio
//         console.log('asdf')
//         sourceNode.start(startTime)

//         this.schedule.push({
//             trackName,
//             sourceNode,
//             startTime,
//         })
//     }

//     private unscheduleAll() {
//         // let now = this.audioContext.currentTime

//         // iterate list in reverse order to be able to remove from list without breaking iterator
//         for (let i = this.schedule.length - 1; i >= 0; i--) {
//             const a = this.schedule[i]

//             // const startedInPast = a.startTime <= now

//             // const duration = a.sourceNode.buffer?.duration || 0
//             // const endTime = a.startTime + duration
//             // const endsInFuture = endTime > now

//             // const currentlyPlaying = startedInPast && endsInFuture

//             // if (currentlyPlaying) {
//             //     console.log(`not removed, currently playing: ${a.trackName} ${a.startTime}`)
//             //     continue
//             // }

//             a.sourceNode.stop()
//             this.schedule.splice(i, 1)
//             // console.log(`unscheduled ${startedInPast ? 'past' : 'future'}: ${a.trackName} ${a.startTime}`)
//         }
//     }

//     private doScheduling(loopStartTime: number, firstRun = false) {
//         // loopStartTime is NOT AudioContext.currentTime

//         if (this.schedulerLocked) {
//             console.warn('Scheduling simultaneously')
//             return
//         }

//         this.schedulerLocked = true

//         this.loopStartTimes.push(loopStartTime)

//         // console.log(`currentTime: ${this.audioContext.currentTime} | loopStartTime: ${loopStartTime} | delta: ${loopStartTime - this.audioContext.currentTime}`)

//         const timeUntilNextStart = loopStartTime - this.audioContext.currentTime

//         const isLate = timeUntilNextStart < 0

//         const targetEarlyBy = this.getLoopDuration() / 2
//         const isAlmostLate = timeUntilNextStart < targetEarlyBy

//         if (isLate) {
//             console.warn('late schedule start')
//         }
//         else if (isAlmostLate && !firstRun) {
//             // console.warn(`almost late schedule start, early by: ${timeUntilNextStart}`)
//         }
//         else {
//             // console.log(`early by: ${timeUntilNextStart}`)
//         }

//         // set timer for next scheduling run
//         const doNextEarlier = firstRun || isLate || isAlmostLate
//         const nextScheduleTimout = doNextEarlier ? this.getLoopDuration() / 2 : this.getLoopDuration()

//         const nextLoopStartTime = loopStartTime + this.getLoopDuration()
//         this.nextScheduleTimeout = setTimeout(() => this.doScheduling(nextLoopStartTime), nextScheduleTimout * 1000)

//         for (const track of this.tracks) {

//             const trackAudioBuffer = this.sampleBuffers.get(track.name)
//             if (!trackAudioBuffer) {
//                 throw new Error('Audio buffer not found')
//             }

//             for (let stepIndex = 0; stepIndex < track.steps.length; stepIndex++) {
//                 const stepEnabled = track.steps[stepIndex]

//                 if (!stepEnabled) {
//                     continue
//                 }

//                 const position = stepIndex / track.steps.length
//                 const offsetTimeInLoop = position * this.getLoopDuration()
//                 const startTime = loopStartTime + offsetTimeInLoop
//                 const timeUntilStart = startTime - loopStartTime

//                 // only schedule so far out
//                 if (timeUntilStart >= this.getLoopDuration()) {
//                     console.warn(`did not schedule, too far: ${track.name} ${startTime}`)
//                     continue
//                 }

//                 // if already scheduled
//                 if (this.schedule.find(a => a.trackName === track.name && a.startTime === startTime)) {
//                     console.warn(`did not schedule, already exists: ${track.name} ${startTime}`)
//                     continue
//                 }

//                 this.scheduleAudio(track.name, startTime, track.volume, track.pan, trackAudioBuffer)
//                 // console.log(`scheduled audio: ${track.name} ${startTime}`)
//             }
//         }

//         // purge scheduled samples from past
//         let purgeCount = 0

//         // iterate list in reverse order to be able to remove from list without breaking iterator
//         for (let i = this.schedule.length - 1; i >= 0; i--) {
//             const a = this.schedule[i]

//             const startedInPast = a.startTime <= this.audioContext.currentTime

//             const duration = a.sourceNode.buffer?.duration || 0
//             const endTime = a.startTime + duration
//             const endsInFuture = endTime > this.audioContext.currentTime

//             const currentlyPlaying = startedInPast && endsInFuture

//             if (!startedInPast || currentlyPlaying) {
//                 continue
//             }

//             a.sourceNode.stop()
//             this.schedule.splice(i, 1)
//             purgeCount++
//         }

//         // console.log(`purged ${purgeCount} from past`)

//         // iterate list in reverse order to be able to remove from list without breaking iterator
//         for (let i = this.loopStartTimes.length - 1; i >= 0; i--) {
//             const t = this.loopStartTimes[i]

//             // leave current loop, purge others before 
//             if (t < this.audioContext.currentTime - this.getLoopDuration()) {
//                 this.loopStartTimes.splice(i, 1)
//             }
//         }

//         this.schedulerLocked = false
//     }

//     async startPlayback() {
//         this.loopStartTimes = []
//         let audioPosition = this.audioContext.getOutputTimestamp().contextTime || 0
//         this.doScheduling(audioPosition, true)
//         await this.audioContext.resume()
//         this.playing = true
//     }

//     async stopPlayback() {
//         clearTimeout(this.nextScheduleTimeout)
//         this.unscheduleAll()
//         await this.audioContext.suspend()
//         this.playing = false
//     }

//     setBpm(bpm: number) {
//         this.bpm = bpm
//         throw new Error('not implemented')
//     }

//     setSwing(swing: number) {
//         this.swing = swing
//         throw new Error('not implemented')
//     }

//     setTracks(newTracks: StepTrack[]) {
//         newTracks.forEach(t => {
//             if (t.type != TrackType.Step) {
//                 throw new Error(`Track type not implemented: ${t.type}`)
//             }
//         })

//         // find track differences and manually un/schedule
//         if (this.playing!) {

//             // highest loop start time in the past/now
//             const currentLoopStartTime = Math.max(
//                 ...this.loopStartTimes.filter(t => t <= this.audioContext.currentTime)
//             )

//             // loop start times after currentLoopStartTime
//             const futureLoopStartTimes = this.loopStartTimes.filter(t => t > currentLoopStartTime)

//             // current and future loop start times
//             const loopStartTimes = [currentLoopStartTime, ...futureLoopStartTimes]

//             for (let trackIndex = 0; trackIndex < this.tracks.length; trackIndex++) {
//                 const track = this.tracks[trackIndex]

//                 const trackAudioBuffer = this.sampleBuffers.get(track.name)
//                 if (!trackAudioBuffer) {
//                     throw new Error('Audio buffer not found')
//                 }

//                 for (let stepIndex = 0; stepIndex < track.steps.length; stepIndex++) {
//                     const stepEnabled = track.steps[stepIndex]
//                     const newStepEnabled = newTracks[trackIndex].steps[stepIndex]

//                     if (stepEnabled == newStepEnabled) {
//                         continue
//                     }

//                     const position = stepIndex / track.steps.length
//                     const offsetTimeInLoop = position * this.getLoopDuration()

//                     for (const loopStartTime of loopStartTimes) {

//                         const startTime = loopStartTime + offsetTimeInLoop
//                         const timeUntilStart = startTime - loopStartTime

//                         if (stepEnabled && !newStepEnabled) {
//                             // unschedule next and any future repetitions

//                             const startTime = loopStartTime + offsetTimeInLoop

//                             // find scheduled sample by track name and start time
//                             let scheduledIndex = this.schedule.findIndex(a => a.trackName === track.name && a.startTime === startTime)
//                             if (scheduledIndex < 0) {
//                                 continue
//                             }

//                             // unschedule if already scheduled
//                             this.schedule[scheduledIndex].sourceNode.stop()
//                             this.schedule.splice(scheduledIndex, 1)
//                             // console.log(`unscheduled sample: ${track.name} ${startTime}`)
//                         }
//                         else {
//                             // schedule next and any future repetitions

//                             // only schedule so far out
//                             if (timeUntilStart >= this.getLoopDuration()) {
//                                 console.warn(`did not schedule, too far: ${track.name} ${startTime}`)
//                                 continue
//                             }

//                             // if already scheduled
//                             if (this.schedule.find(a => a.trackName === track.name && a.startTime === startTime)) {
//                                 console.warn(`did not schedule, already exists: ${track.name} ${startTime}`)
//                                 continue
//                             }

//                             this.scheduleAudio(track.name, startTime, track.volume, track.pan, trackAudioBuffer)
//                         }
//                     }
//                 }
//             }
//         }

//         this.tracks = newTracks
//     }
// }
