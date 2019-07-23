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
        <el-option v-for="d in drones" :key="d.id" :label="d.info.name" :value="d.info.id"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('plan.plan_cycle')">
      <el-select v-model="plan.cycle_types_id" :placeholder="$t('plan.edit.cycle_inp')">
        <el-option v-for="i in 6" :key="i" :label="$t(`plan.edit.cycle_type_${i}`)" :value="i - 1"></el-option>
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
        action="//dummy"
        :limit="1"
        :multiple="false"
        :file-list="fileList"
        :auto-upload="false"
        :on-change="handleFileAdd"
        :on-exceed="handleFileExeceed"
        :http-request="handleFileUpload"
      >
        <el-button type="primary" size="small" icon="el-icon-upload2">
          <span v-if="plan.map_path">{{ $t('common.re_upload') }}</span>
          <span v-else>{{ $t('plan.edit.select_map') }}</span>
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
    },
    handleFileExeceed(files, fileList) {
      const rawFile = files[0];
      /**
       * element-ui's internal file object
       * @see https://github.com/ElemeFE/element/blob/v2.9.1/packages/upload/src/index.vue#L153-L161
       */
      rawFile.uid = Date.now() + this.$refs.upload.$data.tempIndex++;
      const f = {
        status: 'ready',
        name: rawFile.name,
        size: rawFile.size,
        percentage: 0,
        uid: rawFile.uid,
        raw: rawFile
      };
      fileList.splice(0, 1, f);
      this.plan.file = f;
    },
    handleFileUpload() { /* noop */ }
  },
  components: {
    [Icon.name]: Icon
  }
};
</script>
