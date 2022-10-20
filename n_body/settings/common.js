import {Property, SettingsBase} from "./base.js";


export class CommonSettings extends SettingsBase {
    static Properties = {
        debug: Property.bool("debug", false).setName("Debug mode"),
        debugTree: Property.bool("debug_tree", null).setName("Debug tree").setDescription("Show Spatial Tree segments"),
        debugVelocity: Property.bool("debug_velocity", false).setName("Debug velocity").setDescription("Show velocity vectors"),
        debugForce: Property.bool("debug_force", null).setName("Debug momentum").setDescription("Show momentum vectors"),
        stats: Property.bool("stats", true).setName("Show statistics"),
    }

    get debug() {return this.config.debug};
    get debugTree() {return this.config.debugTree;}
    get debugVelocity() {return this.config.debugVelocity;}
    get debugForce() {return this.config.debugForce;}
    get stats() {return this.config.stats;}

    constructor(values) {
        super(values);

        if (this.debug === false) {
            this.config.debugTree = false;
            this.config.debugVelocity = false;
            this.config.debugForce = false;
        } else {
            if (this.debugTree === null) {
                this.config.debugTree = this.debug;
            }
            if (this.debugForce === null) {
                this.config.debugForce = this.debugVelocity;
            }
        }
    }
}