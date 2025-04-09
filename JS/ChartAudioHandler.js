const Music = new AudioContext();

let source = null;
let audioBuffer = null;
let sfx = {
    // Renamed to "source" if you plan on storing a reusable source, 
    // but here we can also simply create a new one locally in playSFX.
    guide: null,
};

async function loadSFX() {
    const res = await fetch('./asset/SFX/answer.wav');
    const arrayBuffer = await res.arrayBuffer();
    sfx.guide = await Music.decodeAudioData(arrayBuffer);
}

async function loadTrack() {
    // 轉換 Blob 為 ArrayBuffer 的工具函式，加入類型檢查
    function blobToArrayBuffer(blob) {
        if (!(blob instanceof Blob)) {
            throw new Error("傳入的參數不是 Blob: " + blob);
        }
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }

    // 取得音樂資料（從快取或下載）
    async function fetchMusic(onProgress) {
        const cacheKey = 'song_' + song.songId;
        try {
            const cachedBlob = await getFromDB(cacheKey);
            if (cachedBlob) {
                console.log('從 IndexedDB 載入音樂', cachedBlob);
                if (!(cachedBlob instanceof Blob)) {
                    console.error("警告：從 DB 取得的不是 Blob，將重新下載");
                } else {
                    return cachedBlob;
                }
            }

            const blob = await fetchWithProgress(song.url.directory + 'track.mp3', onProgress);
            if (!(blob instanceof Blob)) {
                throw new Error("下載後取得的資料不是 Blob");
            }
            await saveToDB(cacheKey, blob);
            console.log('音樂已快取');
            return blob;
        } catch (err) {
            console.error('載入音樂失敗：', err);
            throw err;
        }
    }

    try {
        const blob = await fetchMusic(progress => {
            console.log(`下載進度：${(progress * 100).toFixed(2)}%`);
        });

        // 若 blob 不是 Blob（例如可能含 ArrayBuffer 等），這裡會丟出錯誤
        const arrayBuffer = await blobToArrayBuffer(blob);
        audioBuffer = await Music.decodeAudioData(arrayBuffer);
        console.log('音樂解碼完成 ✅');
    } catch (err) {
        console.error('解碼或載入音樂失敗：', err);
    }
}

function prepareBGM() {
    if (!audioBuffer) {
        console.warn('Audio not loaded yet');
        return;
    }

    source = Music.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(Music.destination);
}

function playLevelBGM() {
    if (!source) {
        console.warn('source not prepared yet');
        return;
    }

    source.start();
}

function alignAudio() {
    if (!source) {
        console.warn('source not prepared yet');
        return;
    }
    startTime = Date.now() - (source.context.currentTime + startTimeDelay) * 1000;
}

function playSFX(a) {
    if (!sfx[a]) {
        console.warn('sfx ' + a + ' not loaded yet');
        return;
    }

    // Create a new AudioBufferSourceNode for SFX playback
    const sfxSource = Music.createBufferSource();
    sfxSource.buffer = sfx[a];
    sfxSource.connect(Music.destination);
    sfxSource.start();
}
