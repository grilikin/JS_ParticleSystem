import {Property, SettingsBase} from "./base.js";
import {BackendType} from "./enum.js";

export class SimulationSettings extends SettingsBase {
    static Properties = {
        backend: Property.enum("backend", BackendType, BackendType.worker),
        segmentDivider: Property.int("segment_divider", 2),
        segmentMaxCount: Property.int("segment_max_count", null),
        segmentRandomness: Property.float("segment_random", 0.25),
        bufferCount: Property.int("buffers", 3),
    }

    get backend() {return this.config.backend;}
    get segmentDivider() {return this.config.segmentDivider;}
    get segmentRandomness() {return this.config.segmentRandomness;}
    get segmentMaxCount() {return this.config.segmentMaxCount;}
    get bufferCount() {return this.config.bufferCount;}

    constructor(values) {
        super(values);

        if (!this.segmentMaxCount) {
            this.config.segmentMaxCount = this.backend === BackendType.gpgpu ? 128 : 32;
        }

        this.config.segmentRandomness = Math.max(0, Math.min(1, this.segmentRandomness));
    }
}