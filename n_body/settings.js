const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

export const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.orientation !== undefined;

export const PARTICLE_INIT = params.particle_init || "circle";
export const PARTICLE_CNT = ~~params.particle_count || (IS_MOBILE ? 10000 : 20000);
export const RESISTANCE = Number.parseFloat(params.resistance) || 0.999;
export const G = Number.parseFloat(params.g) || 1;
export const PARTICLE_G = G / PARTICLE_CNT * 10;

export const MOUSE_POINT_RADIUS = 3;
export const ENABLE_MOUSE = params.mouse ? Number.parseInt(params.mouse) : false;
export const FPS = ~~params.fps || 60;

export const SEGMENT_DIVIDER = Math.max(2, ~~params.segment_divider || 2);
export const SEGMENT_MAX_COUNT = Math.max(2, ~~params.segment_max_count || 128);

export const DEBUG = params.debug ? Number.parseInt(params.debug) : false;
export const STATS = params.stats ? Number.parseInt(params.stats) : true;
export const DEBUG_DATA = {};

// MIN distance for particles interaction, to avoid infinitive forces
export const MIN_DISTANCE_SQ = Math.pow(20, 2);