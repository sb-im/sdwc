<template>
  <div class="login">
    <div class="login-bg">
      <img v-show="!videoCanPlay" class="login-img" src="/static/login-backgound.jpg">
      <video v-show="videoCanPlay" @canplay="videoCanPlay = true" class="login-video" :src="video" muted autoplay loop></video>
    </div>
    <div class="login-form">
      <h1 class="title font-26">SDWC-LOGIN</h1>
      <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item :label="$t('login.username')" prop="username">
          <el-input type="text" v-model="ruleForm.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('login.password')" prop="password">
          <el-input type="password" v-model="ruleForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">{{ $t('login.button') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  import mqttClient from '../config/mqtt';

  export default {
    data() {
      var validateUser = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('login.error_username')));
        } else {
          if (this.ruleForm.username !== '') {
            //this.$refs.ruleForm.validateField('username');
          }
          callback();
        }
      }
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error(this.$t('login.error_password')));
        } else {
          if (this.ruleForm.password !== '') {
            //this.$refs.ruleForm.validateField('password');
          }
          callback();
        }
      }
      return {
        video: '',
        videoCanPlay: false,
        ruleForm: {
          username: '',
          password: ''
        },
        rules: {
          username: [
            { validator: validateUser, trigger: 'blur' }
          ],
          password: [
            { validator: validatePass, trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      const i = Math.floor(Math.random() * 7);
      this.video = `/static/aerial${i}-10s.mp4`;
    },
    methods: {
      login() {
        // local User debug
        if (this.ruleForm.username == "debug" && this.ruleForm.password == "debug") {
          this.getLogin(this.$store.state.api.local.debug)
        } else {
          // remote user login
          this.postLogin(this.$store.state.api.local.login)
        }
      },
      getLogin(api_url) {
        this.$http.get(api_url)
        .then((response) => {
          this.$store.commit("token", response.data)
          if (response.data.token) {
            this.$router.push('app')
          }
        })
        .catch((error) => {
          console.log(error)
        })
      },
      postLogin(api_url) {
        this.$http.post(api_url, {
          client_id: this.$store.state.config.client_id,
          client_secret: this.$store.state.config.client_secret,
          username: this.ruleForm.username,
          password: this.ruleForm.password,
          //username: 'sb@sb.im',
          //password: '123456',
          grant_type: 'password'
        })
        .then((response) => {
          if (response.data.access_token) {
            const token = response.data.token_type + ' ' + response.data.access_token;
            this.$store.commit('token', {token});
            this.$http = axios.create({
              headers: {Authorization: token}
            });
            this.$router.push('app');
            this.$store.dispatch('getSideMenu',{_this: this,type:'plans'});
            this.$http.get(this.$store.state.api.local.user).then(res => {
              this.$store.commit('userInfo', res.data);
              mqttClient.setIdPrefix(res.data.id);
              mqttClient.connect(this.$store.state.config.mqtt_url);
            }).then(() => {
              this.$store.dispatch('getSideMenu',{_this: this,type:'nodes'})
                .then(() => {
                  this.$store.state.nodes.forEach(n => {
                    mqttClient.subscribeNode(n.id);
                  });
                  this.$store.dispatch('subscribeNodeStatus');
                });
            })
          }
        })
        .catch(() => {
          this.$message.error(this.$t('login.failed'));
        });
      }

    }
  }
</script>
<style scoped>
  .login {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .title {
    color: #409eff;
    margin: 20px auto;
    text-align: center;
  }
  .login-bg {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    position: fixed;
  }
  .login-img,
  .login-video {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  .login-form {
    widows: 325px;
    padding: 20px;
    background: #fff9;
  }
</style>
