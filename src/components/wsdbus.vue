<template>
  <div>
  <div>23333333333</div>
  <!--div>{{ uav_status['RAW_IMU'].time_usec? 0:1 }}</div-->
  </div>

</template>
<script>
  export default {
    data() {
      return {
        hostname: location.hostname,
        port: '22333',
        message: 'hello',
        uav_status: {},
        connect_status: 2,
        // 0 Link, 1 Only ws link, 2 No link
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
        this.connect()
        console.log("start")
      if (this.websocket != location.hostname) {
        //console.log(this.websocket)
        //console.log("start")
        this.connect()
      }
    },
    beforeDestroy() {
      if (this.connect_status) {
        //console.log("stop")
        this.close()
      }
    },
    methods: {
      connect() {
        var host
        if (this.websocket == location.hostname) {
          host = "ws://" + this.hostname + ":" + this.port + "/"
        } else {
          host = this.websocket
        }
        //console.log(host)
        this.socket = new WebSocket(host)
        try {
          this.socket.onopen = () => {
            //this.connect_status = this.socket.readyState
            this.connect_status = 1

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
            //this.connect_status = false
            this.connect_status = 2

            clearInterval(this.intervalID)
          }

        } catch (ex) {
          console.log(ex)
        }
      },
      getData() {
        this.socket.send("status")
        //this.send("status")
      },
      msg(msgs) {
        //  console.log(msgs)
        for (let msg of msgs.split(/[\n]/g)) {
          //if (msg.match(/^[0-9]/)) {
          if (msg.match(/^\d*:/)) {
            this.toObj(msg)
            //console.log(this.uav_status)
          }
        }
      },
      toObj(msg) {
        // 转换成json 再解析

        //console.log(msg)
        //console.log(typeof(msg))
        try {

          let aaa = false

          // 提取 [ ] 里的数据，暂时替换为'T_ATA_T'
          if(msg.split(/[{}]/g)[1].split(/\[|\]/g)[1]) {
            aaa = msg.split(/[{}]/g)[1].split(/\[|\]/g)[1]
            msg = msg.replace(/\[.*\]/, 'T_ATA_T')
          }


          let mmm =  msg.split(/[{}]/g)[1].split(',').map(x => '"' + x.split(':')[0].trim() + '" :' + (x.replace(/^.*:/, '').trim().match(/^[A-z]/)? '"'+x.replace(/^.*:/, '').trim()+'"' : x.replace(/^.*:/, '').trim())).join(',')

          // 把'T_ATA_T'替换为原来的数据
          if(aaa) {
            mmm = mmm.replace(/"T_ATA_T"/, '[' + aaa + ']')
          }

          this.uav_status[msg.split(' ')[1]] = JSON.parse('{' + mmm + '}')

          //console.log(this.uav_status)
        } catch (error) {
          console.log(error)
          console.log(msg)
        }
      }

    }
  }
</script>
