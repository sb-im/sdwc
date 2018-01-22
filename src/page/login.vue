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
      login() {
        let api_url = this.$store.state.config.server + "/user/login"

        // local User debug
        if (this.ruleForm.username == "debug" && this.ruleForm.password == "debug") {
          api_url = this.$store.state.config.server + "/user" + this.$store.state.config.suffix
        } else {
          api_url = api_url + "/" + this.ruleForm.username + "/" + this.ruleForm.password
        }
        console.log(api_url)
        this.getLogin(api_url)
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
