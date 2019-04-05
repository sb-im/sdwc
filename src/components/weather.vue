<template>
  <section class="w-info">
    <i class="status d-b el-icon-success"></i>
    <div class="items d-f">
      <p>{{ $t('depot.weather_feel',{feel:$store.state.cyRealtime?$store.state.cyRealtime.comfort.desc:'----'}) }}</p>
      <p>{{ $store.state.cyRealtime?skycon($store.state.cyRealtime.skycon):'----' }}</p>
      <p>{{ $t('depot.wind_speed',{s:windSpeed(weather.wind_speed)}) }} km/h</p>
    </div>
    <div class="items d-f">
      <p>{{ $t('common.fly_yes') }}</p>
      <p>{{ $t('depot.temperature',{num:tempHumidity(weather.temperature)}) }}℃</p>
      <p>{{ $t('depot.humidity',{num:tempHumidity(weather.temperature)}) }}%</p>
    </div>
    <div class="chart">
      <p>{{ $store.state.cyForecast?$store.state.cyForecast.forecast_keypoint:'----' }}</p>
      <div ref="charts" class="chart-view">
        <!--<canvas ref="weaMinute" class="chart-canvas" width="340" height="105"></canvas>
        <ul class="inner-labels">
          <li><span class="text">大雨</span></li>
          <li><span class="text">中雨</span></li>
          <li><span class="text">小雨</span></li>
        </ul>
        <ul class="labels">
          <li><span class="text">现在</span></li>
          <li></li>
          <li></li>
          <li><span class="text">30分钟</span></li>
          <li></li>
          <li><span class="text">60分钟</span></li>
        </ul>-->
      </div>
    </div>
  </section>
  <!--<fieldset>
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
  </fieldset>-->
</template>

<script>
  const Echarts = require('echarts/lib/echarts')
  require('echarts/lib/component/title');
  require('echarts/lib/chart/line')
  export default {
    data () {
      return {

      }
    },
    props: {
      weather: {
        type: Object,
        required: true,
        default: () => {}
      },
    },
    mounted() {
      this.$store.state.cyForecast ? this.drawWeather(this.$store.state.cyForecast.minutely.precipitation) : this.drawWeather();
    },
    methods: {
      // 风速
      windSpeed(val) {return val?parseInt(val)/10*3600/1000:'...';},
      // 气温/湿度
      tempHumidity(val) {return val?parseInt(val)/10:'...';},
      // 天气
      skycon(val) {
        switch (val) {
          case 'CLEAR_DAY':return this.$t('weather.clear_day');
          case 'CLEAR_NIGHT':return this.$t('weather.clear_night');
          case 'PARTLY_CLOUDY_DAY':return this.$t('weather.partly_cloudy');
          case 'PARTLY_CLOUDY_NIGHT':return this.$t('weather.partly_cloudy');
          case 'CLOUDY':return this.$t('weather.cloudy');
          case 'RAIN':return this.$t('weather.rain');
          case 'SNOW':return this.$t('weather.snow');
          case 'WIND':return this.$t('weather.wind');
          case 'HAZE':return this.$t('weather.haze');
        }
      },
      // 绘制折线面积图
      drawWeather(data = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]) {
        let _this = this,
          charts = Echarts.init(this.$refs.charts);
        charts.setOption({
          title : {
            top: '-5%',
            subtext: _this.$t('depot.charts',{a:0.25,b:0.35})
          },
          grid: {
            top: '20%',
            left: '5%',
            right: '0',
            bottom: '0',
            containLabel: true
          },
          xAxis : [
            {
              type : 'category',
              boundaryGap : false,
              splitNumber: 1,
              axisLabel:{
                formatter(val,index) {
                  let texts = [];
                  switch (index) {
                    case 0:texts.push(_this.$t('depot.charts_label_now'));break;
                    case 30:texts.push(_this.$t('depot.charts_label_30m'));break;
                  }
                  return texts;
                }
              },
              data
            }
          ],
          yAxis : [
            {
              position:'right',
              type : 'value',
              splitNumber: 3
            },
          ],
          series : [
            {
              type:'line',
              smooth:true,
              color:['#87aeed'],
              itemStyle: {
                normal: {
                  areaStyle: {
                    type: 'default'
                  }
                }
              },
              data
            },
          ]
        });
      }
    },
    watch:{
      ['$store.state.cyForecast']() {
        this.drawWeather(this.$store.state.cyForecast.minutely.precipitation);
      }
    }
  }
</script>

<style>
  .w-info {padding-left: 15px;}
  .w-info .status {
    color: #42a847;
    font-size: 68px;
    margin: 15px 0;
  }
  .w-info .items {margin: 10px 0;}
  .w-info .items p {width: calc(100% / 3);}
  .w-info .chart {margin-top: 20px;}
  .w-info .chart-view {
    position: relative;
    width: 360px;
    height: 140px;
    margin-bottom: 15px;
  }
  .w-info .chart-view .chart-canvas {
    position: absolute;
    z-index: 5;
    top: 0;
    left: 0;
    border-right: 1px dashed rgba(0, 0, 0, .25);
  }
  .w-info .chart-view .labels {
    position: absolute;
    display: flex;
    z-index: 6;
    height: 4px;
    bottom: -4px;
    right: -.2%;
    width: 100%;
    white-space: nowrap;
    line-height: 0;
    border-top: 2px solid #999;
  }
  .w-info .chart-view .labels > li {
    position: relative;
    width: calc(100% / 6);
    height: 100%;
    padding: 1px;
    border-right: 1px solid #999;
    border-left: 1px solid #999;
    border-radius: 0px;
  }
  .w-info .chart-view .labels .text {
    position: absolute;
    width: 50px;
    left: -27px;
    top: 16px;
    text-align: center;
    color: #121212;
    opacity: 0.9;
    font-size: 12px;
  }
  .w-info .chart-view .labels > li:last-child .text {
    left: auto;
    right: -27px;
  }
  .w-info .chart-view .inner-labels {
    position: absolute;
    z-index: 7;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    text-align: left;
    line-height: 0;
  }
  .w-info .chart-view .inner-labels > li {
    border-top: 1px solid rgba(3, 3, 3, 0.1);
    height: calc(100% / 3);
    width: 100%;
  }
  .w-info .chart-view .inner-labels > li:first-child {border-top: 0;}
  .w-info .chart-view .inner-labels .text {
    position: relative;
    display: inline-block;
    left: 101%;
    margin: 15px 0 0 4px;
    font-size: 12px;
    text-transform: uppercase;
    color: #121212;
    text-align: left;
  }
</style>
