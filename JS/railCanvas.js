let start = false, display_midLine = false;
let time = 0, startTime = Date.now();
let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

let poslane = 0, w, h, startPos, railW = 0;
let notes = [];

class Note {
    constructor(rail, type, time, detail) {
        this.rail = rail;
        this.type = type; // 0: Tap, 1: Hold, 2: Flick, 3: Crash, 4: Change
        this.time = time;
        this.detail = detail;
    }

    drawNote() {
        let t = this.time - time;
        switch (this.type) {
            case 0: // Tap Note
                if (t > 0) {
                    ctx.lineWidth = 25 / t;
                    ctx.strokeStyle = 'rgb(0,0,0)';
                    ctx.beginPath();
                    let f1 = to3D(startPos + railW * this.rail, h, t);
                    let f2 = to3D(startPos + railW * (this.rail + 2), h, t);
                    ctx.moveTo(f1[0] + w / 2, f1[1]);
                    ctx.lineTo(f2[0] + w / 2, f2[1]);
                    ctx.stroke();
                }
                break;

            case 1: // Hold Note
                if (t > 0) {
                    ctx.lineWidth = 25 / t;
                    ctx.strokeStyle = 'rgb(0,0,0)';
                    ctx.beginPath();
                    let f1 = to3D(startPos + railW * this.rail, h, t);
                    let f2 = to3D(startPos + railW * (this.rail + 2), h, t);
                    let f3 = to3D(startPos + railW * this.rail, h, t + this.detail);
                    let f4 = to3D(startPos + railW * (this.rail + 2), h, t + this.detail);
                    let hold = new Path2D();
                    hold.moveTo(f1[0] + w / 2, f1[1]);
                    hold.lineTo(f2[0] + w / 2, f2[1]);
                    hold.lineTo(f4[0] + w / 2, f4[1]);
                    hold.lineTo(f3[0] + w / 2, f3[1]);
                    hold.lineTo(f1[0] + w / 2, f1[1]);
                    ctx.fillStyle = 'rgb(0,0,0)';
                    ctx.fill(hold, 'evenodd');
                }
                break;


            case 4: // Change Note
                if (time > this.time) {
                    poslane = this.rail;
                }
                break;
        }
    }
}

notes.push(new Note(0, 1, 3, 1));   // Test chart creator
for (let i = 0; i < 100; i++) {
    notes.push(new Note(2, 0, (60 / 140) * i));
}

function to3D(x, y, z) {    // to3d(rail, canvas height, time)
    return [x / z, y / z];
}

function squareTo(pos, time) {      // smooth move rail area
    let startLane = poslane;
    let _startTime = Date.now();
    let interval = setInterval(() => {
        let elapsed = Date.now() - _startTime;
        let t = Math.min(elapsed / (time * 1000), 1);
        poslane = startLane + (pos - startLane) * t;
        if (t === 1) clearInterval(interval);
    }, 16);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let u = 0; // 定義 'u' 避免錯誤

function update() {
    if (start) time = (Date.now() - startTime) / 1000;
    w = canvas.width;
    h = canvas.height;
    railW = h / 4;
    startPos = -(h + railW * 4) / 2;

    let posx = Math.max(-32, Math.min(32, u)) || 0;
    ctx.clearRect(0, 0, w, h);

    // Judgement area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect((w / 2 + (posx / 32) * h / 2 - h / 2), 0, h, h);

    // Draw midLine
    if (display_midLine) {
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'rgb(0,0,100)';
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
        ctx.stroke();
    }

    // Draw rails
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.beginPath();
        let f1 = to3D(startPos + railW * i, h, 1);
        let f2 = to3D(startPos + railW * i, h, 10);
        ctx.moveTo(f1[0] + w / 2, f1[1]);
        ctx.lineTo(f2[0] + w / 2, f2[1]);
        ctx.stroke();
    }

    // Draw notes
    for (let note of notes) {
        note.drawNote();
    }

    // Highlight rail area
    ctx.strokeStyle = 'rgb(255, 0, 0)';
    ctx.lineWidth = 10;
    ctx.strokeRect(startPos + (w / 2) + railW * poslane, 0, h, h);

    requestAnimationFrame(update);
}

update();