<template>
  <sd-card class="monitor" :class="monitorClassName" icon="monitor" title="monitor.title" dense>
    <template #action>
      <slot name="action"></slot>
    </template>
    <template v-if="streamAvailable">
      <div class="monitor__content">
        <component :is="compoName" :point="point"></component>
      </div>
      <slot></slot>
      <div class="monitor__control">
        <el-button
          size="mini"
          :type="fullscreen ? 'primary' : ''"
          icon="el-icon-full-screen"
          @click="handleFullscreen"
        ></el-button>
      </div>
    </template>
    <template v-else>
      <div class="monitor__content monitor__content--empty">
        <span class="monitor__tip" v-t="'monitor.no_video'"></span>
      </div>
    </template>
  </sd-card>
</template>

<script>
import Card from '@/components/card.vue';
import { isSafari } from '@/constants/browser';

import Flv from './flv.vue';
import Hls from './hls.vue';
import Img from './img.vue';
import WebRTC from './webrtc.vue';
import WebRTC2 from './webrtc2.vue';
import WebRTC3 from './webrtc3.vue';
import IFrame from './iframe.vue';

const CompoName = {
  'livestream_flv': Flv.name,
  'livestream_hls': Hls.name,
  'livestream_img': Img.name,
  'livestream_webrtc': WebRTC.name,
  'livestream_webrtc2': WebRTC2.name,
  'livestream_webrtc3': WebRTC3.name,
  'iframe': IFrame.name
};

export default {
  name: 'sd-node-monitor',
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
  data() {
    return {
      fullscreen: false
    };
  },
  computed: {
    monitorClassName() {
      return {
        'monitor--full': this.fullscreen
      };
    },
    compoName() {
      return CompoName[this.point.point_type_name] || '';
    },
    streamAvailable() {
      if (this.status.code !== 0) return false;
      if (this.point.point_type_name === 'livestream_webrtc2') {
        return true;
      }
      return this.point.name !== '';
    }
  },
  methods: {
    handleFullscreen() {
      const el = this.$el.getElementsByClassName('el-card__body')[0];
      if (el) {
        if (this.fullscreen) {
          (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else {
          (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
        }
      }
    }
  },
  mounted() {
    const el = this.$el.getElementsByClassName('el-card__body')[0];
    const eventName = isSafari ? 'webkitfullscreenchange' : 'fullscreenchange';
    el.addEventListener(eventName, () => {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        this.fullscreen = true;
      } else {
        this.fullscreen = false;
      }
    });
  },
  components: {
    [Card.name]: Card,
    [Flv.name]: Flv,
    [Hls.name]: Hls,
    [Img.name]: Img,
    [WebRTC.name]: WebRTC,
    [WebRTC2.name]: WebRTC2,
    [WebRTC3.name]: WebRTC3,
    [IFrame.name]: IFrame
  }
};
</script>

<style>
.monitor .el-card__body {
  position: relative;
}
.monitor__content {
  background-color: black;
  font-size: 0;
}
.monitor-video,
.monitor-img,
.monitor-iframe {
  border: 0;
  width: 100%;
  height: 480px;
}
.monitor--full .monitor-video,
.monitor--full .monitor-img,
.monitor--full .monitor-iframe {
  width: 100vw;
  height: 100vh;
}
.monitor__content--empty {
  height: 480px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.monitor__control {
  position: absolute;
  bottom: 5px;
  left: 5px;
}
.monitor__tip {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}
</style>
