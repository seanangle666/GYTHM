let start = false,
    display_midLine = false,
    startTimeDelay = 4 * (60 / 240), // 離開始的延遲
    time = -startTimeDelay, startTime = Date.now(),
    canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d');

let color = {
    tap: 'rgb(0, 0, 255)',
    hold: 'rgb(223, 255, 97)',
    Crash: {
        L: 'rgb(97, 178, 255)',
        R: 'rgb(255, 0, 0)',
    },
}

let poslane = 0, w, h, startPos, railW = 0;
let notes = [];
const railNums = 8, // 軌道數量 :)
    jdHeight = 1.2,// 判定線的高度(秒)
    laneWidthMultiplier = 1,// 軌道寬度與h的比率
    laneHeight = 16,// 這是軌道的長度(z)
    maxTurnAngle = 30;
let speed = 10;
let playbackSpeed = 1;

class Note {
    constructor(rail = 0, type = 0, _time = 0, detail = 0) {
        this.rail = rail;
        this.type = type; // 0: Tap, 1: Hold, 2: Flick, 3: Crash, 4: Change
        this._time = _time;
        this.detail = detail;
    }

    drawNote() {
        let t = (this._time - time * playbackSpeed);
        switch (this.type) {
            case 0: // Tap Note
                if (t >= 0 && t < laneHeight / speed) {  // 限制可以顯示的高度到laneHeight
                    t = t * speed + jdHeight
                    ctx.lineWidth = h / t * 0.03;
                    ctx.strokeStyle = color.tap;
                    ctx.beginPath();
                    let f1 = to3D(startPos + railW * this.rail, h, t);
                    let f2 = to3D(startPos + railW * (this.rail + 2), h, t);
                    ctx.moveTo(f1[0] + w / 2, f1[1]);
                    ctx.lineTo(f2[0] + w / 2, f2[1]);
                    ctx.stroke();
                }
                break;
            case 1: // Hold Note
                if (t >= (- this.detail) && t < laneHeight / speed) {  // 加上Hold的秒數
                    t = t * speed + jdHeight;
                    ctx.fillStyle = color.hold;
                    ctx.beginPath();
                    let f1 = to3D(startPos + railW * this.rail, h, Math.max(t, jdHeight));
                    let f2 = to3D(startPos + railW * (this.rail + 2), h, Math.max(t, jdHeight));
                    let f3 = to3D(startPos + railW * this.rail, h, Math.max(t + this.detail, jdHeight));
                    let f4 = to3D(startPos + railW * (this.rail + 2), h, Math.max(t + this.detail, jdHeight));
                    let hold = new Path2D();
                    hold.moveTo(f1[0] + w / 2, f1[1]);
                    hold.lineTo(f2[0] + w / 2, f2[1]);
                    hold.lineTo(f4[0] + w / 2, f4[1]);
                    hold.lineTo(f3[0] + w / 2, f3[1]);
                    hold.lineTo(f1[0] + w / 2, f1[1]);
                    ctx.fill(hold, 'evenodd');
                }
                break;
            case 3: // Crash Note
                if (t >= 0 && t < laneHeight / speed) {  // 限制可以顯示的高度到laneHeight
                    t = t * speed + jdHeight
                    ctx.lineWidth = h / t * 0.04;
                    ctx.strokeStyle = color.Crash[(this.detail == 1) ? 'R' : 'L'];
                    ctx.beginPath();
                    let posCrush = to3D(startPos + railW * this.rail, h, t);
                    ctx.moveTo(posCrush[0] + w / 2, posCrush[1]);
                    ctx.lineTo(posCrush[0] + w / 2, 0);
                    ctx.stroke();
                    const arrowSize = h * 0.1;
                    const disToCrash = h * -0.2;
                    let f1, f2, f3, arrow;
                    switch (this.detail) {
                        case 0: // 左
                            ctx.fillStyle = color.Crash.L;
                            arrow = new Path2D();
                            f1 = to3D(startPos + (railW * this.rail) + disToCrash + arrowSize, h - h * 0.5 + arrowSize, t);
                            f2 = to3D(startPos + (railW * this.rail) + disToCrash, h - h * 0.5, t);
                            f3 = to3D(startPos + (railW * this.rail) + disToCrash + arrowSize, h - h * 0.5 - arrowSize, t);
                            arrow.moveTo(f1[0] + w / 2, f1[1]);
                            arrow.lineTo(f2[0] + w / 2, f2[1]);
                            arrow.lineTo(f3[0] + w / 2, f3[1]);
                            arrow.lineTo(f1[0] + w / 2, f1[1]);
                            ctx.fill(arrow, 'evenodd');
                            break;
                        case 1: // 右
                            ctx.fillStyle = color.Crash.R;
                            arrow = new Path2D();
                            f1 = to3D(startPos + (railW * this.rail) - disToCrash - arrowSize, h - h * 0.5 + arrowSize, t);
                            f2 = to3D(startPos + (railW * this.rail) - disToCrash, h - h * 0.5, t);
                            f3 = to3D(startPos + (railW * this.rail) - disToCrash - arrowSize, h - h * 0.5 - arrowSize, t);
                            arrow.moveTo(f1[0] + w / 2, f1[1]);
                            arrow.lineTo(f2[0] + w / 2, f2[1]);
                            arrow.lineTo(f3[0] + w / 2, f3[1]);
                            arrow.lineTo(f1[0] + w / 2, f1[1]);
                            ctx.fill(arrow, 'evenodd');
                            break;
                    }
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

function decode_chart(chart) {
    _httpRequest = new XMLHttpRequest();
    _httpRequest.open("GET", "../CHART/" + chart + ".txt", false);
    _httpRequest.send();
    if (_httpRequest.status == 200) {
        chart = _httpRequest.responseText;
    } else {
        return Error("unable to find chart : " + chart);
    }
    for (let i = 0; i < 6 * 16; i++) {
        notes.push(new Note(0, 0, i * (60 / 240) / 3));
        notes.push(new Note(6, 0, i * (60 / 240) / 3));
        notes.push(new Note(2, 0, (i + 0.5) * (60 / 240) / 3));
        notes.push(new Note(4, 1, i * (60 / 240) / 3, (60 / 240) / 3 * 5));
    }
    return chart;
}

console.log(decode_chart(String(1).padStart(5, '0') + "-" + "master"));

function to3D(x, y, z) {
    // to3d(rail, canvas height, time)
    const zMul = 1;
    return z > 0 ? [x / z * zMul, y / z * zMul] : [-Infinity, -Infinity];
}

/*function squareTo(pos, time) {      // smooth move rail area
    let startLane = poslane;
    let _startTime = Date.now();
    let interval = setInterval(() => {
        let elapsed = Date.now() - _startTime;
        let t = Math.min(elapsed / (time * 1000), 1);
        poslane = startLane + (pos - startLane) * t;
        if (t === 1) clearInterval(interval);
    }, 16);
}*/

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

    // Draw midLine
    if (display_midLine) {
        ctx.lineWidth = h * 0.005;
        ctx.strokeStyle = 'rgb(0,0,100)';
        ctx.beginPath();
        ctx.moveTo(w / 2 - h * 0.0025, 0);
        ctx.lineTo(w / 2 - h * 0.0025, h);
        ctx.stroke();
    }

    // Draw rails
    ctx.lineWidth = h * 0.002;
    for (let i = 0; i <= railNums; i++) {
        ctx.strokeStyle =
            (i % 2 == 0) ? 'rgb(0, 0, 0)' : 'rgb(70, 70, 70)';   // 這效果就是偶數黑軌，奇數白軌
        ctx.beginPath();
        let f1 = to3D(startPos + railW * i, h, 1);
        let f2 = to3D(startPos + railW * i, h, laneHeight);
        ctx.moveTo(f1[0] + w / 2, f1[1]);
        ctx.lineTo(f2[0] + w / 2, f2[1]);
        ctx.stroke();
    }

    // Draw judge line
    ctx.lineWidth = 12;
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

    u = Math.min(Math.max(u, - maxTurnAngle), maxTurnAngle);
    // Judgement area
    let posJudge = [
        to3D(startPos + railW * (railNums / 2 - 2) + (u / 30) * (railW * railNums / 4), h, jdHeight),
        to3D(startPos + railW * (railNums / 2 + 2) + (u / 30) * (railW * railNums / 4), h, jdHeight),
        to3D(startPos + railW * (railNums / 2 + 2) + (u / 30) * (railW * railNums / 4), h * -2, jdHeight),
        to3D(startPos + railW * (railNums / 2 - 2) + (u / 30) * (railW * railNums / 4), h * -2, jdHeight)];
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    let square = new Path2D();
    square.moveTo(posJudge[0][0] + w / 2, posJudge[0][1]);
    square.lineTo(posJudge[1][0] + w / 2, posJudge[1][1]);
    square.lineTo(posJudge[2][0] + w / 2, posJudge[2][1]);
    square.lineTo(posJudge[3][0] + w / 2, posJudge[3][1]);
    square.lineTo(posJudge[0][0] + w / 2, posJudge[0][1]);
    ctx.fill(square, 'evenodd');

    // Highlight rail area
    /*ctx.strokeStyle = 'rgb(255, 0, 0)';
    ctx.lineWidth = 10;
    ctx.strokeRect(startPos + (w / 2) + railW * poslane, 0, h, h);*/

    requestAnimationFrame(update);
}

update();