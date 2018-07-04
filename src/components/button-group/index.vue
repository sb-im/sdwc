
<script>
import Terminal from './baseterminal.vue'

  export default {
    mixins: [Terminal],
    methods: {
      send(msg = this.message) {
        console.log(msg)
        this.ajaxSend(msg)
      },
      ajaxSend(msg) {
        //let url = location.protocol + "//" + location.host + "/config.json"
        let url = location.protocol + "//" + location.hostname + ":9292/" + msg
        console.log(url)
        this.$http.get(url)
        .then((response) => {

        })
        .catch((error) => {
          console.log(error)
        })
      }
    }
  }
</script>

