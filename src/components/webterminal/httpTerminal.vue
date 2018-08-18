
<script>
import Terminal from './BaseTerminal.vue'

  export default {
    mixins: [Terminal],
    created() {
      this.hostname = this.address
    },
    methods: {
      send(msg = this.message) {
        console.log(msg)
        for (let button of this.buttons) {
          button.value == msg ? button.status = true : null
        }
        this.ajaxSend(msg)
      },
      ajaxSend(msg) {
        //console.log(this.auto_link ? ':' + this.port : '')

        let url = location.protocol + "//" + this.hostname + (this.auto_link ? ':' + this.port : '') + '/' + msg
        console.log(url)
        this.$http.get(url)
        .then((response) => {

          for (let button of this.buttons) {
            button.value == msg ? button.status = false : null
          }

          //console.log(response.request.response)
          //this.display(String(response.request.response))
          this.display(JSON.stringify(response.data, null, 2))

        })
        .catch((error) => {
          console.log(error)
        })
      }

    }
  }
</script>

