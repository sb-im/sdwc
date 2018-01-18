<template>

      <fieldset class="layui-elem-field">
        <legend>操作控制</legend>
        <div class="layui-field-box">
          <div id="console">
            <div class="layui-row">
              <div align="right">
                  <button v-on:click="send()" class="layui-btn layui-btn-warm">初始化</button>
                  <button v-on:click="send()" class="layui-btn layui-btn-danger">停止</button>
              </div>
              <hr class="layui-bg-green">
              <div class="layui-col-sm12 layui-col-md4">
                <li v-for="cmd in commands" class="layui-inline layui-col-xs6 layui-col-sm6 layui-col-md6" style="margin-top: 20px;">
                  <button v-bind:onclick="['console.send(\'' + cmd.value + '\')']" class="layui-btn">{{ cmd.name }}</button>
                </li>
              </div>
              <div class="layui-col-sm12 layui-col-md8">
                <div>
                  <div class="layui-col-xs4 layui-col-sm4 layui-col-md4">
                    <input v-model="hostname" class="layui-input"/>
                  </div>
                  <div class="layui-col-xs4 layui-col-sm4 layui-col-md4">
                    <input v-model="port" class="layui-input"/>
                  </div>
                    <button v-on:click="close()" class="layui-btn">断开</button>
                  <div v-if="connect_status == 0" >
                    <button v-on:click="connect()" class="layui-btn">连接</button>
                  </div>
                  <div v-else>
                    <button v-on:click="close()" class="layui-btn">断开</button>
                  </div>
                </div>
                <div>
                  <div class="layui-col-xs6 layui-col-sm6 layui-col-md6">
                    <input v-model="message" class="layui-input"/>
                  </div>
                  <button v-on:click="send()" class="layui-btn">发送</button>
                <button v-on:click="clean()" class="layui-btn">清空内容</button>
                </div>
                <div>
                  <fieldset class="layui-elem-field layui-field-title">
                    <legend>来自服务端的消息</legend>
                  </fieldset>
                  <textarea rows="10" class="layui-textarea" readonly="readonly">{{ content }}</textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
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
