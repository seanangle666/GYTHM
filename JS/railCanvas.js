let start = false, display_midLine = false;
let startTimeDelay = 0; // 離開始的延遲
let time = -startTimeDelay, startTime = Date.now();
let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

let poslane = 0, w, h, startPos, railW = 0;
let notes = [];
const railNums = 8; // 軌道數量:)
const jdHeight = 1.5; // 判定線的高度(秒)
const laneWidthMultiplier = 0.8; // 軌道寬度與h的比率
const laneHeight = 10; // 這是軌道的長度(z)

class Note {
    constructor(rail = 0, type = 0, _time = 0, detail = 0) {
        this.rail = rail;
        this.type = type; // 0: Tap, 1: Hold, 2: Flick, 3: Crash, 4: Change
        this._time = _time;
        this.detail = detail;
    }

    drawNote() {
        let t = this._time - time + jdHeight;
        switch (this.type) {
            case 0: // Tap Note
                if (t >= jdHeight && t < laneHeight) {// 限制可以顯示的高度到laneHeight
                    ctx.lineWidth = 45 / t;
                    ctx.strokeStyle = 'rgb(240, 194, 57)';
                    // 我先把Tap改成橘色的
                    ctx.beginPath();
                    let f1 = to3D(startPos + railW * this.rail, h, t);
                    let f2 = to3D(startPos + railW * (this.rail + 2), h, t);
                    ctx.moveTo(f1[0] + w / 2, f1[1]);
                    ctx.lineTo(f2[0] + w / 2, f2[1]);
                    ctx.stroke();
                }
                break;

            case 1: // Hold Note
                if (t >= (jdHeight - this.detail) && t < laneHeight) {// 加上Hold的秒數
                    ctx.fillStyle = 'rgb(97, 178, 255)';
                    // 把Hold改成藍的
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

notes.push(new Note(0, 1, 1, 1));   // Test chart creator
for (let i = 0; i < 100; i++) {
    notes.push(new Note(2, 0, i)); // 理論上來說是不是可以放浮點數？？？
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
    canvas.width = window.innerWidth * 2; // 提高解析度所以不要動
    canvas.height = window.innerHeight * 2; // 提高解析度所以不要動
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let u = 0; // 定義 'u' 避免錯誤

function update() {
    if (start) time = (Date.now() - startTime) / 1000 - startTimeDelay;
    w = canvas.width;
    h = canvas.height;
    railW = h / (railNums / 2);
    startPos = - (h + railW * (railNums / 2)) / 2;
    startPos *= laneWidthMultiplier;
    railW *= laneWidthMultiplier;
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
    ctx.lineWidth = 2;
    for (let i = 0; i <= railNums; i++) {
        ctx.strokeStyle =
            (i % 2 == 0) ?
                'rgb(0, 0, 0)' : 'rgb(70, 70, 70)';
        // 這效果就是偶數軌黑，奇數白

        ctx.beginPath();
        let f1 = to3D(startPos + railW * i, h, 1);
        let f2 = to3D(startPos + railW * i, h, laneHeight);
        ctx.moveTo(f1[0] + w / 2, f1[1]);
        ctx.lineTo(f2[0] + w / 2, f2[1]);
        ctx.stroke();
    }

    // Draw judge line
    ctx.lineWidth = 10;
    let _f1 = to3D(startPos, h, jdHeight);
    let _f2 = to3D(startPos + railW * railNums, h, jdHeight);
    ctx.beginPath();
    ctx.moveTo(_f1[0] + w / 2, _f1[1]);
    ctx.lineTo(_f2[0] + w / 2, _f2[1]);
    ctx.stroke();

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