<template>
  <fieldset>
    <legend>操作控制</legend>
    <div align="right">
      <el-button @click="" type="primary" plain>获取Items信息</el-button>
      <el-button @click="send" type="warning" plain>初始化</el-button>
      <el-button @click="send" type="danger" plain>停止</el-button>
    </div>
    <hr/>
    <el-row :gutter="20" type="flex" justify="end">
      <el-col :span="8">
        <div :span="4" v-for="cmd in commands">
          <el-button type="success" plain v-bind:onclick="['console.send(\'' + cmd.value + '\')']">{{ cmd.name }}</el-button>

        </div>
      </el-col>
      <el-col :span="16">
        <div>
          <el-input v-model="hostname">
            <el-button slot="append" @click="test" icon="el-icon-search"></el-button>
          </el-input>
          <el-input v-model="hostname">
            <el-button slot="append" @click="test" icon="el-icon-search"></el-button>
            <el-button slot="append" @click="test" icon="el-icon-search"></el-button>
          </el-input>
          <el-input
              type="textarea"
              :rows="2"
              readonly
              placeholder="请输入内容"
              v-model="content">
          </el-input>
        </div>

      </el-col>
    </el-row>

  </fieldset>

</template>

<script>

  export default {
    data() {
      return {
        commands: [
          { name: '打开舱门～ | ω・´) ～', value: 'door_up' },
          { name: '关闭舱门～ (＾o＾)ﾉ ～', value: 'door_down' },
          { name: '平台上升～ (°ー°〃) ～', value: 'plat_up' },
          { name: '平台下降～ ( ;´д`) ～', value: 'plat_down' },
          { name: '固定开始～ (・∀・) ～', value: 'fix_up' },
          { name: '固定解除～ (*´д`) ～', value: 'fix_down' },
          { name: '电池开锁～ (*ﾟーﾟ) ～', value: 'lock_up' },
          { name: '电池锁定～ (・∀・) ～', value: 'lock_down' },
          { name: '电池前进～ (╬ﾟдﾟ) ～', value: 'push_up' },
          { name: '电池后退～ (￣∇￣) ～', value: 'push_down' },
          { name: '电池上升～ (>д<) ～', value: 'battery_up' },
          { name: '电池下降～(((　ﾟдﾟ)))～', value: 'battery_down' },
          { name: '顺时对准～ ( ☉д⊙) ～', value: 'roate_up' },
          { name: '顺时离开～(￣皿￣)～', value: 'roate_down' },
          { name: '逆时离开～ 唔喵 ～', value: 're_roate_down' },
          { name: '全部停止～ Σ( ﾟдﾟ) ～', value: 'stop_all' },
          { name: '测试 ～ (〃∀〃) ～', value: 'test' }
        ],
        hostname: window.location.hostname,
        port: '22333',
        message: 'hello',
        connect_status: false,
        content: '',
        socket: Object

      }
    },
    props: {
      source: {
        type: String,
        default: 'vertical'
      }
    },
    methods: {
      test() {
        console.log("233333333333333")
      },
      connect() {
        //alert(this.hostname + ':' + this.port)
        var host = "ws://" + this.hostname + ":" + this.port + "/"
        this.socket = new WebSocket(host)
        var socket = this.socket
        try {
            console.log(this)
            console.log(this.connect_status)
            var _this = this

          socket.onopen = function (msg) {
            //$("btnConnect").disabled = true;
            //alert("连接成功！")
            console.log("连接成功！")
            console.log(socket.readyState)
            console.log(this.connect_status)
            console.log(this)

            _this.connect_status = socket.readyState
          }

          socket.onmessage = function (msg) {
            if (typeof msg.data == "string") {
              console.log(msg.data)
            }
            else {
              alert("非文本消息");
            }
          }

          socket.onclose = function (msg) {
            //alert("socket closed!")
            console.connect_status = false
          }
        }
        catch (ex) {
          //log(ex)
          alert(ex)
        }
      },
      send(msg = this.message) {
        //alert(msg)
        this.socket.send(msg)
        console.log(msg)
      },
      close: function () {
        try {
          this.socket.close()
          this.socket = null
        }
        catch (ex) {
          alert(ex)
        }
      },
      clean: function () {
        this.content = ""
      }
    }


  }

</script>
