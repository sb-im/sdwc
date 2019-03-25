<template>
  <fieldset>
    <legend>操作控制</legend>
    <div align="right">
      <el-button @click="send" type="warning" plain>初始化</el-button>
      <el-button @click="send" type="danger" plain>停止</el-button>
    </div>
    <hr/>
    <el-row :gutter="20">
      <command :commands=buttons @cmd-send="send"/>

      <el-col :xs="24" :sm="24" :md="12" :lg="14" :xl="16">

        <el-row :gutter="20" v-if="auto_link">
          <el-col :xs="9" :sm="10" :md="9" :lg="10" :xl="8">
            <el-input placeholder="请输入主机名" v-model="hostname"/>
          </el-col>
          <el-col :xs="9" :sm="10" :md="9" :lg="10" :xl="8">
            <el-input placeholder="请输入端口" v-model="port"/>
          </el-col>
          <el-col :xs="6" :sm="4" :md="6" :lg="4" :xl="8">
            <div v-if="!connect_status" >
              <el-button @click="create" type="primary" plain>连接</el-button>
            </div>
            <div v-else>
              <el-button @click="destroy" type="success" plain>断开</el-button>
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
          id="msgdisplay"
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
import Command from '../webterminal/command.vue'

  export default {
    data() {
      return {
        hostname: location.hostname,
        port: '22333',
        message: 'hello',
        content: '',
        buttons: [],
        auto_link: false,
        connect_status: false,
        display_tmp: ''
      }
    },
    props: {
      commands: {
        type: Array,
        default: Array
      },
      address: {
        type: String,
        default: location.hostname
      },
      autolf: {
        type: Boolean,
        default: true
      }
    },
    created() {
      this.buttons = this.commands.map(item => Object.assign({status: false}, item))
      //console.log(this.commands)
      this.address == location.hostname ? this.auto_link = true : this.create(this.address)
    },
    beforeDestroy() {
      this.destroy()
      //console.log("stop")
    },
    methods: {
      // C: create, R: display, U: send, D: destroy
      create(/*address='localhost'*/) {
        this.connect_status = true
      },
      destroy() {
        this.connect_status = false
      },
      send(msg = this.message) {
        //console.log(msg)
        this.display(msg)
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
        this.content += msg+ "\n"

        // Auto scrollTop
        document.getElementById("msgdisplay").scrollTop = document.getElementById("msgdisplay").scrollTopMax
      },
      clean() {
        this.content = ""
      }

    },
    components: {
      'command': Command
    }

  }
</script>

