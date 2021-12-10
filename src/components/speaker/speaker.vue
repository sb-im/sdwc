<template>
  <sd-card class="speaker" icon="speaker" title="speaker.title">
    <audio ref="audio" @ended="handlePlaybackStopped"></audio>
    <div class="speaker__progress">
      <el-progress :stroke-width="14" :percentage="percentage" :format="formatProgress"></el-progress>
    </div>
    <div class="speaker__buttons">
      <el-button
        :icon="`el-icon-${recording ? 'turn-off-' : ''}microphone`"
        @mousedown.native="handleRecordButtonDown"
        @mouseup.native="handleRecordButtonUp"
        @mouseleave.native="handleRecordButtonUp"
        @touchstart.native="handleRecordButtonDown"
        @touchend.native="handleRecordButtonUp"
        @contextmenu.native="ignoreEvent"
      >
        <span v-t="`speaker.${recording ? 'release2stop' : 'press2record'}`"></span>
      </el-button>
      <div class="speaker__divider"></div>
      <el-button
        :icon="`el-icon-${playing ? 'remove-outline' : 'video-play'}`"
        :disabled="!recorded"
        @click="handlePlayback"
      >
        <span v-t="`speaker.${playing ? 'stop' : 'listen'}`"></span>
      </el-button>
      <el-button
        type="primary"
        icon="el-icon-upload2"
        :disabled="!recorded"
        :loading="uploading"
        @click="handleUpload"
      >
        <span v-t="'speaker.send'"></span>
      </el-button>
    </div>
  </sd-card>
</template>

<script>
import get from 'lodash/get';
import wretch from 'wretch';

import Card from '@/components/card.vue';

import { Recorder } from './recorder';

export default {
  name: 'sd-speaker',
  props: {
    point: {
      type: Object,
      required: true
    },
    status: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    recording: false,
    recordTime: 0,
    recorded: false,
    playing: false,
    uploading: false
  }),
  computed: {
    /** @returns {number} */
    postURL() {
      return get(this.point, 'params.post_url');
    },
    /** @returns {number} */
    timeLimit() {
      return get(this.point, 'params.max_record_time', 20);
    },
    /** @returns {number} */
    percentage() {
      return 100 * this.recordTime / this.timeLimit;
    }
  },
  methods: {
    /**
     * @param {number} percentage
     * @returns {string}
     */
    formatProgress(percentage) {
      return `${(percentage * this.timeLimit / 100).toFixed(1)} / ${this.timeLimit} s`;
    },
    handleRecordButtonDown() {
      this.recording = true;
      this.handleRecordStart();
    },
    handleRecordButtonUp() {
      if (!this.recording) return;
      this.recording = false;
      this.handleRecordStop();
    },
    /**
     * @param {Event} e
     */
    ignoreEvent(e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
    async handleRecordStart() {
      if (this.recorded) {
        if (this.playing) {
          this.handlePlayback();
        }
        this.handleDiscard();
      }
      if (this.recorder) {
        this.recorder.close();
      }
      this.recorder = await Recorder.create();
      this.recorder.start(playbackTime => this.recordTime = playbackTime);
    },
    handleRecordStop() {
      if (!this.recorder) return;
      this.recorder.stop();
      this.recorded = true;
    },
    handleDiscard() {
      if (this.recorder) {
        this.recorder.stop();
        this.recorder.close();
        this.recorder = null;
      }
      this.recordTime = 0;
      this.recorded = false;
      /** @type {HTMLAudioElement} */
      const audio = this.$refs.audio;
      URL.revokeObjectURL(audio.currentSrc);
      audio.src = '';
      audio.removeAttribute('src');
    },
    handlePlayback() {
      if (!this.recorder) return;
      /** @type {HTMLAudioElement} */
      const audio = this.$refs.audio;
      if (!audio.hasAttribute('src')) {
        audio.src = URL.createObjectURL(this.recorder.wavBlob());
      }
      if (audio.paused) {
        audio.play();
        this.playing = true;
      } else {
        audio.pause();
        audio.currentTime = 0;
        this.playing = false;
      }
    },
    handlePlaybackStopped() {
      this.playing = false;
    },
    handleUpload() {
      if (!this.postURL) {
        this.$message.error(this.$t('speaker.upload_failed', { msg: '`post_url` not set' }));
        return;
      }
      const filename = `recording-${Date.now()}.pcm`;
      const file = new File([this.recorder.pcmBlob()], filename);
      this.uploading = true;
      wretch(this.postURL)
        .formData({ file })
        .post()
        .res()
        .catch(e => this.$message.error(this.$t('speaker.upload_failed', { msg: e.status })))
        .then(() => this.uploading = false);
    }
  },
  beforeDestroy() {
    this.handleDiscard();
  },
  components: {
    [Card.name]: Card
  }
};
</script>

<style>
.speaker__progress .el-progress-bar {
  padding-right: 100px;
  margin-right: -105px;
}
.speaker__progress .el-progress-bar__inner {
  transition: width 0.1s linear;
}
.speaker__progress .el-progress__text {
  float: right;
  text-align: right;
}
.speaker__buttons {
  margin-top: 16px;
  display: flex;
}
.speaker__divider {
  width: 40px;
  margin-left: auto;
}
</style>
