<template>
  <fieldset>
    <legend>实时天气状态</legend>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <el-col :xs="24" :sm="12" :md="24">
          <ul>
            <h3>{{ (new Date(Number(weather.timestamp))).toDateString() }}</h3>
            <h3>上次更新: {{ String(weather.date.getHours()) + ':' + String(weather.date.getMinutes()) + ':' + String(weather.date.getSeconds()) }}</h3>
          </ul>
        </el-col>
        <el-col :xs="24" :sm="12" :md="24">
          <ul>
            <li>温度（摄氏度），0.1度: {{ weather.temperature }}</li>
            <li>湿度 0.1 （0％= 99％）: {{ weather.humidity }}</li>
            <li>气压（0.1 hpa）: {{ weather.air_pressure }}</li>
          </ul>
        </el-col>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <ul>
          <h1>风</h1>
          <li>风向测量AD值: {{ weather.wind_direction_AD }}</li>
          <li>风向角度值: {{ weather.wind_direction }}</li>
          <li>实时风速频率 1Hz: {{ weather.wind_speed_Hz }}</li>
          <li>实时风速 0.1M/S : {{ weather.wind_speed }}</li>
          <li>前一分钟平均的风速 0.1m/s: {{ weather.wind_speed_before_1m }}</li>
          <li>前5分钟平均的风速 0.1m/s: {{ weather.wind_speed_before_5m }}</li>
        </ul>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
        <ul>
          <h1>雨</h1>
          <li>实时雨量斗数: {{ weather.rainfall_count }}</li>
          <li>前一分钟雨量斗数: {{ weather.rainfall_count_before_1m }}</li>
          <li>前1分钟雨量 0.1mm: {{ weather.rainfall_before_1m }}</li>
          <li>前一小时雨量 0.1mm: {{ weather.rainfall_before_1h }}</li>
          <li>前24小时雨量 0.1mm: {{ weather.rainfall_before_1d }}</li>
        </ul>
      </el-col>
    </el-row>

  </fieldset>
</template>

<script>
export default {
  data () {
    return {
      intervalID: '',
      weather: {}
    }
  },
  props: {
    url: {
      type: String,
      default: "https://weather.sb.im/get"
    },
  },
  created() {
    this.intervalID = window.setInterval(this.getData, 1000)
  },
  beforeDestroy() {
    clearInterval(this.intervalID)
  },
  methods: {
    getData() {
      //let url = location.protocol + "//" + location.host + "/get"
      //console.log(url)
      this.$http.get(this.url)
      .then((response) => {
        this.weather =  response.data[0]
        this.weather.date = new Date(Number(this.weather.timestamp))
        //console.log(response.data[0].wind_direction_AD)
      })
      .catch((error) => {
        console.log(error)
      })
    }
  }
}
</script>
