let chartTemp;

let chartNoteData;

let song = {
    'songId': 1,
    'level': 0,
}

fetch('../CHART/' + String(song.songId).padStart(4, '0') + '_' + song.level + '.txt')
    .then(response => response.text())
    .then(data => {
        chartTemp = data.replace(/[()]|(\|.*\|)/g, "").replace(/(?:\r\n|\r|\n)/g, '').split(",");
        return decode(chartTemp);
    })
    .then(data => chartNoteData = data)
    .catch(error => console.error('讀取檔案失敗:', error));

function decode(_data) {
    function parseDetail(detailData) {
        detailData = detailData.replace(/\s/g, '');
        let matches = detailData.match(/<[^>]*>/g);  // 匹配所有標籤

        if (matches) {
            let result = {};
            matches.forEach(e => {
                e = e.match(/<([^>]*)>/)[1];
                if (e.includes('/')) {
                    e = e.split('/');
                    console.log(e);
                    result.holdTime = e[1] / e[0] * 60 / bpm;
                } else {
                    e = e.split('=');
                    result[e[0]] = e[1];
                }
            });
            return result;
        } else {
            return null;
        }
    }

    let _tempNoteData = {
        'infos': {},
        'note': [],
        'endTime': 0,
    };

    let timeSum = 0,
        slice = 1,
        bpm = 60,
        endTime = 0;

    // 基本 note 解析（依據逗號分隔，每筆 note 記錄原始 pos 與時間）

    for (let i = 0; i < _data.length; i++) {
        let d = _data[i];

        if (d) {
            if (d.includes("&")) {   // 解析 info 設定：& 開頭的字串，例如 "&TLE="
                let info = d.match(/&([\w]*)=(.*)/),
                    _type = info[1],
                    _value = info[2];
                _tempNoteData.infos[_type] = _value;
                continue;
            }

            d = d.replace(/\s/g, "");

            if (d.includes("#")) {   // 解析 bpm 設定：用井字號包住的數字，例如 "120#"
                bpm = parseFloat(d.slice(0, d.indexOf("#")));
                continue;
            }

            // 解析切分設定：用斜線包住的數字，例如 "4/" 或 "8/"
            if (d.includes("/") && !(d.includes("<") || d.includes(">"))) {
                slice = parseFloat(d.slice(0, d.indexOf("/")));
                continue;
            }

            // 若有 "*" 則表示此節拍內有多個 note
            if (d.includes("*")) {
                d = d.split("*");
                for (let j = 0; j < d.length; j++) {
                    if (d[j] === "") continue;
                    let _detail = parseDetail(d[j]);
                    _tempNoteData.note.push(new Note(
                        d[j][0],
                        d[j][1] == '<' ? '' : d[j][1],
                        timeSum,
                        _detail
                    ));
                    if (_detail) {
                        if (_detail.holdTime) {
                            if (endTime < _detail.holdTime) {
                                endTime = _detail.holdTime;
                            }
                        }
                    }
                }
                d = '';
            }

            if (d.includes("<") && d.includes(">")) {
                _tempNoteData.note.push(new Note(
                    d[0],
                    d[1] == '<' ? '' : d[1],
                    timeSum,
                    parseDetail(d)
                ));
            }

            if (d.length >= 1 && !isNaN(d)) {
                for (let j = 0; j < d.length; j++) {
                    _tempNoteData.note.push(new Note(d[j], '', timeSum));
                }
            }
        }

        if (endTime < timeSum) {
            endTime = timeSum;
        }
        // 累加時間：此處公式依 slice 與 bpm 計算
        timeSum += (1 / slice) * (60 / bpm);
    }

    _tempNoteData.endTime = endTime;
    console.log(_tempNoteData);
    return _tempNoteData;
}