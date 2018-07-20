<template>
  <div>
    <uavtrack ref="profile" />
  <div v-if="uav_status['RAW_IMU']">23333333333</div>
  <div v-else>0000000000000000000000</div>
  <div>{{ uav_status['RAW_IMU']? 0:1 }}</div>
    <webterminal :autolf=true :commands=commands @send=send @connect=connect @close=close></webterminal>
  </div>

</template>
<script>
import Terminal from '../components/webterminal/socketTerminal.vue'
import Uavtrack from './uavtrack.vue'

  export default {
    data() {
      return {
        uav_status: {},
        connect_status: false,
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
    created() {
        //this.connect()
        console.log("start")
      if (this.websocket != location.hostname) {
        //console.log(this.websocket)
        //console.log("start")
        this.connect(this.websocket)
      }
    },
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

            this.intervalID = window.setInterval(this.getData, 1000);
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
      updateStatus(data) {
        this.uav_status[data[0]] = data[1]
        console.log(this.uav_status)
      },
      msg(msgs) {
        //console.log(msgs)
        for (let msg of msgs.split(/[\n]/g)) {
          //if (msg.match(/^[0-9]/)) {
          if (msg.match(/^\d*:/)) {
            this.updateStatus(this.toObj(msg))
          } else {
            console.log(msg)
          }
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
      'uavtrack': Uavtrack
    }
  }
</script>
