<template>
  <div class="sd-weather-alert">
    <el-tag
      v-for="(alert, index) of alerts"
      :key="index"
      :type="alert.level"
      @click="showAlert(alert)"
      size="medium"
    >
      <span>{{ alert.type }}</span>
    </el-tag>
  </div>
</template>

<script>
const AlertLevel = {
  '白色': 'white',
  '蓝色': 'blue',
  '绿色': 'green',
  '黄色': 'yellow',
  '橙色': 'orange',
  '红色': 'red',
  '黑色': 'black'
};

/**
 * @typedef {{ level: string, type: string, title: string, text: string }} AlertItem
 */

export default {
  name: 'sd-weather-alert',
  props: {
    alert: {
      type: Array
    }
  },
  computed: {
    /** @returns {AlertItem[]} */
    alerts() {
      const alerts = {};
      for (const a of this.alert) {
        const { title, type, typeName, level, text } = a;
        alerts[type] = {
          level: AlertLevel[level] || level.toLowerCase(),
          type: typeName,
          title,
          text
        };
      }
      return Object.values(alerts);
    }
  },
  methods: {
    showAlert(alert) {
      this.$alert(alert.text, alert.title);
    }
  }
};
</script>

<style>
.sd-weather-alert {
  max-width: 160px;
}
.sd-weather-alert .el-tag {
  cursor: pointer;
  user-select: none;
  margin-right: 4px;
}
.sd-weather-alert .el-tag--white {
  color: #909399;
  border-color: #909399;
  background-color: white;
}
.sd-weather-alert .el-tag--blue {
  color: #1e88e5;
  border-color: #1e88e5;
  background-color: #e3f2fd;
}
.sd-weather-alert .el-tag--green {
  color: #67c23a;
  border-color: #67c23a;
  background-color: white;
}
.sd-weather-alert .el-tag--yellow {
  color: #fbc02d;
  border-color: #fbc02d;
  background-color: white;
}
.sd-weather-alert .el-tag--orange {
  color: #ef6c00;
  border-color: #ef6c00;
  background-color: #fff3e0;
}
.sd-weather-alert .el-tag--red {
  color: #d32f2f;
  border-color: #d32f2f;
  background-color: #ffebee;
}
.sd-weather-alert .el-tag--black {
  color: white;
  border-color: #575757;
  background-color: #909399;
}
</style>
