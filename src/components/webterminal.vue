<template>
  <fieldset>
    <legend>操作控制</legend>
    <div align="right">
      <el-button @click="send" type="warning" plain>初始化</el-button>
      <el-button @click="send" type="danger" plain>停止</el-button>
    </div>
    <hr/>
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="10" :xl="8">
        <div v-for="(cmd, i) in commands">
          <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" style="margin: 12px 0">
            <el-button type="success" plain @click="send(cmd.value)">{{ cmd.name }}</el-button>
          </el-col>
        </div>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="14" :xl="16">

        <el-row :gutter="20">
          <el-col :xs="9" :sm="10" :md="9" :lg="10" :xl="8">
            <el-input placeholder="请输入主机名" v-model="hostname"/>
          </el-col>
          <el-col :xs="9" :sm="10" :md="9" :lg="10" :xl="8">
            <el-input placeholder="请输入端口" v-model="port"/>
          </el-col>
          <el-col :xs="6" :sm="4" :md="6" :lg="4" :xl="8">
            <div v-if="connect_status == 0" >
              <el-button @click="connect" type="primary" plain>连接</el-button>
            </div>
            <div v-else>
              <el-button @click="close" type="success" plain>断开</el-button>
            </div>
          </el-col>
        </el-row>
        <br/>

        <el-row :gutter="20">
          <el-col :xs="12" :sm="14" :md="12" :lg="12" :xl="12">
            <el-input placeholder="请输入命令" v-model="message"/>
          </el-col>
          <el-col :xs="4" :sm="4" :md="4" :lg="3" :xl="3">
            <el-button @click="send(message)" type="success" plain>发送</el-button>
          </el-col>
          <el-col :xs="8" :sm="6" :md="8" :lg="9" :xl="9">
            <el-button @click="clean" type="danger" plain>清空内容</el-button>
          </el-col>
        </el-row>


        <br/>
        <br/>
        <hr/>
        <el-input
            type="textarea"
            :rows="8"
            readonly
            placeholder="来自服务器的消息"
            v-model="content">
        </el-input>

      </el-col>
    </el-row>

  </fieldset>

</template>

<script>
import Command from './command.json'

  export default {
    data() {
      return {
        commands: Command,
        hostname: location.hostname,
        port: '22333',
        message: 'hello',
        connect_status: false,
        content: '',
        display_tmp: '',
        socket: Object

      }
    },
    props: {
      source: {
        type: String,
        default: 'vertical'
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
    methods: {
      connect() {
        // 关于这个函数他为什么好使我也没看明白
        // 反正改了就不好使了
        // javascript基础不好不知道怎么改才是优雅的实现

        // console.log("###############")
        //alert(this.hostname + ':' + this.port)
        var host = "ws://" + this.hostname + ":" + this.port + "/"
        this.socket = new WebSocket(host)
        var socket = this.socket
        try {
            //console.log(this)
            //console.log(this.connect_status)
            var _this = this

          socket.onopen = function (msg) {
            //console.log("连接成功！")
            //console.log(socket.readyState)
            //console.log(this.connect_status)
            //console.log(this)

            _this.connect_status = socket.readyState
          }

          socket.onmessage = function (msg) {
            if (typeof msg.data == "string") {
              _this.msg(msg.data)
            } else {
              alert("非文本消息");
            }
          }

          socket.onclose = function (msg) {
            //alert("socket closed!")
            _this.connect_status = false
          }
        }
        catch (ex) {
          //log(ex)
          alert(ex)
        }
      },
      tarCmd(cmd) {
        //return cmd + '\n'
        return cmd
      },
      msg(msg) {
        if (this.autolf) {
          this.display(msg)
        } else {
          this.pInfo(msg)
        }
      },
      pInfo(msg) {
        this.display_tmp += msg
        if (this.display_tmp.indexOf("\n") != -1) {
          this.display(this.display_tmp)
          this.display_tmp = ''
        }
      },
      display(msg = "Not Content") {
        //console.log(msg)
        this.content += this.tarCmd(msg+ "\n")
      },
      send(msg = this.message) {
        //alert(msg)
        this.socket.send(msg)
        console.log(msg)
        this.display(msg)
      },
      close() {
        try {
          this.socket.close()
          this.socket = null
        }
        catch (ex) {
          alert(ex)
        }
      },
      clean() {
        this.content = ""
      }
    }


  }

</script>
