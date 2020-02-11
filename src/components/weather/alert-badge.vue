<template>
  <div class="sd-weather-alert">
    <el-tag
      v-for="(val, index) of alerts"
      :key="index"
      :type="val.level"
      @click="showAlert(val)"
      size="medium"
    >
      <span v-t="`weather.alert.${val.type}`"></span>
    </el-tag>
  </div>
</template>

<script>
const AlertLevel = {
  '01': 'blue',
  '02': 'yellow',
  '03': 'orange',
  '04': 'red',
};

function alertToObject(alert) {
  const { code, title, description } = alert;
  const type = code.substr(0, 2);
  const level = code.substr(2, 2);
  return {
    type,
    level: AlertLevel[level],
    title,
    description
  };
}

export default {
  name: 'sd-weather-alert',
  props: {
    alert: {
      type: Object
    }
  },
  computed: {
    alerts() {
      if (!this.alert || this.alert.status !== 'ok') return [];
      return Array.from(this.alert.content).map(a => alertToObject(a));
    }
  },
  methods: {
    showAlert(alert) {
      this.$alert(alert.description, alert.title);
    }
  }
};
</script>

<style>
.sd-weather-alert .el-tag {
  cursor: pointer;
  user-select: none;
  margin-right: 4px;
}
.sd-weather-alert .el-tag--blue {
  color: #1e88e5;
  border-color: #1e88e5;
  background-color: #e3f2fd;
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
</style>
