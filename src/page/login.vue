<template>
  <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
    <el-form-item label="账号" prop="username">
      <el-input type="password" v-model="ruleForm.username" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input type="password" v-model="ruleForm.password" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="login">提交</el-button>
    </el-form-item>
  </el-form>
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
      };
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.ruleForm.password !== '') {
            //this.$refs.ruleForm.validateField('password');
          }
          callback();
        }
      };
      return {
        ruleForm: {
          username: '',
          password: '',
          age: ''
        },
        rules: {
          username: [
            { validator: validateUser, trigger: 'blur' }
          ],
          password: [
            { validator: validatePass, trigger: 'blur' }
          ]
        }
      };
    },
    methods: {
      login() {
        //let api_url = "http://" + location.hostname + "/user/login"
        let api_url = this.$store.state.config.server + "/user/login"
        console.log(api_url)

        //this.$http.get(api_url)
        //this.$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
        //this.$http.defaults.headers.post['Access-Control-Request-Method'] = 'POST'
        //this.$http.defaults.headers.post['Access-Control-Request-Headers'] = 'X-PINGOTHER'
/*
        this.$http.create({
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "X-PINGOTHER"
        })
        */
        this.$http.get(api_url + "/" + this.ruleForm.username + "/" + this.ruleForm.password)
        .then((response) => {
          console.log(this)
          //this.update()
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
