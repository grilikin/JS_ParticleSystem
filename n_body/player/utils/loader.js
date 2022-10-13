export class SimulationLoader {
    static VERSION = 1;
    static META_SIZE = 6;

    static loadData(buffer) {
        const meta = SimulationLoader._parseMeta(buffer);

        const metaBytes = meta.metaLength * Uint32Array.BYTES_PER_ELEMENT
        const frameSize = meta.particleCount * meta.componentsCount;
        const totalDataSize = meta.framesCount * frameSize;
        const expectedBytes = totalDataSize * Float32Array.BYTES_PER_ELEMENT + metaBytes;
        if (expectedBytes > buffer.byteLength) {
            throw new Error(`Invalid size. Expected: ${expectedBytes} got: ${buffer.byteLength}`);
        }

        const frames = new Array(meta.framesCount);
        const framesBuffer = new Float32Array(buffer, meta.metaLength * Uint32Array.BYTES_PER_ELEMENT, totalDataSize);
        for (let i = 0; i < meta.framesCount; i++) {
            frames[i] = new Float32Array(framesBuffer.subarray(i * frameSize, i * frameSize + frameSize));
        }

        return {
            frames,
            meta,
        };
    }

    static _parseMeta(buffer) {
        const metaBuffer = new Uint32Array(buffer);
        const metaLength = metaBuffer[0];

        const version = metaBuffer[1];
        if (version !== this.VERSION || metaLength < this.META_SIZE) {
            throw new Error(`Unsupported version or invalid header. Version: ${version}`);
        }

        let idx = 2;
        const recordedRate = metaBuffer[idx++];
        const framesCount = metaBuffer[idx++];
        const particleCount = metaBuffer[idx++];
        const componentsCount = metaBuffer[idx++];

        return {
            metaLength,
            recordedRate,
            framesCount,
            particleCount,
            componentsCount
        }
    }
}