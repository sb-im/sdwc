<template>
  <el-form class="plan__form schedule__form" label-width="120px" size="small" :model="schedule">
    <el-form-item>
      <span slot="label" v-t="'schedule.name'"></span>
      <el-input v-model="schedule.name" :readonly="readonly"></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'schedule.state'"></span>
      <template v-if="readonly">
        <el-link v-if="schedule.enable" :underline="false" icon="el-icon-success" type="primary">
          <span v-t="'schedule.enabled'"></span>
        </el-link>
        <el-link v-else :underline="false" icon="el-icon-info">
          <span v-t="'schedule.disabled'"></span>
        </el-link>
      </template>
      <el-switch
        v-else
        v-model="schedule.enable"
        :active-text="$t('schedule.enabled')"
        :inactive-text="$t('schedule.disabled')"
        :readonly="readonly"
      ></el-switch>
    </el-form-item>
    <template v-if="advanced">
      <sd-schedule-edit-advanced v-model="schedule" :readonly="readonly"></sd-schedule-edit-advanced>
    </template>
    <template v-else>
      <sd-schedule-edit-simple v-model="schedule" :readonly="readonly"></sd-schedule-edit-simple>
    </template>
    <el-form-item>
      <el-switch
        class="schedule__switch"
        v-model="advanced"
        active-color="#E6A23C"
        :active-text="$t('schedule.advanced')"
        inactive-color="#409EFF"
        :inactive-text="$t('schedule.simple')"
      ></el-switch>
      <el-divider content-position="left">{{ $t('schedule.next5') }}</el-divider>
      <p class="schedule__times" v-text="scheduleTimes"></p>
    </el-form-item>
  </el-form>
</template>

<script>
import cronParser from 'cron-parser';

import Simple from './schedule-edit-simple.vue';
import Advanced from './schedule-edit-advanced.vue';

export default {
  name: 'sd-schedule-detail',
  props: {
    /** @type {Vue.PropOptions<ApiTypes.V3.Schedule>} */
    initial: {
      type: Object,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /** @returns {string} */
    scheduleTimes() {
      try {
        const iterator = cronParser.parseExpression(this.schedule.cron, { iterator: true });
        const times = [];
        for (let i = 0; i < 5; i++) {
          const date = iterator.next().value.toDate();
          times.push(this.$d(date, 'long'));
        }
        return times.join('\n');
      } catch {
        return '';
      }
    }
  },
  data() {
    return {
      /** @type {ApiTypes.V3.Schedule} */
      schedule: Object.assign({}, this.initial),
      advanced: false
    };
  },
  methods: {
    /**
     * @returns {ApiTypes.V3.Schedule}
     */
    getSchedule() {
      return this.schedule;
    }
  },
  components: {
    [Simple.name]: Simple,
    [Advanced.name]: Advanced
  }
};
</script>

<style>
.schedule__form {
  height: unset;
}

.schedule__form .el-link,
.schedule__form .el-switch {
  vertical-align: baseline;
}

.schedule--mono input {
  font-family: monospace;
}

.schedule__switch {
  display: block;
  margin-top: 10px;
}

.schedule__times {
  white-space: pre-wrap;
  margin: 0;
  line-height: 1.5rem;
}
</style>
