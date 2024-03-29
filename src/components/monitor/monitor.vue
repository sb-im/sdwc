<template>
  <sd-card class="monitor" :class="monitorClassName" icon="monitor" title="monitor.title" dense>
    <template #action>
      <slot name="action"></slot>
    </template>
    <template v-if="streamAvailable">
      <div class="monitor__content">
        <component ref="content" :is="compoName" :point="point" v-bind="$attrs"></component>
      </div>
      <slot></slot>
      <div class="monitor__control">
        <el-button
          circle
          size="mini"
          type="info"
          icon="el-icon-full-screen"
          class="monitor__btn-fullscreen"
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
import WebRTC4 from './webrtc4.vue';
import IFrame from './iframe.vue';
import WebRTCSRS from './webrtc-srs.vue';

const CompoName = {
  'livestream_flv': Flv.name,
  'livestream_hls': Hls.name,
  'livestream_img': Img.name,
  'livestream_webrtc': WebRTC.name,
  'livestream_webrtc2': WebRTC2.name,
  'livestream_webrtc3': WebRTC3.name,
  'livestream_webrtc4': WebRTC4.name,
  'livestream_webrtc_srs': WebRTCSRS.name,
  'iframe': IFrame.name
};

export default {
  name: 'sd-node-monitor',
  inheritAttrs: false,
  props: {
    /** @type {Vue.PropOptions<SDWC.NodePoint>} */
    point: {
      type: Object,
      required: true
    },
    /** @type {Vue.PropOptions<SDWC.NodeConnectionStatus>} */
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
    /** @returns {{ [key: string]: boolean }} */
    monitorClassName() {
      return {
        'monitor--full': this.fullscreen
      };
    },
    /** @returns {keyof CompoName} */
    compoName() {
      return CompoName[this.point.type] || '';
    },
    /** @returns {boolean} */
    streamAvailable() {
      return this.status.code === 0;
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
    [WebRTC4.name]: WebRTC4,
    [WebRTCSRS.name]: WebRTCSRS,
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
  height: 480px;
}
.monitor-video,
.monitor-img,
.monitor-iframe,
.monitor-webrtc {
  border: 0;
  width: 100%;
  height: 100%;
}
.monitor--full .monitor-video,
.monitor--full .monitor-img,
.monitor--full .monitor-iframe,
.monitor--full .monitor-webrtc {
  width: 100vw;
  height: 100vh;
}
.monitor__content--empty {
  display: flex;
  justify-content: center;
  align-items: center;
}
.monitor__control {
  position: absolute;
  bottom: 5px;
  left: 5px;
}
.monitor__btn-fullscreen {
  transition: opacity 0.2s;
  opacity: 0;
}
.monitor .el-card__body:hover .monitor__btn-fullscreen {
  opacity: 0.4;
}
.monitor__btn-fullscreen:hover {
  opacity: 0.6;
}
.monitor__tip {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}
</style>
