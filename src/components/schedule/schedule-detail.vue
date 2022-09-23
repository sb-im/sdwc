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
    <el-form-item>
      <span slot="label" v-t="'schedule.cron'"></span>
      <el-input class="schedule--mono" v-model="schedule.cron" :readonly="readonly"></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'schedule.method'"></span>
      <el-input class="schedule--mono" v-model="schedule.method" :readonly="readonly"></el-input>
    </el-form-item>
    <el-form-item>
      <span slot="label" v-t="'schedule.params'"></span>
      <el-input class="schedule--mono" v-model="schedule.params" :readonly="readonly"></el-input>
    </el-form-item>
  </el-form>
</template>

<script>
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
  data() {
    return {
      /** @type {ApiTypes.V3.Schedule} */
      schedule: Object.assign({}, this.initial)
    };
  },
  methods: {
    /**
     * @returns {ApiTypes.V3.Schedule}
     */
    getSchedule() {
      return this.schedule;
    }
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
</style>
