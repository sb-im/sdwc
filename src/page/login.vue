<template>
  <div class="background">
    <div class="login-bg">
      <h1 class="hhh">SDWC</h1>

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
  export default {
    data() {
      var validateUser = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please enter the username'));
        } else {
          if (this.ruleForm.username !== '') {
            //this.$refs.ruleForm.validateField('username');
          }
          callback();
        }
      }
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('Please enter the password'));
        } else {
          if (this.ruleForm.password !== '') {
            //this.$refs.ruleForm.validateField('password');
          }
          callback();
        }
      }
      return {
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
    methods: {
      login() {
        // local User debug
        if (this.ruleForm.username == "debug" && this.ruleForm.password == "debug") {
          this.getLogin(this.$store.state.api.debug)
        } else {
          // remote user login
          this.postLogin(this.$store.state.api.login)
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
            //console.log(response.data.token_type + ' ' + response.data.access_token)
            this.$http.create().defaults.headers.common['Authorization'] = response.data.token_type + ' ' + response.data.access_token
            this.$router.push('app')
          }
        })
        .catch((error) => {
          console.log(error)
        })
      }

    }
  }
</script>
<style scoped>
  .hhh {
    color: #409EFF;
  }

  .login-bg {
    text-align: center;
    border-radius: 5px;
    background: #fff9;
    width: 30%;
    padding: 2% 2%;
    margin:10% auto;
  }

  .background {
    background: url(../assets/login-backgound.jpg);
    background-repeat: repeat-x;
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
    position: absolute;
  }
</style>
