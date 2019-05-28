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
        <el-form-item :label="$t('login.username')" :error="errorUsername">
          <el-input type="text" v-model="username" autofocus></el-input>
        </el-form-item>
        <el-form-item :label="$t('login.password')" :error="errorPassword">
          <el-input ref="inputPwd" type="password" show-password v-model="password"></el-input>
        </el-form-item>
        <el-button
          type="primary"
          icon="el-icon-minus"
          @click="handleLogin"
          :loading="pending"
        >{{ $t('login.button') }}</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'sd-login',
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
    video() {
      const i = Math.floor(Math.random() * 7);
      return `/assets/videos/aerial${i}-10s.mp4`;
    }
  },
  methods: {
    ...mapActions([
      'login'
    ]),
    async handleLogin() {
      if (!this.username) {
        this.errorUsername = this.$t('login.error_username');
      } else {
        this.errorUsername = '';
      }
      if (!this.password) {
        this.errorPassword = this.$t('login.error_username');
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
    /** @type {HTMLInputElement} */
    const inputPwd = this.$refs.inputPwd.$el.getElementsByTagName('input')[0];
    if (inputPwd) {
      inputPwd.addEventListener('keypress', (ev) => {
        if (ev.keyCode === 13 || ev.key === 'Enter') {
          this.handleLogin();
        }
      });
    }
  }
};
</script>

<style>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.login__title {
  color: #409eff;
  margin: 0 0 20px;
  font-size: 26px;
  text-align: center;
}

.login__form {
  width: 320px;
  height: 230px;
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
</style>
