// @ts-check

class RecorderConfig {
  /**
   * @param {Partial<RecorderConfig>?} config
   */
  constructor(config = {}) {
    /** @type {number} */
    this.sampleBits = config.sampleBits ?? 16;
    /** @type {number} */
    this.sampleRate = config.sampleRate ?? 44100;
    /** @type {number} */
    this.bufferSize = config.bufferSize ?? 4096;
  }
}

class RecorderAudioData {
  /**
   * @param {AudioContext} context
   * @param {RecorderConfig} config
   */
  constructor(context, config) {
    this.config = config;
    /** total buffer size */
    this.size = 0;
    /**
     * recording buffers
     * @type {Float32Array[]}
     */
    this.buffer = [];
    /**
     * joint data
     * @type {Float32Array}
     */
    this.data = null;
    this.inputSampleRate = context.sampleRate;
    this.inputSampleBits = 16;
    this.outputSampleRate = config.sampleRate;
    this.oututSampleBits = config.sampleBits;
  }

  /**
   * @param {Float32Array} data
   */
  onInput(data) {
    this.buffer.push(new Float32Array(data));
    this.size += data.length;
  }

  onStop() {
    this.data = new Float32Array(this.size);
    let offset = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      this.data.set(this.buffer[i], offset);
      offset += this.buffer[i].length;
    }
    this.buffer = [];
  }

  getRawData() {
    const ratio = Math.trunc(this.inputSampleRate / this.outputSampleRate);
    const length = this.data.length / ratio;
    const result = new Float32Array(length);
    for (let i = 0, j = 0; i < length; i++, j += ratio) {
      result[i] = this.data[j];
    }
    return result;
  }

  toWav() {
    const sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
    const sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits);
    const bytes = this.getRawData();
    const dataLength = bytes.length * (sampleBits / 8);
    const buffer = new ArrayBuffer(44 + dataLength);
    const data = new DataView(buffer);
    let offset = 0;
    /** @type {(str: string) => void} */
    const writeStr = str => {
      for (var i = 0; i < str.length; i++) {
        data.setUint8(offset + i, str.charCodeAt(i));
      }
      offset += str.length;
    };
    /** @type {(i: number) => void} */
    const writeUnit32 = i => {
      data.setUint32(offset, i, true);
      offset += 4;
    };
    /** @type {(i: number) => void} */
    const writeUint16 = i => {
      data.setUint16(offset, i, true);
      offset += 2;
    };
    writeStr('RIFF');                                // RIFF identifier
    writeUnit32(36 + dataLength);                    // RIFF chunk length
    writeStr('WAVE');                                // RIFF type
    writeStr('fmt ');                                // format chunk identifier
    writeUnit32(0x10);                               // format chunk length
    writeUint16(1);                                  // sample format (raw)
    writeUint16(1);                                  // channel count
    writeUnit32(sampleRate);                         // sample rate
    writeUnit32(1 * sampleRate * (sampleBits / 8));  // byte rate (sample rate * block align)
    writeUint16(1 * (sampleBits / 8));               // block align (channel count * bytes per sample)
    writeUint16(sampleBits);                         // bits per sample
    writeStr('data');                                // data chunk identifier
    writeUnit32(dataLength);                         // data chunk length
    if (sampleBits === 8) {
      for (let i = 0; i < bytes.length; i++, offset++) {
        let s = Math.max(-1, Math.min(1, bytes[i]));
        let val = s < 0 ? s * 0x8000 : s * 0x7FFF;
        val = Math.trunc(255 / (65535 / (val + 32768)));
        data.setInt8(offset, val);
      }
    } else {
      for (let i = 0; i < bytes.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, bytes[i]));
        data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    }
    return buffer;
  }

  toWavBlob() {
    const data = this.toWav();
    return new Blob([data], { type: 'audio/wav' });
  }

  toPcmBlob() {
    const bytes = this.getRawData();
    const dataLength = bytes.length * (this.oututSampleBits / 8);
    const buffer = new ArrayBuffer(dataLength);
    const data = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < bytes.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, bytes[i]));
      data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([data], { type: 'audio/pcm' });
  }
}

export class Recorder {
  static async create(config = new RecorderConfig) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return new Recorder(stream, config);
  }

  /**
   * @param {MediaStream} stream
   * @param {RecorderConfig} config
   */
  constructor(stream, config) {
    this.config = config;
    this.audioContext = new AudioContext();
    this.mediaSource = this.audioContext.createMediaStreamSource(stream);
    this.mediaSource.connect(this.audioContext.createGain());
    this.processor = this.audioContext.createScriptProcessor(config.bufferSize, 1, 1);
    this.audioData = new RecorderAudioData(this.audioContext, this.config);
  }

  /**
   * @param {(playbackTime: number) => void} onTimeUpdate
   */
  start(onTimeUpdate) {
    this.mediaSource.connect(this.processor);
    this.processor.onaudioprocess = e => {
      onTimeUpdate(e.playbackTime);
      this.audioData.onInput(e.inputBuffer.getChannelData(0));
    };
    this.processor.connect(this.audioContext.destination);
  }

  stop() {
    this.processor.disconnect();
    this.processor.onaudioprocess = null;
    this.audioData.onStop();
  }

  close() {
    this.audioContext.close();
  }

  wavBlob() {
    return this.audioData.toWavBlob();
  }

  pcmBlob() {
    return this.audioData.toPcmBlob();
  }
}
