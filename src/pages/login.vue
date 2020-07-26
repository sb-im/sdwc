<template>
  <div class="login">
    <div class="login__bg">
      <img class="login__i" src="/assets/images/login-backgound.jpg" v-show="!showVideo">
      <video
        class="login__i"
        :src="video"
        muted
        autoplay
        loop
        v-show="showVideo"
        @canplay="showVideo = true"
      ></video>
    </div>
    <div class="login__form">
      <h1 class="login__title">S Dashboard Web Console</h1>
      <el-form label-width="80px" label-position="left">
        <el-form-item :error="errorUsername">
          <span slot="label" v-t="'login.username'"></span>
          <el-input ref="inputUsr" type="text" v-model="username" autofocus></el-input>
        </el-form-item>
        <el-form-item :error="errorPassword">
          <span slot="label" v-t="'login.password'"></span>
          <el-input ref="inputPwd" type="password" show-password v-model="password"></el-input>
        </el-form-item>
        <el-button type="primary" icon="el-icon-minus" @click="handleLogin" :loading="pending">
          <span v-t="'login.button'"></span>
        </el-button>
      </el-form>
    </div>
    <div class="login__footer">
      <a class="login__beian" href="http://www.beian.miit.gov.cn/">
        <i class="el-icon-document-checked"></i>
        {{ footerText }}
      </a>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'sd-login',
  inject: ['configurePromise'],
  data() {
    return {
      showVideo: false,
      username: '',
      errorUsername: '',
      password: '',
      errorPassword: '',
      pending: false
    };
  },
  computed: {
    ...mapState(['config']),
    video() {
      const i = Math.floor(Math.random() * 7);
      return `/assets/videos/aerial${i}-10s.mp4`;
    },
    footerText() {
      return this.config.beian;
    }
  },
  methods: {
    ...mapActions([
      'login'
    ]),
    async handleLogin() {
      this.$message.closeAll();
      if (!this.username) {
        this.errorUsername = this.$t('login.error_username');
      } else {
        this.errorUsername = '';
      }
      if (!this.password) {
        this.errorPassword = this.$t('login.error_password');
      } else {
        this.errorPassword = '';
      }
      if (this.errorUsername || this.errorPassword) return;
      this.pending = true;
      try {
        await this.login({ username: this.username, password: this.password });
        this.$router.push({ name: 'panel' });
      } catch (e) {
        this.$message.error(this.$t('login.failed'));
      }
      this.pending = false;
    }
  },
  mounted() {
    /**
     * `configurePromise`, provided by root Vue instance, in src/main.js ,
     * is the Promise returned by dispatching action `configure`.
     * Once it became fullfilled, `config.json` has been loaded.
     */
    this.configurePromise.then(() => {
      const { username = '', password = '' } = this.$route.params;
      if (username && password) {
        this.username = username;
        this.password = password;
        this.handleLogin();
      }
    });
    /** @type {HTMLInputElement} */
    const inputPwd = this.$refs.inputPwd.$el.getElementsByTagName('input')[0];
    if (inputPwd) {
      inputPwd.addEventListener('keypress', (ev) => {
        if (ev.keyCode === 13 || ev.key === 'Enter') {
          this.handleLogin();
        }
      });
    }
    /** @type {HTMLInputElement} */
    const inputUsr = this.$refs.inputUsr.$el.getElementsByTagName('input')[0];
    if (inputUsr) {
      inputUsr.addEventListener('keypress', (ev) => {
        if (ev.keyCode === 13 || ev.key === 'Enter') {
          if (this.password.length === 0 && inputPwd) {
            inputPwd.focus();
          } else {
            this.handleLogin();
          }
        }
      });
    }
  }
};
</script>

<style>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100vh;
}

.login__title {
  color: #409eff;
  margin: 0 -36px 20px;
  font-size: 26px;
  text-align: center;
  white-space: nowrap;
}

.login__form {
  padding: 36px;
  background: #fff9;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login__bg {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  position: fixed;
}

.login__i {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.login__footer {
  margin-top: calc(50vh - 130px);
  margin-bottom: 24px;
  height: 20px;
}

.login__beian {
  text-decoration: none;
  color: #606266;
  font-size: 14px;
}

.login__beian:hover {
  color: #409eff;
}
</style>
