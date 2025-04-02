let start = false;
let time = 0;
let startTime = Date.now();
let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

let poslane = 1;
let w, h, startPos, railW = 0;
let notes = [];

class Note {
    constructor(rail, type, time) {
        this.rail = rail;
        this.type = type; // 0: Tap, 1: Hold, 2: Flick, 3: Crash 4: Change
        this.time = time;
    }
}

for (let i = 1; i < 10; i++) {
    notes.push(new Note(0, 0, i));
}

let bruh = 10;

function to3D(x, y, z) {
    return [x / z, y / z];
}

function tap(x, y, z) {
    ctx.lineWidth = 25 / z;
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.beginPath();
    let f = to3D(startPos + railW * x, h, z);
    ctx.moveTo(f[0] + w / 2, f[1]);
    f = to3D(startPos + railW * (x + 2), h, z);
    ctx.lineTo(f[0] + w / 2, f[1]);
    ctx.stroke();
}

function squareTo(pos, time) {
    let startLane = poslane;
    let _startTime = Date.now();
    let interval = setInterval(() => {
        let elapsed = Date.now() - _startTime;
        let t = Math.min(elapsed / (time * 1000), 1);
        poslane = startLane + (pos - startLane) * t; // 線性插值
        if (t === 1) clearInterval(interval);
    }, 16);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let u = 0; // Define 'u' globally to avoid errors

function update() {
    if (start) time = (Date.now() - startTime) / 1000;
    w = canvas.width;
    h = canvas.height;
    startPos = - (h + railW * 4) / 2;
    railW = (h / 4);

    let posx = Math.max(-32, Math.min(32, u)) || 0;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect((w / 2 + (posx / 32) * h / 2 - h / 2), 0, h, h); // Judgement area's position
    ctx.strokeStyle = 'rgb(255, 0, 0)';
    ctx.lineWidth = 10;
    ctx.strokeRect(startPos + (w / 2) + railW * poslane, 0, h, h); // Rail area's position 
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgb(0,0,100)';
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.beginPath();
        let f = to3D(startPos + railW * i, h, 1);
        ctx.moveTo(f[0] + w / 2, f[1]);
        f = to3D(startPos + railW * i, h, 10);
        ctx.lineTo(f[0] + w / 2, f[1]);
        ctx.stroke();
    }
    for (let i = 1; i < notes.length; i++) {
        tap(notes[i].rail, h, notes[i].time - time);
    }
    requestAnimationFrame(update);
}

update();