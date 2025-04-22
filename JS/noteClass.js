const noteHeight = 0.1;

class Note {
    constructor(rail, type, _time, detail) {
        this.rail = parseInt(`${rail}`,16)/2;
        this.type = type ?? ''; // empty : Tap, h: Hold, f: Flick, c: Crash, g: Change
        this._time = _time;
        this.detail = detail;
        this.actived = false;
    }

    drawNote() {
        let t = (this._time / playbackSpeed - time);
        let _t = t * speed + jdHeight;
        switch (this.type) {
            default: // Tap Note
                if (t >= 0 && t < laneHeight / speed) {  // 限制可以顯示的高度到laneHeight
                    ctx.fillStyle = color.tap;
                    drawTap(_t, this.rail, (this.detail ?? '').width);
                }
                if (t <= 0) {
                    if (!this.actived) {
                        //alignAudio();
                        this.actived = true;
                        playSFX('guide');
                    }
                } else {
                    this.actived = false;
                }
                break;
            case 'h': // Hold Note
                let _holdTime = this.detail.holdTime / playbackSpeed * speed;
                if (t >= - this.detail.holdTime / playbackSpeed && t < laneHeight / speed) {  // 加上Hold的秒數
                    ctx.fillStyle = color.hold.body;
                    drawHold(_t, this.rail, _holdTime, (this.detail ?? '').width);
                    ctx.fillStyle = color.hold.head;
                    drawTap(Math.max(_t, jdHeight), this.rail, (this.detail ?? '').width);
                    ctx.fillStyle = color.hold.head;
                    drawTap(_t + _holdTime, this.rail, (this.detail ?? '').width);
                }
                break;
            case 'c': // Crash Note
                if (t >= 0 && t < laneHeight / speed) {  // 限制可以顯示的高度到laneHeight
                    ctx.lineWidth = h / _t * 0.04;
                    ctx.strokeStyle = color.Crash.bar;
                    ctx.beginPath();
                    let posCrush = to3D(startPos + railW * this.rail, h, _t);
                    ctx.moveTo(posCrush[0] + w / 2, posCrush[1]);
                    ctx.lineTo(posCrush[0] + w / 2, 0);
                    ctx.stroke();
                    const arrowSize = h * 0.1;
                    const disToCrash = h * -0.2;
                    let f1, f2, f3, arrow;
                    arrow = new Path2D();
                    switch (this.detail.face) {
                        case "L": // 左
                            ctx.fillStyle = color.Crash.L;
                            f1 = to3D(startPos + (railW * this.rail) + disToCrash + arrowSize, h - h * 0.5 + arrowSize, _t);
                            f2 = to3D(startPos + (railW * this.rail) + disToCrash, h - h * 0.5, _t);
                            f3 = to3D(startPos + (railW * this.rail) + disToCrash + arrowSize, h - h * 0.5 - arrowSize, _t);
                            break;
                        case "R": // 右
                            ctx.fillStyle = color.Crash.R;
                            f1 = to3D(startPos + (railW * this.rail) - disToCrash - arrowSize, h - h * 0.5 + arrowSize, _t);
                            f2 = to3D(startPos + (railW * this.rail) - disToCrash, h - h * 0.5, _t);
                            f3 = to3D(startPos + (railW * this.rail) - disToCrash - arrowSize, h - h * 0.5 - arrowSize, _t);
                            break;
                    }
                    arrow.moveTo(f1[0] + w / 2, f1[1]);
                    arrow.lineTo(f2[0] + w / 2, f2[1]);
                    arrow.lineTo(f3[0] + w / 2, f3[1]);
                    arrow.lineTo(f1[0] + w / 2, f1[1]);
                    ctx.fill(arrow, 'evenodd');
                }
                if (t <= 0) {
                    if (!this.actived) {
                        this.actived = true;
                        playSFX('guide');
                    }
                } else {
                    this.actived = false;
                }
                break;
            case 'g': // Change Note
                if (t <= 0) {
                    poslane = this.rail;
                }
                break;
        }
    }
}

function drawTap(t, rail, noteW = 2) {
    noteW = parseFloat(noteW);
    ctx.beginPath();
    let f1 = to3D(startPos + railW * rail,
        h,
        t + noteHeight);
    let f2 = to3D(startPos + railW * (rail + noteW),
        h,
        t + noteHeight);
    let f3 = to3D(startPos + railW * rail,
        h,
        t - noteHeight);
    let f4 = to3D(startPos + railW * (rail + noteW),
        h,
        t - noteHeight);
    let tap = new Path2D();
    tap.moveTo(f1[0] + w / 2, f1[1]);
    tap.lineTo(f2[0] + w / 2, f2[1]);
    tap.lineTo(f4[0] + w / 2, f4[1]);
    tap.lineTo(f3[0] + w / 2, f3[1]);
    tap.lineTo(f1[0] + w / 2, f1[1]);
    ctx.fill(tap, 'evenodd');
}

function drawHold(t, rail, holdTime, noteW = 2) {
    noteW = parseFloat(noteW);
    ctx.beginPath();
    let f1 = to3D(startPos + railW * rail,
        h,
        Math.max(t, jdHeight));
    let f2 = to3D(startPos + railW * (rail + noteW),
        h,
        Math.max(t, jdHeight));
    let f3 = to3D(startPos + railW * rail,
        h,
        t + holdTime);
    let f4 = to3D(startPos + railW * (rail + noteW),
        h,
        t + holdTime);
    let hold = new Path2D();
    hold.moveTo(f1[0] + w / 2, f1[1]);
    hold.lineTo(f2[0] + w / 2, f2[1]);
    hold.lineTo(f4[0] + w / 2, f4[1]);
    hold.lineTo(f3[0] + w / 2, f3[1]);
    hold.lineTo(f1[0] + w / 2, f1[1]);
    ctx.fill(hold, 'evenodd');
}