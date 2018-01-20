<template>
  <fieldset>
    <legend>操作控制</legend>
    <div align="right">
      <el-button @click="send" type="warning" plain>初始化</el-button>
      <el-button @click="send" type="danger" plain>停止</el-button>
    </div>
    <hr/>
    <el-row :gutter="20">
      <el-col :span="4">
        <div v-for="(cmd, i) in commands" v-if="!(i%2)" style="margin: 20px 0">
          <el-button type="success" plain @click="test(cmd.value)">{{ cmd.name }}</el-button>
        </div>
      </el-col>
      <el-col :span="4">
        <div v-for="(cmd, i) in commands" v-if="i%2" style="margin: 20px 0">
          <el-button type="success" plain v-bind:onclick="['console.send(\'' + cmd.value + '\')']">{{ cmd.name }}</el-button>
        </div>
      </el-col>

      <el-col :span="16">

        <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入主机名" v-model="hostname"/>
          </el-col>
          <el-col :span="8">
            <el-input placeholder="请输入端口" v-model="port"/>
          </el-col>
          <el-col :span="8">
            <el-button @click="connect" type="primary" plain>连接</el-button>
          </el-col>
        </el-row>
        <br/>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-input placeholder="请输入命令" v-model="message"/>
          </el-col>
          <el-col :span="3">
            <el-button @click="send(message)" type="success" plain>发送</el-button>
            {{ connect_status }}
            <el-button @click="close" type="success" plain>断开</el-button>
          </el-col>
          <el-col :span="9">
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
      test(msg = "23333333333333") {
        //console.log("###############")
        //console.log(msg)
        this.content = this.content + this.tarCmd(msg)
      },
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
            console.log(this)
            console.log(this.connect_status)
            var _this = this

          socket.onopen = function (msg) {
            console.log("连接成功！")
            console.log(socket.readyState)
            console.log(this.connect_status)
            console.log(this)

            _this.connect_status = socket.readyState
          }

          socket.onmessage = function (msg) {
            if (typeof msg.data == "string") {
              _this.test(msg.data)
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
        return cmd + '\n'
      },
      send(msg = this.message) {
        //alert(msg)
        this.socket.send(msg)
        console.log(msg)
        this.test(msg)
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
