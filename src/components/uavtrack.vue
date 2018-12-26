<template>
  <div class="map" ref="map">

  </div>
</template>
<script>

  export default {
    data() {
      return {

      }
    },
    props: {
      flight: {
        type: Array|Object,
        required: true,
        default: () => []
      }
    },
    mounted () {
      this.getGmap();
    },
    methods: {
      getGmap() {
        if (typeof google === 'undefined') {
          this.$jsonp(this.$store.state.api.remote.gMap, { key: this.$store.state.config.GMAP_API_KEY }).then(() => {
            this.initMap(this.flight[0]);
          }).catch(err => {
            console.log(err);
          });
        } else this.initMap(this.flight[0]);
      },
      initMap(point) {
        this.drawPath(new google.maps.Map(this.$refs.map, {
          zoom: 20,
          center: point,
          mapTypeId: 'terrain'
        }));
      },
      drawPath(map) {
        let flightPath = new google.maps.Polyline({
          path: this.flight,
          geodesic: true,
          strokeColor: '#ff0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        flightPath.setMap(map);
      },
      clearPath() {
        this.flight = [];
      }
    }
  }
</script>


<style>
  .map{
    width: 100%;
    height: 100%;
  }
</style>
