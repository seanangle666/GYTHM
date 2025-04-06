const Music = new AudioContext();

let source = null;
let audioBuffer = null;
let sfx = {
    // Renamed to "source" if you plan on storing a reusable source, 
    // but here we can also simply create a new one locally in playSFX.
    guide: null,
};

async function loadSFX() {
    const url = '../answer.wav';
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    sfx.guide = await Music.decodeAudioData(arrayBuffer);
}

async function loadTrack(songId) {
    const url = './CHART/' + String(songId).padStart(4, '0') + '/track.mp3';
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    audioBuffer = await Music.decodeAudioData(arrayBuffer);
}

function play() {
    if (!audioBuffer) {
        console.warn('Audio not loaded yet');
        return;
    }

    source = Music.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(Music.destination);
    source.start();
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
