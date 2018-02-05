<template>
  <div class="background">
    <el-row :gutter="10" type="flex" justify="center">
      <el-col :xs="22" :sm="14" :md="12" :lg="8" :xl="6" class="login-bg">
        <el-row :gutter="10" type="flex" justify="center">
          <el-col :xs="24" :sm="22" :md="22" :lg="18" :xl="18">

            <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
              <el-form-item label="账号" prop="username">
                <el-input type="text" v-model="ruleForm.username" auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="ruleForm.password" auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="login">提交</el-button>
              </el-form-item>
            </el-form>

          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>
<script>
  export default {
    data() {
      var validateUser = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入账号'));
        } else {
          if (this.ruleForm.username !== '') {
            //this.$refs.ruleForm.validateField('username');
          }
          callback();
        }
      }
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
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
      test() {
        let api_url = this.$store.state.config.server + "/user/index/"
        this.$http.get(api_url)
        .then((response) => {
          console.log(response.data)
        })
        .catch((error) => {
          console.log(error)
        })
      },
      login() {
        let api_url = this.$store.state.config.server + "/user/login"

        // local User debug
        if (this.ruleForm.username == "debug" && this.ruleForm.password == "debug") {
          api_url = this.$store.state.config.server + "/user" + this.$store.state.config.suffix
          this.getLogin(api_url)
        } else {
          // remote user login

          //api_url = api_url + "/" + this.ruleForm.username + "/" + this.ruleForm.password
          api_url = this.$store.state.config.server + "/oauth/token/"
          this.postLogin(api_url)
        }
      },
      getLogin(api_url) {

        this.$http.get(api_url)
        .then((response) => {
          console.log(this)
          console.log(response.data)
          //this.$store.state.config.token = response.data.token
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
        //username: this.ruleForm.username,
        //password: this.ruleForm.password,
        username: 'sb@sb.im',
        password: '123456',
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
  .login-bg {
    border-radius: 4px;
    background: #fff9;
    margin: 200px 0px;
    padding: 120px 0px;
  }

  .background {
    height: 100%;
    background: url(../assets/login.jpg);
    width:100%;
    height:100%;
    background-size:100% 100%;
    position:absolute;
  }
</style>
