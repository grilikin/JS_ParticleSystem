import {CanvasRenderer, InteractionHandler} from "./renderer.js";
import {Debug} from "./debug.js";
import {Settings} from "./settings.js";
import {DFRIHelper} from "./utils.js";
import {ITEM_SIZE} from "./worker.js";

const SettingsInstance = Settings.fromQueryParams();
const Renderer = new CanvasRenderer(document.getElementById("canvas"), SettingsInstance);
const DFRIHelperInstance = new DFRIHelper(Renderer, SettingsInstance);
const DebugInstance = new Debug(Renderer, SettingsInstance);

const InteractionHandlerInstance = new InteractionHandler(Renderer, SettingsInstance);
InteractionHandlerInstance.enable();

const PhysicsWorker = new Worker("./worker.js", {type: "module"});
PhysicsWorker.onmessage = function (e) {
    if (e.data.type === "data") {
        onData(e.data);
    }
}

const Particles = new Array(SettingsInstance.particleCount);
for (let i = 0; i < SettingsInstance.particleCount; i++) {
    Particles[i] = {x: 0, y: 0, velX: 0, velY: 0, mass: 0};
}

const AheadBuffers = [];
let pendingBufferCount = 0;

const refreshTime = 1000 / SettingsInstance.fps;
let lastRenderTime = performance.now() - refreshTime;
let ready = false;

function onData(data) {
    DFRIHelperInstance.postStepTime(performance.now() - data.timestamp);

    if (!ready) {
        const e = document.getElementById("wait");
        e.style.display = "none";
        ready = true;
    }

    AheadBuffers.push({buffer: data.buffer, treeDebug: data.treeDebug});
    pendingBufferCount -= 1;

    if (AheadBuffers.length + pendingBufferCount < SettingsInstance.bufferCount) {
        requestNextStep();
    }

    if (SettingsInstance.stats) DebugInstance.importPhysicsStats(data);
}

function requestNextStep() {
    pendingBufferCount += 1;
    PhysicsWorker.postMessage({type: "step", timestamp: performance.now()});
}

function prepareNextStep() {
    if (!DFRIHelperInstance.needSwitchBuffer()) {
        return;
    }

    if (AheadBuffers.length === 0) {
        console.warn(`${performance.now().toFixed(0)} Next buffer not ready. Frames may be dropped`);
        return;
    }

    const bufferEntry = AheadBuffers.shift();
    const data = bufferEntry.buffer;
    for (let i = 0; i < SettingsInstance.particleCount; i++) {
        Particles[i].x = data[i * ITEM_SIZE];
        Particles[i].y = data[i * ITEM_SIZE + 1];
        Particles[i].velX = data[i * ITEM_SIZE + 2];
        Particles[i].velY = data[i * ITEM_SIZE + 3];
        Particles[i].mass = data[i * ITEM_SIZE + 4];
    }

    if (SettingsInstance.debug) DebugInstance.importTreeDebugData(bufferEntry.treeDebug);

    PhysicsWorker.postMessage({type: "ack", buffer: data}, [data.buffer]);
    requestNextStep();

    if (DFRIHelperInstance.needSwitchBuffer()) {
        DFRIHelperInstance.bufferSwitched(Particles, AheadBuffers[0]);
    }
}

function render(timestamp) {
    if (!ready) {
        lastRenderTime = timestamp;
        requestAnimationFrame(render);
        return;
    }

    prepareNextStep();
    if (SettingsInstance.enableDFRI) {
        DFRIHelperInstance.render(Particles);
    } else {
        Renderer.render(Particles);
    }

    if (SettingsInstance.debug) DebugInstance.drawTreeDebug();

    const elapsed = timestamp - lastRenderTime;
    DFRIHelperInstance.postRenderTime(elapsed);
    if (SettingsInstance.stats) {
        DebugInstance.renderTime = Renderer.stats.renderTime;
        DebugInstance.bufferCount = AheadBuffers.length;
        DebugInstance.interpolateFrames = DFRIHelperInstance.interpolateFrames;
        DebugInstance.postFrameTime(elapsed);
        DebugInstance.drawStats();
    }

    lastRenderTime = timestamp;
    requestAnimationFrame(render);
}

PhysicsWorker.postMessage({type: "init", settings: SettingsInstance});

requestNextStep();
requestAnimationFrame(render);