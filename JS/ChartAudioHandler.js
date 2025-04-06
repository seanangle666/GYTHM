// AudioManager.js
const Music = new AudioContext();

let source = null;
let audioBuffer = null;

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
