<template>
  <div>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="16">
        <uavtrack ref="map" />
      </el-col>
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="8">
        <uav-status :uav_status=uav_status />
      </el-col>
    </el-row>
    <webterminal ref="terminal" :autolf=true :commands=commands :address=websocket @send=send @connect=connect @close=close></webterminal>
  </div>

</template>
<script>
import Terminal from '../components/webterminal/socketTerminal.vue'
import Uavtrack from './uavtrack.vue'
import Uavstatus from './uavstatus.vue'

  export default {
    data() {
      return {
        uav_status: {},
        connect_status: false,
        setTime: '',
        intervalID: '',
        socket: {}
      }
    },
    props: {
      commands: {
        type: Array,
        default: Array
      },
      websocket: {
        type: String,
        default: location.hostname
      },
      autolf: {
        type: Boolean,
        default: true
      }
    },
    //created() {
        //this.connect()
      //  console.log("start")
      //if (this.websocket != location.hostname) {
        //console.log(this.websocket)
        //console.log("start")
        //this.connect(this.websocket)
      //}
    //},
    beforeDestroy() {
      if (this.connect_status) {
        //console.log("stop")
        this.close()
      }
    },
    methods: {
      connect(address = "ws://" + location.hostname + ":22333/") {
        console.log(address)

        this.socket = new WebSocket(address)
        try {
          this.socket.onopen = () => {
            //this.connect_status = this.socket.readyState
            //this.connect_status = 1
            this.connect_status = true

            this.intervalID = window.setInterval(this.getData, 1000)

            this.setTime = window.setTimeout(this.initMap, 3000)
          }

          this.socket.onmessage = (msg) => {
            //console.log(msg)
            if (typeof msg.data == "string") {
              this.msg(msg.data)
            } else {
              alert("非文本消息");
            }
          }

          this.socket.onclose = () => {
            this.connect_status = false
            //this.connect_status = 2

            clearInterval(this.intervalID)
          }

        } catch (ex) {
          console.log(ex)
        }
      },
      getData() {
        this.socket.send("status")
      },
      send(msg) {
        //console.log(msg)
        this.socket.send(msg)
      },
      close() {
        try {
          this.socket.close()
          this.socket = null
        }
        catch (ex) {
          console.log(ex)
        }
      },
      initMap() {
        //console.log("init map")
        console.log(this.uav_status['BATTERY_STATUS'])
        this.$refs.map.clearPath()
        this.$refs.map.initMap({ lat: this.uav_status["GLOBAL_POSITION_INT"].lat*0.1e-6, lng: this.uav_status["GLOBAL_POSITION_INT"].lon*0.1e-6 })
      },
      updateStatus(data) {
        //this.uav_status[data[0]] = data[1]

        // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
        this.$set(this.uav_status, data[0], data[1])


        if (data[0] == "GLOBAL_POSITION_INT") {
          //console.log(data[1])
          this.$refs.map.drawPath({ lat: data[1].lat*0.1e-6, lng: data[1].lon*0.1e-6 })
        }
        //console.log(this.uav_status)
      },
      display(msg) {

        // Filter message
        if (msg.match(/Counters: Slave:0/) || msg.match(/MAV Errors: 0/) || msg.match(/None/)) { return }

        this.$refs.terminal.display(msg)
      },
      msg(msgs) {
        //console.log(msgs)
        for (let msg of msgs.split(/[\n]/g)) {

          // Status message OR Display message
          msg.match(/^\d*:/) ? this.updateStatus(this.toObj(msg)) : this.display(msg)
        }
      },
      toObj(msg) {
        // 转换成json 再解析
        //console.log(msg)

        try {
          let aaa = false

          // 提取 [ ] 里的数据，暂时替换为'T_ATA_T'
          if(msg.split(/[{}]/g)[1].split(/\[|\]/g)[1]) {
            aaa = msg.split(/[{}]/g)[1].split(/\[|\]/g)[1]
            msg = msg.replace(/\[.*\]/, 'T_ATA_T')
          }

          let mmm =  msg.split(/[{}]/g)[1].split(',').map(x => '"' + x.split(':')[0].trim() + '" :' + (x.replace(/^.*:/, '').trim().match(/^[A-z]/)? '"'+x.replace(/^.*:/, '').trim()+'"' : x.replace(/^.*:/, '').trim())).join(',')

          // 把'T_ATA_T'替换为原来的数据
          aaa ? mmm = mmm.replace(/"T_ATA_T"/, '[' + aaa + ']') : null

          return [ msg.split(' ')[1], JSON.parse('{' + mmm + '}') ]

        } catch (error) {
          console.log(error)
          console.log(msg)
        }
      }

    },
    components: {
      'webterminal': Terminal,
      'uav-status': Uavstatus,
      'uavtrack': Uavtrack
    }
  }
</script>
