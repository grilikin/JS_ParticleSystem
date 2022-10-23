import {ComponentType, Property, SettingsBase} from "./base.js";
import {RenderType} from "./enum.js";


export class RenderSettings extends SettingsBase {
    static Properties = {
        render: Property.enum("render", RenderType, null)
            .setName("Render")
            .setBreaks(ComponentType.renderer, ComponentType.dfri, ComponentType.debug),
        useDpr: Property.bool("dpr", null)
            .setName("Use DPR").setDescription("Draw respecting Device Pixel Ratio")
            .setAffects(ComponentType.renderer, ComponentType.debug),
        dprRate: Property.float("dpr_rate", 0)
            .setName("Custom DPR value").setDescription("Override default Device Pixel Ratio")
            .setAffects(ComponentType.renderer, ComponentType.debug)
            .setConstraints(0, 10),
        enableFilter: Property.bool("filter", false)
            .setExportable(true)
            .setName("Enable filters").setDescription("Make image brighter and change color over time")
            .setAffects(ComponentType.renderer),
        enableBlending: Property.bool("blend", true)
            .setExportable(true)
            .setName("Enable blending").setDescription("Enable color blending for particles")
            .setAffects(ComponentType.renderer),
        enableDFRI: Property.bool("dfri", true)
            .setName("Enable DFRI").setDescription("Enable frame rate interpolation for smoother render")
            .setBreaks(ComponentType.dfri)
            .setAffects(ComponentType.debug),
        DFRIMaxFrames: Property.int("dfri_max", 120)
            .setName("Max DFRI frames").setDescription("Maximum frame to be generated by DFRI")
            .setAffects(ComponentType.dfri)
            .setConstraints(1, 240),
    };

    static PropertiesDependencies = new Map([
        [this.Properties.useDpr, [this.Properties.dprRate]],
        [this.Properties.enableDFRI, [this.Properties.DFRIMaxFrames]]
    ]);

    get render() {return this.config.render}
    get useDpr() {return this.config.useDpr}
    get enableFilter() {return this.config.enableFilter}
    get enableBlending() {return this.config.enableBlending}
    get enableDFRI() {return this.config.enableDFRI}
    get DFRIMaxFrames() {return this.config.DFRIMaxFrames}
    get dprRate() {return this.config.dprRate}

    constructor(values) {
        super(values);

        if (!this.render) {
            this.config.render = WebGL2RenderingContext === undefined ? RenderType.canvas : RenderType.webgl2;
        }

        if (this.useDpr === null) {
            this.config.useDpr = this.render === RenderType.webgl2;
        }
    }
}