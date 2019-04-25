<template>
  <login-bg :videos="video" image="/assets/images/login-backgound.jpg">
    <template #header>
      <el-row type="flex" justify="space-around">
        <div class="login-bg">
          <h1 class="login-title">S Dashboard Web Console</h1>
          <el-form label-width="80px" label-position="left">
            <el-form-item :label="$t('login.username')" :error="errorUsername">
              <el-input type="text" v-model="username" autofocus></el-input>
            </el-form-item>
            <el-form-item :label="$t('login.password')" :error="errorPassword">
              <el-input
                ref="inputPwd"
                type="password"
                show-password
                v-model="password"
              ></el-input>
            </el-form-item>
            <el-button
              type="primary"
              icon="el-icon-minus"
              @click="handleLogin"
              :loading="pending"
            >{{ $t('login.button') }}</el-button>
          </el-form>
        </div>
      </el-row>
    </template>
  </login-bg>
</template>

<script>
import { mapActions } from 'vuex';
import VueLbgv from 'vue-lbgv';

export default {
  name: 'sd-login',
  data() {
    return {
      username: '',
      errorUsername: '',
      password: '',
      errorPassword: '',
      pending: false
    };
  },
  computed: {
    video() {
      return Array(7).fill(0).map((_, i) => `/assets/videos/aerial${i}-10s.mp4`);
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
  },
  components: {
    'login-bg': VueLbgv
  }
};
</script>

<style>
.login-title {
  color: #409eff;
  margin: 0 0 20px;
  font-size: 26px;
}

.login-bg {
  width: 320px;
  height: 230px;
  padding: 36px;
  background: #fff9;
}
</style>
