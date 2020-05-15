<template>
  <div class="overview-popover" v-if="node">
    <div class="overview-popover__title">
      <span>{{ node.info.name }}</span>
      <i class="el-icon-close overview-popover__close" @click="handleClose"></i>
    </div>
    <div class="overview-popover__pre">
      <tree-view :data="json" :options="treeViewOpts" ref="treeView"></tree-view>
    </div>
  </div>
</template>

<script>
const PointTopic = {
  depot_status: 'depot_status',
  drone_status: 'drone_status',
  battery: 'battery',
  weather: 'weather',
  gimbal: 'gimbal',
  map: 'position'
};

export default {
  name: 'sd-overview-popover',
  props: {
    node: {
      type: Object
    }
  },
  data() {
    return {
      treeViewOpts: {
        maxDepth: 2,
        rootObjectKey: 'overview'
      }
    };
  },
  computed: {
    json() {
      if (!this.node) return '';
      let val = this.node.msg.overview;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.treeViewOpts.rootObjectKey = 'overview';
      if (Object.keys(val).length <= 0) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.treeViewOpts.rootObjectKey = 'msg';
        val = {};
        for (const point of this.node.info.points) {
          const topic = PointTopic[point.point_type_name];
          if (topic) {
            const msg = this.node.msg[topic];
            val[topic] = Array.isArray(msg) ? msg[0] : msg;
          }
        }
      }
      return val;
    }
  },
  methods: {
    handleClose() {
      this.$emit('close');
    }
  },
  watch: {
    json() {
      this.$emit('update');
    }
  },
  mounted() {
    const mo = new MutationObserver(() => this.$emit('update'));
    mo.observe(this.$refs.treeView.$el, { attributes: true, subtree: true });
    this._mo = mo;
  },
  beforeDestroy() {
    this._mo.disconnect();
    this._mo = null;
  }
};
</script>

<style>
.overview-popover {
  margin: 0 12px;
  min-width: 210px;
}
.overview-popover__title {
  display: flex;
  font-weight: bold;
  justify-content: space-between;
  margin-bottom: 5px;
}
.overview-popover__close {
  cursor: pointer;
}
.overview-popover__pre {
  margin: 0;
}

/* vue-json-tree-view style override */
.overview-popover__pre .tree-view-item[class] {
  font-size: 12px;
}
.overview-popover__pre .tree-view-item-key-with-chevron[class]::before {
  font-size: 8px;
  left: -10px;
  top: 2px;
}
.overview-popover__pre .tree-view-item-key-with-chevron.opened[class]::before {
  top: 2px;
}
.overview-popover__pre .tree-view-item-key-with-chevron[class] {
  padding: 0;
}
.tree-view-item-key {
  color: rgb(136, 19, 145);
}
.tree-view-item-hint::before,
.tree-view-item-value::before {
  content: ' ';
}
.tree-view-item-value-string {
  color: rgb(196, 26, 22);
}
.tree-view-item-value-number,
.tree-view-item-value-boolean {
  color: rgb(28, 0, 207);
}
.tree-view-item-value-null {
  color: rgb(128, 128, 128);
}
</style>
