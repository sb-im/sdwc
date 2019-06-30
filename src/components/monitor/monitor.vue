<template>
  <sd-card class="monitor" icon="monitor" :title="$t('depot.monitor')" dense>
    <template v-if="compoName && point.name">
      <div class="monitor__content">
        <component :is="compoName" :source="point.name"></component>
      </div>
      <slot></slot>
    </template>
    <template v-else>
      <div class="monitor__content monitor__content--empty">
        <span class="monitor__tip">{{ $t('common.no_video') }}</span>
      </div>
    </template>
  </sd-card>
</template>

<script>
import Card from '@/components/card.vue';

import Flv from './flv.vue';
import Hls from './hls.vue';
import Img from './img.vue';
import WebRTC from './webrtc.vue';
import IFrame from './iframe.vue';

const CompoName = {
  'livestream_flv': Flv.name,
  'livestream_hls': Hls.name,
  'livestream_img': Img.name,
  'livestream_webrtc': WebRTC.name,
  'iframe': IFrame.name
};

export default {
  name: 'sd-node-monitor',
  props: {
    point: {
      type: Object,
      required: true
    }
  },
  computed: {
    compoName() {
      return CompoName[this.point.point_type_name] || '';
    }
  },
  components: {
    [Card.name]: Card,
    [Flv.name]: Flv,
    [Hls.name]: Hls,
    [Img.name]: Img,
    [WebRTC.name]: WebRTC,
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
.monitor__content--empty {
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.monitor__tip {
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}
</style>
