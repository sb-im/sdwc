
<script>
import Terminal from './BaseTerminal.vue'

  export default {
    mixins: [Terminal],
    methods: {
      create(address =  (location.protocol == "https:" ? "wss://" : "ws://") + this.hostname + ":" + this.port + "/") {
        this.$emit('connect', address)
        this.connect_status = true
      },
      destroy() {
        this.$emit('close')
        this.connect_status = false
      },
      send(msg = this.message) {
        console.log(msg)
        this.$emit('send', msg)
        this.display(msg)
      }

    }
  }
</script>

