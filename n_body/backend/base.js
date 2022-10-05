import {ParticleInitializer, PhysicsEngine} from "../simulation/physics.js";

/**
 * @typedef {{physicsTime:number, treeTime: number, tree: {flops: number, depth: number, segmentCount: number}}} StepStatistics
 * @typedef {{timestamp: number, buffer: Float32Array, treeDebug: Array, forceDebug: Array, stats: StepStatistics}} StepResult
 */

export const ITEM_SIZE = 5;

export class BackendBase {
    /**
     * @abstract
     * @param {function(StepResult):void} onDataFn
     * @param {Settings} settings
     * @param {Particle[]=null} particles
     * @return {void}
     */
    init(onDataFn, settings, particles = null) {
    }

    /**
     * @abstract
     * @param {Float32Array} buffer
     * @return {void}
     */
    freeBuffer(buffer) {
    }

    /**
     * @abstract
     * @return {void}
     */
    requestNextStep() {
    }
}

export class BackendImpl {
    settings;
    state;

    physicalEngine;
    particles;
    buffers = [];

    constructor() {
    }

    init(settings, state) {
        this.settings = settings;
        this.physicalEngine = new PhysicsEngine(this.settings);
        this.particles = ParticleInitializer.initialize(this.settings);

        if (state && state.length > 0) {
            const size = Math.min(state.length, this.settings.particleCount);
            for (let i = 0; i < size; i++) {
                const [x, y, velX, velY, mass] = state[i];
                this.particles[i].x = x;
                this.particles[i].y = y;
                this.particles[i].velX = velX;
                this.particles[i].velY = velY;
                this.particles[i].mass = mass;
            }
        }

        for (let i = 0; i < this.settings.bufferCount; i++) {
            this.buffers.push(new Float32Array(this.settings.particleCount * ITEM_SIZE));
        }
    }

    ack(buffer) {
        if (this.buffers.length < this.settings.bufferCount) {
            this.buffers.push(buffer);
        } else {
            console.error("Unexpected ack: buffers already fulfilled");
        }
    }

    /**
     *
     * @param {number} timestamp
     * @return {?StepResult}
     */
    step(timestamp) {
        if (this.buffers.length === 0) {
            console.error("Unexpected step: buffer is not ready");
            return null;
        }

        const tree = this.physicalEngine.step(this.particles);

        const buffer = this.buffers.shift();
        for (let i = 0; i < this.settings.particleCount; i++) {
            buffer[i * ITEM_SIZE] = this.particles[i].x;
            buffer[i * ITEM_SIZE + 1] = this.particles[i].y;
            buffer[i * ITEM_SIZE + 2] = this.particles[i].velX;
            buffer[i * ITEM_SIZE + 3] = this.particles[i].velY;
            buffer[i * ITEM_SIZE + 4] = this.particles[i].mass;
        }

        return {
            timestamp: timestamp,
            buffer: buffer,
            treeDebug: this.settings.debug && this.settings.debugTree ? tree.getDebugData() : [],
            forceDebug: [],
            stats: {
                physicsTime: this.physicalEngine.stats.physicsTime,
                treeTime: this.physicalEngine.stats.treeTime,
                tree: {
                    flops: this.physicalEngine.stats.tree.flops,
                    depth: this.physicalEngine.stats.tree.depth,
                    segmentCount: this.physicalEngine.stats.tree.segmentCount
                }
            }
        }
    }
}

export class WorkerHandler {
    constructor(backend) {
        this.backend = backend;
    }

    handleMessage(e) {
        const {type} = e.data;
        switch (type) {
            case "init": {
                const {settings, state} = e.data;
                this.backend.init(settings, state);
            }
                break;

            case "ack": {
                const {buffer} = e.data;
                this.backend.ack(buffer);
            }
                break;

            case "step": {
                const {timestamp} = e.data;

                const data = this.backend.step(timestamp);
                if (data) {
                    postMessage({type: "data", ...data,}, [data.buffer.buffer]);
                }
            }
                break;
        }
    }

}