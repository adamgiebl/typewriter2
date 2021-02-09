const key1Src = "./audio/typekey1.mp3";
const key2Src = "./audio/typekey2.mp3";
const spaceSrc = "./audio/typespace.mp3";
const returnSrc = "./audio/typecarriagereturn.mp3";
const lastKeySrc = "./audio/typelastkey.mp3";

class AudioController {
  constructor(volume) {
    this.audioContext = null;
    this.gainNodeFx = null;
    this.volume = volume;
    this.audioContext = null;
    this.audioBuffers = new Map();
  }
  init() {
    this.audioContext = new AudioContext();
    this.gainNodeFx = this.audioContext.createGain();
    this.gainNodeFx.gain.value = this.volume;
    return this.loadAllSounds();
  }
  addAudio(name, buffer) {
    this.audioBuffers.set(name, buffer);
  }
  loadAudio(src) {
    return fetch(src)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer));
  }
  playAudio(name) {
    const source = this.audioContext.createBufferSource();
    source.connect(this.gainNodeFx);
    this.gainNodeFx.connect(this.audioContext.destination);
    source.buffer = this.audioBuffers.get(name);
    source.start(0);
  }
  async loadAllSounds() {
    await Promise.all([
      this.loadAudio(key1Src),
      this.loadAudio(key2Src),
      this.loadAudio(spaceSrc),
      this.loadAudio(returnSrc),
      this.loadAudio(lastKeySrc),
    ]).then(([key1, key2, space, returnKey, lastKey]) => {
      this.addAudio("key1", key1),
        this.addAudio("key2", key2),
        this.addAudio("space", space),
        this.addAudio("return", returnKey),
        this.addAudio("lastKey", lastKey);
    });
  }
}

export default AudioController;
