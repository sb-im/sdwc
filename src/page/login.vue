<template>
  <el-form :model="ruleForm2" status-icon :rules="rules2" ref="ruleForm2" label-width="100px" class="demo-ruleForm">
    <el-form-item label="账号" prop="user">
      <el-input type="password" v-model="ruleForm2.user" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="pass">
      <el-input type="password" v-model="ruleForm2.pass" auto-complete="off"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="login">提交</el-button>
      <!--<el-button type="primary" @click="submitForm('ruleForm2')">提交</el-button>-->
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
          if (this.ruleForm2.checkPass !== '') {
            this.$refs.ruleForm2.validateField('checkPass');
          }
          callback();
        }
      };
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.ruleForm2.checkPass !== '') {
            this.$refs.ruleForm2.validateField('checkPass');
          }
          callback();
        }
      };
      return {
        ruleForm2: {
          user: '',
          pass: '',
          checkPass: '',
          age: ''
        },
        rules2: {
          user: [
            { validator: validateUser, trigger: 'blur' }
          ],
          pass: [
            { validator: validatePass, trigger: 'blur' }
          ]
        }
      };
    },
    methods: {
      login() {
        let api_url = "http://" + location.hostname + "/user/login"
        console.log(api_url)

        //console.log(store.state.count)
        this.$store.commit('increment')
        this.$store.state.count = 555

        console.log(this.$store.state.count)

        this.$http.get(api_url)
        .then(function (response) {
          //console.log(_this.aaa)
          console.log(response.data)
          //_this.items = response.data
        })
        .catch(function (error) {
          console.log(error)
        })
      },
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            alert('submit!');
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }
    }
  }
</script>
