<template>
  <sd-card icon="airport/a_monitor" :title="$t('depot.monitor')" dense>
    <template>
      <div v-if="compoName">
        <component :is="compoName" :source="point.name"></component>
      </div>
      <div v-else class="monitor-empty">
        <span class="monitor-tip">{{ $t('common.no_video') }}</span>
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
.monitor-video {
  border: 0;
}
.monitor-img {
  border: 0;
}
.monitor-iframe {
  border: 0;
}
.monitor-empty {
  height: 100%;
  width: 100%;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
}
.monitor-tip {
  font-size: 18px;
  font-weight: bold;
}
</style>
