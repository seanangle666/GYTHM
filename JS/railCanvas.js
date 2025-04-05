const jdHeight = 1.25; // 判定線的高度(秒)
const laneWidthMultiplier = 1; // 軌道寬度與h的比率
const laneHeight = 16; // 這是軌道的長度(z)
const maxTurnAngle = 30;

let start = false,
    display_midLine = false,
    startTimeDelay = 1, // 離開始的延遲
    time = -startTimeDelay,
    startTime = Date.now(),
    poslane = 0, w, h,
    startPos = 0,
    railW = 0,
    railNums = 8, // 軌道數量 :)
    speed = 4,
    playbackSpeed = 1;

let canvas = document.querySelector('#screen'),
    ctx = canvas.getContext('2d');

let color = {
    tap: 'rgb(0, 255, 187)',
    hold: {
        head: 'rgb(255, 174, 0)',
        body: 'rgb(242, 255, 97)',
    },
    Crash: {
        bar: 'rgb(97, 178, 255)',
        L: 'rgb(0, 0, 255)',
        R: 'rgb(255, 0, 0)',
    },
}

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
    let posx = Math.max(-maxTurnAngle, Math.min(maxTurnAngle, u)) || 0;
    ctx.clearRect(0, 0, w, h);

    // Draw midLine
    if (display_midLine) {
        ctx.lineWidth = h * 0.005;
        ctx.strokeStyle = 'rgb(0,0,100)';
        ctx.beginPath();
        ctx.moveTo(w / 2, 0);
        ctx.lineTo(w / 2, h);
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
    ctx.lineWidth = h * 0.006;

    ctx.strokeStyle = 'GRAY';
    _f1 = to3D(startPos, h, jdHeight);
    _f2 = to3D(startPos + railW * railNums, h, jdHeight);
    ctx.beginPath();
    ctx.moveTo(_f1[0] + w / 2, _f1[1]);
    ctx.lineTo(_f2[0] + w / 2, _f2[1]);
    ctx.stroke();

    // Draw notes
    if (chartNoteData) {
        for (let n of chartNoteData.note) {
            n.drawNote();
        }
    }

    u = Math.min(Math.max(u, - maxTurnAngle), maxTurnAngle);
    // Judgement area
    let posJudge = [
        to3D(startPos + railW * (railNums / 2 - 2) + (u / maxTurnAngle) * (railW * railNums / 4), h, jdHeight),
        to3D(startPos + railW * (railNums / 2 + 2) + (u / maxTurnAngle) * (railW * railNums / 4), h, jdHeight),
        to3D(startPos + railW * (railNums / 2 + 2) + (u / maxTurnAngle) * (railW * railNums / 4), h * -2, jdHeight),
        to3D(startPos + railW * (railNums / 2 - 2) + (u / maxTurnAngle) * (railW * railNums / 4), h * -2, jdHeight)];

    ctx.fillStyle = 'rgba(84, 84, 84, 0.1)';
    let square = new Path2D();
    square.moveTo(posJudge[0][0] + w / 2, posJudge[0][1]);
    square.lineTo(posJudge[1][0] + w / 2, posJudge[1][1]);
    square.lineTo(posJudge[2][0] + w / 2, posJudge[2][1]);
    square.lineTo(posJudge[3][0] + w / 2, posJudge[3][1]);
    square.lineTo(posJudge[0][0] + w / 2, posJudge[0][1]);
    ctx.fill(square, 'evenodd');
    ctx.strokeStyle = 'BLACK';
    ctx.lineWidth = h * 0.005;
    ctx.stroke(square);

    // Highlight rail area
    /*ctx.strokeStyle = 'rgb(255, 0, 0)';
    ctx.lineWidth = 10;
    ctx.strokeRect(startPos + (w / 2) + railW * poslane, 0, h, h);*/

    requestAnimationFrame(update);
}

update();