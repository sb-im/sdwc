<template>
  <el-form label-width="100px" :model="plan">
    <el-form-item :label="$t('plan.plan_name')">
      <el-input v-model="plan.name" :placeholder="$t('plan.edit.name_inp')"></el-input>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_desc')">
      <el-input
        type="textarea"
        :rows="2"
        :placeholder="$t('plan.edit.desc_inp')"
        v-model="plan.description"
      ></el-input>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_air')">
      <el-select v-model="plan.node_id" :placeholder="$t('plan.edit.air_inp')">
        <el-option
          v-for="d in drones"
          :key="d.id"
          :label="d.name"
          :value="d.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_cycle')">
      <el-select
        v-model="plan.cycle_types_id"
        :placeholder="$t('plan.edit.cycle_inp')"
      >
        <el-option
          v-for="i in 6"
          :key="i"
          :label="$t(`plan.edit.cycle_type_${i}`)"
          :value="i - 1"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_first_time')">
      <el-date-picker
        v-model="plan.start_time"
        type="datetime"
        :placeholder="$t('plan.edit.first_time_inp')"
      ></el-date-picker>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_mapfile')">
      <el-upload
        ref="upload"
        action
        :limit="1"
        :multiple="false"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileAdd"
        :http-request="handleFileUpload"
      >
        <el-button type="primary" size="medium" icon="el-icon-upload2">
          <span v-if="plan.map_path">{{ $t('common.re_upload') }}</span>
          <span v-else>{{ $t('common.upload') }}</span>
        </el-button>
      </el-upload>
    </el-form-item>
  </el-form>
</template>

<script>
import { mapGetters } from 'vuex';
import Icon from '@/components/sd-icon.vue';

export default {
  name: 'sd-plan-editable',
  props: {
    initial: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      plan: Object.assign({}, this.initial),
      fileList: []
    };
  },
  computed: {
    ...mapGetters([
      'drones'
    ])
  },
  methods: {
    getPlan() {
      let result = {};
      // keys used for POST/PATCH request
      const keys = ['id', 'name', 'description', 'file', 'node_id', 'cycle_types_id'];
      keys.forEach(k => {
        if (typeof this.plan[k] !== 'undefined') {
          result[k] = this.plan[k];
        }
      });
      return result;
    },
    handleFileAdd({ raw }) {
      this.plan.file = raw;
      this.$refs.upload.clearFiles();
    },
    handleFileUpload() { /* noop */ }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>
