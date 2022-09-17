const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.orientation !== undefined;

const MOUSE_POINT_RADIUS = 3;
const PARTICLE_CNT = ~~params.particle_count || (isMobile ? 20000 : 50000);
const FPS = ~~params.fps || 60;
const G = 9;
const Resistance = 0.99;

const canvas = document.getElementById("canvas");

const rect = canvas.getBoundingClientRect();

const CanvasWidth = rect.width;
const CanvasHeight = rect.height;

canvas.style.width = CanvasWidth + "px";
canvas.style.height = CanvasHeight + "px";
canvas.width = CanvasWidth;
canvas.height = CanvasHeight;

const ctx = canvas.getContext('2d');

const MousePosition = {x: CanvasWidth / 2, y: CanvasHeight / 2};
const Particles = new Array(PARTICLE_CNT);

function init() {
    for (let i = 0; i < PARTICLE_CNT; i++) {
        Particles[i] = {
            x: Math.random() * CanvasWidth,
            y: Math.random() * CanvasHeight,
            velX: 0, velY: 0
        };
    }

    canvas.onmousemove = canvas.ontouchmove = (e) => {
        const point = e.touches ? e.touches[0] : e
        const bcr = e.target.getBoundingClientRect();

        MousePosition.x = point.clientX - bcr.x;
        MousePosition.y = point.clientY - bcr.y;

        e.preventDefault();
    }
}

function animateParticle(particle, g, position) {
    const dx = particle.x - position.x,
        dy = particle.y - position.y;

    const distSquare = Math.pow(dx, 2) + Math.pow(dy, 2);

    let force = 0;
    if (distSquare >= 400) // A magic number represent min process distance
    {
        force = -g / distSquare;
    }

    const xForce = dx * force
        , yForce = dy * force;

    particle.velX *= Resistance;
    particle.velY *= Resistance;

    particle.velX += xForce;
    particle.velY += yForce;

    particle.x += particle.velX;
    particle.y += particle.velY;

    if (particle.x > CanvasWidth)
        particle.x -= CanvasWidth;
    else if (particle.x < 0)
        particle.x += CanvasWidth;

    if (particle.y > CanvasHeight)
        particle.y -= CanvasHeight;
    else if (particle.y < 0)
        particle.y += CanvasHeight;
}

init();

setInterval(() => {
    ctx.clearRect(0, 0, CanvasWidth, CanvasHeight);

    const imageData = ctx.createImageData(CanvasWidth, CanvasHeight);
    const imageWidth = imageData.width;
    for (let i = 0; i < Particles.length; i++) {
        const p = Particles[i];
        animateParticle(p, G, MousePosition);

        const index = (Math.floor(p.x) + Math.floor(p.y) * imageWidth) * 4;
        imageData.data[index] = 0x00;
        imageData.data[index + 1] = 125 + Math.floor(p.velX * 20);
        imageData.data[index + 2] = 125 + Math.floor(p.velY * 20);
        imageData.data[index + 3] = 0xff;
    }
    ctx.putImageData(imageData, 0, 0);

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(MousePosition.x - MOUSE_POINT_RADIUS / 2, MousePosition.y - MOUSE_POINT_RADIUS / 2,
        MOUSE_POINT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
}, 1000 / FPS);