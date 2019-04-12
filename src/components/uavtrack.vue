<template>
  <div class="map" ref="map">

  </div>
</template>
<script>

  export default {
    data() {
      return {
        poly: null,
        map: null
      }
    },
    props: {
      flight: {
        type: Array,
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
        this.map = new google.maps.Map(this.$refs.map, {
          zoom: 20,
          center: point,
          mapTypeId: 'hybrid',
          streetViewControl: false
        });
        this.drawPath();
      },
      drawPath() {
        this.poly = new google.maps.Polyline({
          path: this.flight,
          geodesic: true,
          strokeColor: '#ff0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        this.poly.setMap(this.map);
      },
      redrawPath() {
        const mvcArray = this.poly.getPath();
        const start = mvcArray.getLength();
        if (start === 0) {
          this.map.setCenter(this.flight[0]);
        }
        for (let i = start === 0 ? start : start - 1; i < this.flight.length; i++) {
          mvcArray.push(new google.maps.LatLng(this.flight[i].lat, this.flight[i].lng));
        }
      },
      clearPath() {
        this.flight = [];
      }
    },
    watch: {
      flight() {
        this.redrawPath();
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
