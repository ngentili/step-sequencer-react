export interface AudioNodeWrapper extends AudioNode {
    inputs: AudioNodeWrapper[]
}

export function disconnectChain(node: AudioNodeWrapper) {
    for (const input of node.inputs) {
        disconnectChain(input)
    }
    node.inputs = []
    if (node instanceof AudioBufferSourceNode) {
        try {
            node.stop()
        }
        catch (err) {
            // TODO prevent this
            console.error(err)
        }
    }
    node.disconnect()
}

export class AudioBufferSourceNodeWrapper extends AudioBufferSourceNode implements AudioNodeWrapper {
    inputs: AudioNodeWrapper[] = []
}

export class PannerNodeWrapper extends PannerNode implements AudioNodeWrapper {
    inputs: AudioNodeWrapper[] = []
}

export class GainNodeWrapper extends GainNode implements AudioNodeWrapper {
    inputs: AudioNodeWrapper[] = []
}
